"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { ArrowRight, FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_MB = 40;

export function PursuitLauncher() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [opportunityName, setOpportunityName] = useState("");
  const [clientName, setClientName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onDrop = useCallback((accepted: File[]) => {
    const first = accepted[0];
    if (!first) return;
    if (first.size > MAX_MB * 1024 * 1024) {
      toast.error(`File is larger than ${MAX_MB}MB.`);
      return;
    }
    setFile(first);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt", ".md"],
    },
  });

  const canSubmit = useMemo(
    () => !!file && !submitting,
    [file, submitting],
  );

  async function submit() {
    if (!file) return;
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      if (opportunityName) form.append("opportunityName", opportunityName);
      if (clientName) form.append("clientName", clientName);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { pursuitId: string };
      router.push(`/workspace/${data.pursuitId}`);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to start");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-3xl border-2 border-aberdeen-blue/25 bg-background p-8 shadow-[0_18px_44px_-24px_rgba(9,55,95,0.25)] sm:p-10">
      <div className="flex flex-col gap-8">
        {/* Opportunity name */}
        <Field
          label="Opportunity name"
          hint="something recognizable to your team"
        >
          <Input
            placeholder="e.g., Bububemon ERP Modernization"
            value={opportunityName}
            onChange={(e) => setOpportunityName(e.target.value)}
            className="h-12 border-2 border-aberdeen-blue/30 bg-background text-base text-aberdeen-blue placeholder:text-onyx/50 focus-visible:border-aberdeen-blue focus-visible:ring-verdigris/40"
          />
        </Field>

        {/* Client name */}
        <Field
          label="Client name"
          hint="optional — anonymized in every output"
        >
          <Input
            placeholder="e.g., Bububemon Inc."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="h-12 border-2 border-aberdeen-blue/30 bg-background text-base text-aberdeen-blue placeholder:text-onyx/50 focus-visible:border-aberdeen-blue focus-visible:ring-verdigris/40"
          />
        </Field>

        {/* RFP document — the big obvious upload */}
        <Field
          label="RFP document"
          hint={`PDF, DOCX, or TXT · max ${MAX_MB} MB`}
        >
          <div
            {...getRootProps()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-aberdeen-blue/45 bg-muted/40 py-14 text-center transition-colors",
              isDragActive && "border-verdigris bg-verdigris/[0.08]",
              file && "border-aberdeen-blue bg-aberdeen-blue/[0.06]",
            )}
          >
            <input {...getInputProps()} />
            {file ? (
              <>
                <FileText
                  className="h-7 w-7 text-aberdeen-blue"
                  strokeWidth={1.75}
                />
                <p className="text-base font-semibold text-aberdeen-blue">
                  {file.name}
                </p>
                <p className="text-xs font-medium text-onyx/75">
                  {(file.size / 1024 / 1024).toFixed(2)} MB · click to replace
                </p>
              </>
            ) : (
              <>
                <Upload
                  className="h-7 w-7 text-aberdeen-blue"
                  strokeWidth={1.75}
                />
                <p className="text-lg font-semibold text-aberdeen-blue">
                  Drag file here or browse
                </p>
                <p className="text-xs font-medium text-onyx/75">
                  Drop the RFP anywhere in this box
                </p>
              </>
            )}
          </div>
        </Field>
      </div>

      {/* Footer with CTA */}
      <div className="mt-10 flex items-center justify-between border-t-2 border-aberdeen-blue/15 pt-6">
        <p className="max-w-md text-xs font-medium text-onyx/80">
          Every claim about Aberdeen is grounded in a citation chip that opens
          the source Armory doc. Client names are anonymized in every output.
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full bg-aberdeen-blue px-6 py-3 text-sm font-semibold text-white transition-colors",
            !canSubmit && "cursor-not-allowed opacity-40",
            canSubmit && "hover:bg-verdigris hover:text-white",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing pursuit
            </>
          ) : (
            <>
              Analyze Opportunity
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className="text-lg font-bold text-aberdeen-blue">{label}</span>
        {hint && (
          <span className="text-sm font-medium text-onyx/75">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}
