"use client";

import * as React from "react";

import { type Asset } from "@/lib/api";

export type SearchConfig = {
  assets: Asset[];
  onOpenAsset: (asset: Asset) => void;
  onShowInFolder: (asset: Asset) => void;
};

type Ctx = { config: SearchConfig | null; setConfig: (c: SearchConfig | null) => void };

const SearchCtx = React.createContext<Ctx>({ config: null, setConfig: () => {} });

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<SearchConfig | null>(null);
  return <SearchCtx.Provider value={{ config, setConfig }}>{children}</SearchCtx.Provider>;
}

export function useSearch() {
  return React.useContext(SearchCtx);
}
