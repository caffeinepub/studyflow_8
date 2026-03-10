import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUserSetup(): { isReady: boolean } {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!identity || !actor || isFetching) {
      setIsReady(false);
      return;
    }

    // Show the UI immediately — optimistic
    setIsReady(true);

    // Register in the background without blocking the UI
    void actor.ensureUser().catch((err: unknown) => {
      console.error("ensureUser failed:", err);
    });
  }, [actor, identity, isFetching]);

  return { isReady };
}
