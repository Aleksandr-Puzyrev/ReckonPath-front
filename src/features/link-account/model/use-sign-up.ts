import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import { errorMessageKey, isApiError } from "@shared/api";
import type { ErrorMessageKey } from "@shared/api";

import { registerMutationOptions } from "../api/register-mutation";

import type { FieldErrorKey } from "./field-error-key";
import type { SignUpSchema } from "./sign-up-schema";

type SignUpField = "nickname" | "email" | "password";

export interface SignUpCallbacks {
  onCodeSent: (email: string, resendAfter: number) => void;
  onFieldError: (field: SignUpField, messageKey: FieldErrorKey) => void;
  onError: (messageKey: ErrorMessageKey) => void;
}

// The server explains a rejected field in its own words; the client shows its own text for that field (сервер объясняет отказ своими словами, клиент показывает свой текст для этого поля).
const SERVER_FIELD_KEYS = {
  nickname: "account.errors.nicknameChars",
  email: "account.errors.email",
  password: "account.errors.passwordRejected",
} as const satisfies Record<SignUpField, FieldErrorKey>;

const fieldsSchema = z.object({ fields: z.record(z.string(), z.unknown()) });

const fieldErrorOf = (error: unknown): [SignUpField, FieldErrorKey] | null => {
  if (!isApiError(error)) return null;
  if (error.code === "nick_taken") return ["nickname", "errors.nick_taken"];
  if (error.code === "email_taken") return ["email", "errors.email_taken"];
  if (error.code !== "validation_failed") return null;
  const parsed = fieldsSchema.safeParse(error.details);
  if (!parsed.success) return null;
  const field = (["password", "nickname", "email"] as const).find(
    (name) => name in parsed.data.fields,
  );
  return field === undefined ? null : [field, SERVER_FIELD_KEYS[field]];
};

export const useSignUp = ({ onCodeSent, onFieldError, onError }: SignUpCallbacks) => {
  const { mutate, isPending } = useMutation({
    ...registerMutationOptions(),
    onSuccess: ({ resendAfter }, { email }) => onCodeSent(email, resendAfter),
    onError: (error) => {
      const fieldError = fieldErrorOf(error);
      if (fieldError === null) {
        onError(errorMessageKey(error));
        return;
      }
      onFieldError(...fieldError);
    },
  });

  // The one consent checkbox of the form covers both the terms and the privacy policy (одна галочка формы покрывает и условия, и политику конфиденциальности).
  const submit = ({
    nickname,
    email,
    password,
    isConsentGiven,
    isMarketingAllowed,
  }: SignUpSchema) =>
    mutate({
      email,
      password,
      nickname,
      acceptTerms: isConsentGiven,
      acceptPrivacy: isConsentGiven,
      acceptMarketing: isMarketingAllowed,
    });

  return { submit, isPending };
};
