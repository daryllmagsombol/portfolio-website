import { createContext, useContext } from "react";

export const SectionContext = createContext<number>(0);

/**
 * Reads the currently-active section index from SectionContext. The
 * provider owns the single IntersectionObserver subscription; consumers
 * (NavBar, WorldBackground, etc.) read from context instead of each
 * spinning up their own observers.
 */
export function useSection(): number {
  return useContext(SectionContext);
}