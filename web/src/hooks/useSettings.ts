"use client";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { api } from "@/lib/api";

export type UserSettings = {
  autoPayouts: boolean;
  payoutInterval: "daily" | "weekly" | "monthly" | "manual";
  emailNotifications: boolean;
};

export function useSettings() {
  const key = `/v1/settings/me`;
  return useSWR<UserSettings>(key, async () => {
    const { data } = await api.get(key);
    return data.settings as UserSettings;
  });
}

export function useUpdateSettings() {
  const key = `/v1/settings/me`;
  const { trigger, isMutating } = useSWRMutation(
    key,
    async (_: string, { arg }: { arg: Partial<UserSettings> }) => {
      const { data } = await api.put(key, arg);
      return data.settings as UserSettings;
    }
  );

  // Optimistic update helper: merge partial patch into cached settings, rollback on error
  const update = (patch: Partial<UserSettings>) =>
    trigger(patch, {
      optimisticData: (current?: UserSettings) => ({ ...(current ?? {}), ...patch }) as UserSettings,
      rollbackOnError: true,
      // Trust server response to be the source of truth for the cache
      populateCache: (result: UserSettings) => result,
      // Avoid an extra GET after the PUT since we already populated the cache
      revalidate: false,
    });

  return { update, isUpdating: isMutating };
}
