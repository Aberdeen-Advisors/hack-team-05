import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ConfidentialClientApplication } from "@azure/msal-node";

type GraphDriveItem = {
  id: string;
  name: string;
  webUrl: string;
  eTag: string;
  lastModifiedDateTime: string;
  size?: number;
  folder?: unknown;
  file?: { mimeType?: string };
  parentReference?: { path?: string };
};

function requiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

let _client: Client | null = null;

async function getGraphClient(): Promise<Client> {
  if (_client) return _client;
  const tenantId = requiredEnv("MS_GRAPH_TENANT_ID");
  const clientId = requiredEnv("MS_GRAPH_CLIENT_ID");
  const clientSecret = requiredEnv("MS_GRAPH_CLIENT_SECRET");

  const cca = new ConfidentialClientApplication({
    auth: {
      clientId,
      authority: `https://login.microsoftonline.com/${tenantId}`,
      clientSecret,
    },
  });

  _client = Client.init({
    authProvider: async (done) => {
      try {
        const result = await cca.acquireTokenByClientCredential({
          scopes: ["https://graph.microsoft.com/.default"],
        });
        if (!result?.accessToken) throw new Error("no access token");
        done(null, result.accessToken);
      } catch (err) {
        done(err as Error, null);
      }
    },
  });

  return _client;
}

/**
 * Walk the Armory folder in SharePoint. Yields every non-folder drive item recursively.
 * Requires SHAREPOINT_SITE_ID + SHAREPOINT_ARMORY_FOLDER_PATH.
 * folder path is relative to the drive root, e.g., "Pursuit Armory" or "Sales/RFP Assets".
 */
export async function* walkArmory(): AsyncGenerator<GraphDriveItem> {
  const client = await getGraphClient();
  const siteId = requiredEnv("SHAREPOINT_SITE_ID");
  const rootPath = requiredEnv("SHAREPOINT_ARMORY_FOLDER_PATH").replace(
    /^\/+|\/+$/g,
    "",
  );

  const queue: string[] = [`/sites/${siteId}/drive/root:/${rootPath}:/children`];

  while (queue.length) {
    const url = queue.shift()!;
    let next: string | undefined = url;
    while (next) {
      // The first iteration uses a relative api path; subsequent nextLinks are absolute.
      const req: unknown = next.startsWith("http")
        ? client.api(next)
        : client.api(next);
      const page = (await (req as { get(): Promise<unknown> }).get()) as {
        value: GraphDriveItem[];
        "@odata.nextLink"?: string;
      };
      for (const item of page.value) {
        if (item.folder) {
          queue.push(`/sites/${siteId}/drive/items/${item.id}/children`);
        } else {
          yield item;
        }
      }
      next = page["@odata.nextLink"];
    }
  }
}

/** Download a drive item's content as a Buffer. */
export async function downloadDriveItem(driveItemId: string): Promise<Buffer> {
  const client = await getGraphClient();
  const siteId = requiredEnv("SHAREPOINT_SITE_ID");
  const stream = (await client
    .api(`/sites/${siteId}/drive/items/${driveItemId}/content`)
    .getStream()) as NodeJS.ReadableStream;
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
