---
name: write-article
description: Write a new article for this site, or rewrite an existing one, from the author's sources. Use when the user asks to write, draft, rewrite, or improve an article or page in src/content/docs/. Walks through sources, a decision outline the author approves, a draft, and review passes.
---

# Write an article

This skill is the process. [WRITING.md](../../../WRITING.md) is the standard the result must meet. Read WRITING.md first, then follow the steps in order. Do not skip the approval in step 3.

Keep working notes in `.agents/<article-slug>/` (git-ignored): `sources.md` and `outline.md`. They let a later session continue the work.

## 1. Agree on the scope

Ask the author, or confirm from the request:

- The topic and the target page (new file, or an existing one to rewrite).
- The sources for this article. They differ per article: study notes (for example Notion pages), books, sites, the author's own experience.
- Anything that must be in the article, or must stay out.

If the author gives no sources, propose some and wait for an answer.

## 2. Collect from the sources

- Read every source the author named. If a source has its own reading guide (for example an instructions page in a notes workspace), follow it.
- Write the facts to `sources.md`, grouped by subtopic. For each fact, note the source.
- Keep only facts that change a design decision in an interview: a default choice, a signal to pick something else, a trade-off, a number, or a common mistake. Drop internals, history, and "why it exists".
- List conflicts between sources and open questions separately.

## 3. Build the decision outline and get approval

Before writing any prose, write `outline.md`:

- The decisions the reader makes on this topic in an interview, one per line. Each becomes a `##` section.
- For each decision: the default, the signals that change it, and the key trade-off — one line each.
- What is left out on purpose, with a short reason.
- The conflicts and open questions from step 2.

Show the outline to the author and wait for approval. This is the step that keeps the article focused: every section must answer a decision from the approved outline. If something does not fit a decision, it does not go in the article.

## 4. Write the draft

- Follow the page shape and language rules in WRITING.md.
- Write from `sources.md` and `outline.md`, in your own words.
- Add the page to `sidebar` in `astro.config.mjs` if it is new.

## 5. Review

Run these passes in order and fix what they find:

1. **Humanizer.** Run the `humanizer` skill on the draft to remove AI writing patterns. If its suggestions break a WRITING.md rule (for example, simple English), WRITING.md wins.
2. **Fresh reader.** Start a subagent that gets only the article file and this task: "You are preparing for a system design interview. Using only this page, answer: what do you pick by default for each decision, and when do you pick something else? List anything unclear, missing, or contradictory." Compare its answers with the outline. Fix gaps in the article, not in the outline.
3. **Build.** Run `bun run build`; it must pass.

## 6. Hand over

Tell the author what changed, which open questions are left, and how to view the page with `bun run dev`. Then follow the change workflow in AGENTS.md.
