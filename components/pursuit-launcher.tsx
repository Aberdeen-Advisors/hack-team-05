"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { FileText, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
    <Card className="p-6">
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border p-10 text-center transition-colors",
          isDragActive && "border-verdigris bg-verdigris/5",
          file && "border-aberdeen-blue bg-aberdeen-blue/5",
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <>
            <FileText className="h-8 w-8 text-aberdeen-blue" />
            <p className="text-sm font-medium text-aberdeen-blue">
              {file.name}
            </p>
            <p className="text-xs text-onyx">
              {(file.size / 1024 / 1024).toFixed(2)} MB · click to replace
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-verdigris" />
            <p className="text-sm font-medium text-aberdeen-blue">
              Drop the RFP here, or click to browse
            </p>
            <p className="text-xs text-onyx">PDF, DOCX, or TXT · up to {MAX_MB}MB</p>
          </>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-aberdeen-blue">
            Opportunity name
            <span className="ml-1 text-xs font-normal text-onyx">
              (optional)
            </span>
          </label>
          <Input
            placeholder="e.g., Bububemon ERP Modernization"
            value={opportunityName}
            onChange={(e) => setOpportunityName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-aberdeen-blue">
            Client name (will be anonymized in outputs)
            <span className="ml-1 text-xs font-normal text-onyx">
              (optional)
            </span>
          </label>
          <Input
            placeholder="e.g., Bububemon Inc."
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <Button
          size="lg"
          disabled={!canSubmit}
          onClick={submit}
          className="bg-aberdeen-blue text-white hover:bg-aberdeen-blue/90"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Preparing pursuit…
            </>
          ) : (
            "Analyze Opportunity"
          )}
        </Button>
      </div>
    </Card>
  );
}
