import { useEffect, useRef } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUserSetup(): { isReady: boolean } {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const setupStarted = useRef(false);

  useEffect(() => {
    if (!identity || !actor) return;
    if (setupStarted.current) return;
    setupStarted.current = true;

    // Best-effort background registration — mutations call ensureUser() themselves
    actor.ensureUser().catch((err: unknown) => {
      console.warn("Background ensureUser failed:", err);
    });
  }, [actor, identity]);

  // Always show UI immediately
  return { isReady: true };
}
