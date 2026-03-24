"use client";

import { useCallback } from "react";
import { authClient } from "@featul/auth/client";
import { toast } from "sonner";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";

type SocialProvider = "google" | "github";

type SocialAuthErrorMessages = {
  google: string;
  github: string;
};

type UseSocialAuthOptions = {
  redirect: string;
  setIsLoading: (value: boolean) => void;
  setError: (message: string) => void;
  errorMessages: SocialAuthErrorMessages;
};

export function useSocialAuth({
  redirect,
  setIsLoading,
  setError,
  errorMessages,
}: UseSocialAuthOptions) {
  const runSocialAuth = useCallback(
    async (provider: SocialProvider) => {
      setIsLoading(true);
      setError("");

      try {
        captureAnalyticsEvent(analyticsEvents.authMethodUsed, {
          method: provider,
          intent: "sign_in",
          stage: "started",
        });
        await authClient.signIn.social({
          provider,
          callbackURL: redirect,
        });
      } catch {
        const message =
          provider === "google"
            ? errorMessages.google
            : errorMessages.github;
        setError(message);
        toast.error(message);
        setIsLoading(false);
      }
    },
    [errorMessages.github, errorMessages.google, redirect, setError, setIsLoading]
  );

  const onGoogle = useCallback(() => {
    void runSocialAuth("google");
  }, [runSocialAuth]);

  const onGithub = useCallback(() => {
    void runSocialAuth("github");
  }, [runSocialAuth]);

  return { onGoogle, onGithub };
}
