"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateInquiryStatus } from "@/app/admin/actions";
import type { InquiryStatus } from "@/lib/database.types";

export default function InquiryStatusSelect({ id, status }: { id: string; status: InquiryStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value as InquiryStatus;
        startTransition(async () => {
          await updateInquiryStatus(id, value);
          router.refresh();
        });
      }}
      className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
    >
      <option value="new">New</option>
      <option value="contacted">Contacted</option>
      <option value="closed">Closed</option>
    </select>
  );
}
