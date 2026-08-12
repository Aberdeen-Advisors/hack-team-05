import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { EngineState } from "@/components/workspace";

export function StreamingHint({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-onyx">
      <Loader2 className="h-4 w-4 animate-spin text-verdigris" />
      Streaming {label}…
    </div>
  );
}

export function PendingCard({ label }: { label: string }) {
  return (
    <Card className="p-6 text-sm text-onyx/60">
      {label} will start once the upstream engines finish.
    </Card>
  );
}

export function ErrorCard({ error }: { error: string }) {
  return (
    <Card className="border-jasper/40 bg-jasper/5 p-6 text-sm text-jasper">
      Engine error: {error}
    </Card>
  );
}

/** Common gating that every tab needs before rendering its result. */
export function tabView<T>(state: EngineState<T>) {
  if (state.status === "pending")
    return { kind: "pending" as const };
  if (state.status === "error")
    return { kind: "error" as const, error: state.error ?? "unknown error" };
  const data = (state.result ?? state.partial) as Partial<T> | undefined;
  const isStreaming = state.status === "running";
  return { kind: "ok" as const, data, isStreaming };
}

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-widest text-verdigris">
      {children}
    </h2>
  );
}
