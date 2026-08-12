import { SiteHeader } from "@/components/site-header";
import { Workspace } from "@/components/workspace";
import { loadPursuit } from "@/lib/pursuit/store";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pursuit = await loadPursuit(id);
  if (!pursuit) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 py-8">
        <Workspace pursuit={pursuit} />
      </main>
    </div>
  );
}
