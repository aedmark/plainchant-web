# Contributing

Process rules for humans and agents working in Plainchant Web. Technical orientation lives in [`AGENTS.md`](../AGENTS.md).

## Before changing code

1. Read [`README.md`](../README.md), the relevant [`ROADMAP.md`](../ROADMAP.md) item, the matching section of
   [`docs/ARCHITECTURE.md`](ARCHITECTURE.md), and [`docs/TESTING.md`](TESTING.md). Verify the repository's actual
   conventions rather than importing training-distribution or external defaults (fore-conceptions): there is no build
   step, no framework, and no npm runtime dependency.
2. Setup: nothing to install for tests (`npm test`); Rust is needed only for the desktop shell
   (`npm run tauri:dev`). Browser build: `python3 -m http.server 8080`, then `http://localhost:8080/app.html`.
3. Check `git status` and [`docs/HANDOFF.md`](HANDOFF.md) for a live session owner, and confirm your change will not
   overlap unrelated work.
4. Surface unstated assumptions. For ambiguous requirements or a large or irreversible change, ask clarifying
   questions (or record an open question in [`docs/DECISIONS.md`](DECISIONS.md)) and agree on scope before editing.

## Make the change

- Keep each change reviewable and focused on one outcome; do not bundle unrelated refactors.
- If implementation or testing invalidates the agreed scope or exposes an unexpected architectural dependency, pause
  and re-scope before continuing.
- Add or update tests for changed behaviour. Make a new test fail for the intended reason before trusting it.
- Update documentation according to [the documentation triggers](README.md#update-triggers).
- Do not include credentials, personal data, generated caches (`src-tauri/dist/`, `src-tauri/target/`), or local
  configuration.

## Verify

```bash
npm test && python3 tools/check_docs.py
npm test && python3 tools/check_docs.py && python3 -m unittest tools/test_manual.py && cargo build --manifest-path src-tauri/Cargo.toml
```

The first line is the fast set, the second the full set. Follow [`docs/TESTING.md`](TESTING.md) for what each suite
does and does not prove. Report the exact checks run and any skipped; a partial pass is not a full pass.

## Submit and review

Direct-to-`master` with maintainer review in-session; use `feature/<topic>` only when asked. Commit and push only
when the maintainer requests it. Commit messages are a concise imperative summary that cites roadmap IDs where one
exists. Never force-push or rewrite shared history. A change is ready when its scope is clear, relevant checks pass,
no sensitive data is present, and the documentation it invalidated has been updated.

## Compatibility & deprecations

- **Project File Integrity**: Plainchant Web must never leave `data-pc-id` or internal studio artifacts inside user HTML/CSS buffers or exported files (`D-003`).
- **Disk Safety**: Opening an existing folder must remain non-destructive until the user clicks **Export** (`D-006`).
- **Module Size**: Keep every file in `src/app/*.js` at or below 500 lines (`D-001`).

## Reporting security issues

Do not open a public issue for a suspected vulnerability. Follow [`docs/SECURITY.md`](SECURITY.md).
