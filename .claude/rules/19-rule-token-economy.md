# Token Economy

Always on. It changes how work is done, never whether required work is done: bootstrap reading, clarification, and done checks are never skipped to save tokens.

## Reading

* Search first, read second: locate with `Grep`/`Glob`, then read only the relevant range.
* The spec is ~5 000 lines: never read `docs/PELENGE_TZ.md` or a whole `docs/spec/NN-*.md` part. Use `docs/spec/README.md`, `Grep` the heading, read that section.
* Design HTML files are 300–600 KB: never read them whole. `Grep` for `data-screen-label="NN.K"` or a visible string and read only that fragment; use `design/shots/` images for a quick look.
* Do not re-read a file right after editing it.

## Commands

* While iterating, run targeted checks (single test file, single-file lint); run the full done checks once at the end.
* Filter noisy output (`tail`, `head`, `grep`); keep full logs only while debugging that failure.

## Delegation

Broad exploration ("where is X used", "how do the screens do Y") goes to a search subagent that returns conclusions and file references, not file dumps.

## Reports

Short progress notes; reference files by path and quote only the lines that matter; the full picture once, in the final summary.
