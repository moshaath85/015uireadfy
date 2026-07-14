import type { AuthGuardResult } from "@/lib/auth/auth-types";

interface AdminAccessNoticeProps {
  readonly guardResult: AuthGuardResult;
}

export function AdminAccessNotice({ guardResult }: AdminAccessNoticeProps) {
  if (guardResult.allowed) {
    return null;
  }

  return null;
}
