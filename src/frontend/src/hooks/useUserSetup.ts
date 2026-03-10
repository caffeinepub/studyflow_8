import { useEffect, useRef } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

// Module-level promise so any mutation can await registration completion
let ensureUserResolve: (() => void) | null = null;
let ensureUserPromise: Promise<void> = new Promise((resolve) => {
  ensureUserResolve = resolve;
});

export function getEnsureUserPromise(): Promise<void> {
  return ensureUserPromise;
}

export function useUserSetup(): { isReady: boolean } {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const setupStarted = useRef(false);

  useEffect(() => {
    if (!identity || !actor) return;
    if (setupStarted.current) return;
    setupStarted.current = true;

    // Reset promise for this login session
    ensureUserPromise = new Promise((resolve) => {
      ensureUserResolve = resolve;
    });

    actor
      .ensureUser()
      .then(() => {
        ensureUserResolve?.();
      })
      .catch((err: unknown) => {
        console.error("ensureUser failed:", err);
        // Resolve anyway so mutations don't hang forever
        ensureUserResolve?.();
      });
  }, [actor, identity]);

  // Always show the UI immediately
  return { isReady: true };
}
