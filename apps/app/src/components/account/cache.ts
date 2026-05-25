import type { QueryClient } from "@tanstack/react-query";
import { accountQueryKeys } from "./query-keys";
import type { CurrentSessionState, DeviceAccount, SessionUser } from "./types";

type MeState = {
  user: SessionUser | null;
};

export function updateAccountUserCaches(
  queryClient: QueryClient,
  user: SessionUser | null,
) {
  queryClient.setQueryData<MeState>(accountQueryKeys.me, { user });

  queryClient.setQueryData<CurrentSessionState>(
    accountQueryKeys.meSidebar,
    (previous) => {
      const userId = user?.id ?? previous?.userId ?? null;
      return {
        user,
        userId,
      };
    },
  );

  queryClient.setQueryData<DeviceAccount[]>(
    accountQueryKeys.deviceAccountsSidebar,
    (previous) => {
      if (!previous || !user) return previous;
      const userId = String(user.id || "").trim();
      const nextName = String(user.name || "").trim();
      const nextImage = typeof user.image === "string" ? user.image : "";

      return previous.map((account) => {
        const isCurrentAccount =
          account.isCurrent || (!!userId && account.userId === userId);
        if (!isCurrentAccount) return account;

        return {
          ...account,
          name: nextName || account.name,
          image: nextImage || account.image,
        };
      });
    },
  );
}
