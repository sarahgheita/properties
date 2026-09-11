"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ReviewActions({
  onApprove,
  onReject,
}: {
  onApprove: () => Promise<{ error?: string; success?: boolean }>;
  onReject: (reason: string) => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    startTransition(async () => {
      const res = await onApprove();
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      setError("Add a short reason so the poster knows what to fix.");
      return;
    }
    startTransition(async () => {
      const res = await onReject(reason);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {!showReject ? (
        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={pending}
            className="rounded-md bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {pending ? "Working…" : "Approve & publish"}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={pending}
            className="rounded-md border border-[var(--danger)] px-4 py-2 text-sm font-medium text-[var(--danger)]"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being rejected? (shown to the poster)"
            rows={2}
            className="w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
          />
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={pending}
              className="rounded-md bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Working…" : "Confirm reject"}
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
