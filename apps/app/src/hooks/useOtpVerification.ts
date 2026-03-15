"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { checkVerificationOtp, sendVerificationOtp } from "@/utils/otp";

type UseOtpVerificationOptions<TStep extends string> = {
  email: string;
  code: string;
  sendNextStep: TStep;
  verifyNextStep: TStep;
  sendErrorMessage: string;
  sendSuccessMessage: string;
  verifyErrorMessage: string;
  resetSubmittedOnSend?: boolean;
  setError: (message: string) => void;
  setSubmitted: (value: boolean) => void;
  setStep: (step: TStep) => void;
  setIsSending: (value: boolean) => void;
  setIsVerifying: (value: boolean) => void;
};

export function useOtpVerification<TStep extends string>({
  email,
  code,
  sendNextStep,
  verifyNextStep,
  sendErrorMessage,
  sendSuccessMessage,
  verifyErrorMessage,
  resetSubmittedOnSend = false,
  setError,
  setSubmitted,
  setStep,
  setIsSending,
  setIsVerifying,
}: UseOtpVerificationOptions<TStep>) {
  const sendCode = useCallback(async () => {
    setIsSending(true);
    setError("");
    if (resetSubmittedOnSend) setSubmitted(false);

    try {
      const { error } = await sendVerificationOtp(email, "forget-password");
      if (error) {
        const message = error.message || sendErrorMessage;
        setError(message);
        toast.error(message);
        return;
      }

      setStep(sendNextStep);
      toast.success(sendSuccessMessage);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : sendErrorMessage;
      setError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }, [
    email,
    resetSubmittedOnSend,
    sendErrorMessage,
    sendNextStep,
    sendSuccessMessage,
    setError,
    setIsSending,
    setStep,
    setSubmitted,
  ]);

  const verifyCode = useCallback(async () => {
    setIsVerifying(true);
    setError("");
    setSubmitted(true);

    if (code.trim().length !== 6) {
      setError("Please enter the 6-digit code.");
      setIsVerifying(false);
      return;
    }

    try {
      const { error } = await checkVerificationOtp({
        email: email.trim(),
        otp: code.trim(),
        type: "forget-password",
      });

      if (error) {
        const message = error.message || verifyErrorMessage;
        setError(message);
        toast.error(message);
        return;
      }

      setStep(verifyNextStep);
      setSubmitted(false);
      setError("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : verifyErrorMessage;
      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }, [
    code,
    email,
    setError,
    setIsVerifying,
    setStep,
    setSubmitted,
    verifyErrorMessage,
    verifyNextStep,
  ]);

  return { sendCode, verifyCode };
}
