# Code Style

## Principles

* **Minimal working code.** Before adding a layer, wrapper, or abstraction, ask whether the code would be broken or unreadable without it. If not — don't add it.
* No code "for the future": no unused parameters, flags, options, or abstractions for hypothetical cases.
* Early returns instead of nested conditions.
* No commented-out code, dead code, debug leftovers, or needless intermediate variables.
* Reuse before writing: `shared/ui`, `shared/lib`, the engine, and installed libraries first.
* Code reads without comments: meaningful names, small functions, single responsibility.

## Formatting

Prettier is the formatter (`docs/decisions/0003-infrastructure-setup.md` #5): double quotes, semicolons, trailing commas in multiline literals, 2-space indentation. Spec code examples without semicolons are illustrative only.

## TypeScript

* `strict` and `noUncheckedIndexedAccess` (spec Part 8 §12.4); never loosen compiler options.
* `any` is forbidden (explicit, implicit, `as any`). Unknown shape → `unknown` + narrowing (zod at boundaries).
* No non-null assertion `!`. `as` only when unavoidable, with a comment explaining why it is safe.
* Trust inference; use `satisfies` to check a shape without losing inference.
* Data models are `type`/`interface`, no classes.
* No magic numbers or strings: named constants, enums, spec contract unions, or tokens. Game constants (move costs, penalties, limits) come from the engine or remote config per spec, never inlined in UI.

## React

* Function components as arrow functions, `export default` on its own line at the end.
* **No `useMemo`, `useCallback`, `React.memo`** — the React Compiler memoizes (spec Part 8 §12.4). Exception: a measured performance case, documented in a comment.
* Destructure props in the signature.
* `&&` rendering only with a boolean on the left; otherwise a ternary.
* No nested ternary chains in JSX — early returns, or a dedicated component with early returns.
* Stable `key` from entity ids, never array indexes for dynamic lists.
* No components defined inside components.
* Component file guideline ~150 lines; split into parts, hooks, and utilities beyond that.
* A component does only what its name says: data and callbacks outside its responsibility come in through props.
* A file contains only the entity it is named after (plus its props interface).

## Imports

* Path aliases for cross-slice and cross-layer imports; relative imports only inside the same slice.
* Types via `import type`.
* Order: external → `@reckon-path/engine` → layers top-down → relative.

## Async and errors

* `async/await`, not `.then()` chains.
* No empty `catch`. Handle (UI state, fallback) or rethrow; unexpected errors go to Sentry.
* Request errors are handled in the data layer and mutation callbacks, not scattered `try/catch` in components.
* No `console.log` in committed code.

## Comments

Developer preference (`docs/decisions/0005-code-conventions.md`): as few comments as possible.

* Write a comment only for a non-obvious "why" that someone could otherwise break: an ordering requirement, a library workaround, a type cast, a lint suppression.
* Such a comment is in English with a Russian translation in parentheses: `// The shadow is outside: overflow hidden would cut it off (тень снаружи: overflow hidden её обрежет).`
* No descriptive comments, file headers, section headers, or spec references — the name and the code say "what"; traceability lives in `docs/decisions/` and the task summary.
* Unfinished work only as `// TODO: <what remains>` — English only, no translation.

## Done checks

A task is not done until all of these pass on the final state, with the results reported:

1. `npm run lint` — no errors or warnings.
2. `npm run typecheck` — no errors.
3. `npm run format:check` — clean.
4. `npm test` — all green.
5. The diff contains only what the confirmed task asked for.
