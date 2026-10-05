# AGENTS.md

Context for coding agents. How to install and run the project: see [README.md](README.md).

## Project

A personal system design knowledge base: articles for interview preparation, published as a static site.

- Stack: Astro + Starlight, package manager Bun.
- Language: everything in English — content, code, comments, commit messages. Use simple English that non-native readers can follow.
- Site URL: `https://tech0ver.github.io/sysdis/` (`base: '/sysdis'`). Not deployed yet.

## Layout

- `astro.config.mjs` — site config and sidebar (pages are listed in `sidebar` explicitly).
- `src/content/docs/` — pages (Markdown/MDX). File path = URL. `index.mdx` is the home page.
- `src/styles/theme.css` — color theme (based on Skeleton's "Mona"). Change colors here only, through Starlight `--sl-*` variables.
- `src/components/ThemeToggle.astro` — replaces Starlight's `ThemeSelect`. Two-way dark/light toggle; with no saved choice the site follows `prefers-color-scheme`.
- `public/favicon.png` — favicon (tech0ver organization logo). The site has no header logo; the header shows the title only.

## Conventions

- Internal links are relative (`../caching/`) so they keep working under `base`.
- Do not duplicate information between README.md and AGENTS.md: README is for running the project, AGENTS.md is for working on it.
- Before finishing a change, run `bun run build` — it must pass with no errors.

## Task workspace

Notes, drafts, and task briefs live in `.agents/`, which is git-ignored. It is a local working area: do not assume its contents exist in a fresh clone.

## Change workflow

Use GitHub Flow. `main` accepts changes only through pull requests; force pushes and deletion are blocked.

1. Create a short-lived branch from `main`, named `<type>/<kebab-case-topic>` — for example `feat/caching-article`, `fix/theme-toggle`, `docs/agents`.
2. Make a focused change. Do not mix unrelated changes.
3. Open a pull request. Its title and description become the commit message on `main`, so write them as a record of the change, not as a note to the reviewer. Avoid tables and long lines.
4. Wait for human approval. Do not merge unapproved work.
5. Squash merge. This is the only merge method enabled; the branch is deleted automatically.

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages and PR titles. The branch `<type>` uses the same set of types.

Sign off every commit with `git commit -s`. When an agent contributes, add a `Co-authored-by` trailer with its name and model. Do not repeat these trailers in the PR description: when squashing, GitHub collects `Co-authored-by` from the branch commits and adds `Signed-off-by` for the merger (web sign-off is required in repository settings).

Do not add tool banners such as "Generated with …" to PR descriptions or commit messages. The `Co-authored-by` trailer is the attribution.
