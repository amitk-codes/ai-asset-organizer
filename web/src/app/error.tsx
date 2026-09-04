"use client";

import { ErrorState } from "@/components/error-state";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-6">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred while rendering this page."
        onRetry={reset}
      />
    </div>
  );
}
