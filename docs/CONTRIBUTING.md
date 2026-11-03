# Contributing

Process rules for humans and agents working in Plainchant Web. Technical orientation lives in [`AGENTS.md`](../AGENTS.md).

## Workflow

1. Read [`AGENTS.md`](../AGENTS.md) and the `Current state` section of [`docs/HANDOFF.md`](HANDOFF.md).
2. Pick a task from [`ROADMAP.md`](../ROADMAP.md) (or add one if new work was requested).
3. Keep changes focused. Don't bundle unrelated refactors with feature or bug work.
4. Add or update tests alongside code changes (see [`docs/TESTING.md`](TESTING.md)).
5. Run verification (`npm test` and `python3 tools/check_docs.py`) and confirm every check passes before finishing.
6. Update docs in the same change:
   - [`ROADMAP.md`](../ROADMAP.md) if task status changed
   - [`docs/DECISIONS.md`](DECISIONS.md) if a non-obvious design choice was made
   - [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) if component boundaries or data flow changed
   - [`docs/CHANGELOG.md`](CHANGELOG.md) if user-visible behavior changed
   - [`docs/HANDOFF.md`](HANDOFF.md) — refresh `Current state` and prepend a session log entry

## Compatibility & deprecations

- **Project File Integrity**: Plainchant Web must never leave `data-pc-id` or internal studio artifacts inside user HTML/CSS buffers or exported files (`D-003`).
- **Disk Safety**: Opening an existing folder must remain non-destructive until the user clicks **Export** (`D-006`).
- **Module Size**: Keep every file in `src/app/*.js` at or below 500 lines (`D-001`).
