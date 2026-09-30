# Skill-First Changes

Before manually performing work, the agent must check `.claude/skills/` (see `.claude/skills/README.md`) for an applicable project skill and run it. Project skills take precedence over globally installed plugin skills that cover the same step (for example, `clarify-task` over generic brainstorming skills).

## Mandatory behaviour

* Read the skill's `SKILL.md` and follow it; use its result as the basis for further work.
* Do not replace an available skill with manual work because it looks faster.
* If a skill needs values that cannot be derived safely (secrets, IDs, URLs, domains, store credentials), do not invent them: tell the developer which file needs which value and why.

## When a skill fails

If a skill cannot run, errors, or produces an incomplete result, the agent must not silently finish the work manually. Report what failed (with a concise error summary) and ask the developer to choose: authorize manual execution, do it themselves, or provide what is needed to rerun.

## Exceptions

Manual work without the skill is allowed only when no applicable skill exists, when the task is to create or fix the skill itself, or when the developer explicitly says to bypass it. State which exception applies.
