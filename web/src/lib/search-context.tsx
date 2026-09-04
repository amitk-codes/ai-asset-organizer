"use client";

import * as React from "react";

import { type Asset } from "@/lib/api";

export type SearchConfig = {
  assets: Asset[];
  onOpenAsset: (asset: Asset) => void;
  onShowInFolder: (asset: Asset) => void;
};

type Ctx = {
  config: SearchConfig | null;
  setConfig: (c: SearchConfig | null) => void;
  /** open the spotlight from anywhere (e.g. the mobile Search tab) */
  openSearch: () => void;
  /** SpotlightSearch registers its opener here */
  registerOpener: (fn: (() => void) | null) => void;
};

const SearchCtx = React.createContext<Ctx>({
  config: null,
  setConfig: () => {},
  openSearch: () => {},
  registerOpener: () => {},
});

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<SearchConfig | null>(null);
  const openerRef = React.useRef<(() => void) | null>(null);

  const value = React.useMemo<Ctx>(
    () => ({
      config,
      setConfig,
      openSearch: () => openerRef.current?.(),
      registerOpener: (fn) => {
        openerRef.current = fn;
      },
    }),
    [config],
  );

  return <SearchCtx.Provider value={value}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
  return React.useContext(SearchCtx);
}
