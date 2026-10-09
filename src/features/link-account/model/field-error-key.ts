const FIELD_ERROR_KEYS = [
  "account.errors.loginRequired",
  "account.errors.passwordShort",
  "account.errors.nicknameLength",
  "account.errors.nicknameChars",
  "account.errors.email",
  "account.errors.passwordWeak",
  "account.errors.consent",
  "errors.NICK_TAKEN",
  "errors.EMAIL_TAKEN",
  "errors.INVALID_CREDENTIALS",
] as const;

type FieldErrorKey = (typeof FIELD_ERROR_KEYS)[number] | "errors.generic";

// The form keeps messages as plain strings; one it does not know falls back to the generic text (форма хранит сообщения строками; незнакомое заменяется общим текстом).
export const fieldErrorKey = (message: string | undefined): FieldErrorKey | undefined => {
  if (message === undefined) return undefined;
  return FIELD_ERROR_KEYS.find((key) => key === message) ?? "errors.generic";
};
