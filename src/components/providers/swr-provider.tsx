"use client";

import { SWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";

export const SWRProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 5000, // Deduping requests in 5s
      }}
    >
      {children}
    </SWRConfig>
  );
};
