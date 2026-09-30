---
paths:
  - "src/**/*-schema.ts"
  - "src/**/*-form*.tsx"
---

# Forms: react-hook-form + zod

Forms (nickname, friend search, support — spec Part 8 §2.3) use react-hook-form with `zodResolver`.

* The schema lives in the slice's `model/` as `<name>-schema.ts`; the form type is `z.infer<typeof schema>`, never written by hand.
* Validation constraints (lengths, allowed characters) come from the spec (Part 4, Part 7). A constraint not stated there is a question, not a guess.
* Error messages are i18n keys, not literals; texts from spec Part 5.
* Inputs are controlled via `Controller` (React Native inputs have no native `register` binding); keep the wrapper thin and reusable in `shared/ui`.
* Submission goes through a mutation hook with `mutate` + callbacks; the submit control is disabled while `isPending`.
* Server-side field errors are mapped onto fields when the response identifies them; otherwise shown as a form-level error.
* Keyboard handling via `react-native-keyboard-controller` (Part 8 §2.1).
* Schemas are covered by unit tests: valid input passes, each invalid case yields the expected error key.
