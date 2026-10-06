# WRITING.md

What an article on this site must look like. Read it before you add or change a page in `src/content/docs/`. For the step-by-step process of writing an article, use the `write-article` skill (`.claude/skills/write-article/`).

## Reader and goal

- The reader already knows system design basics. Do not teach from zero.
- The goal is to help the reader design a system fast — in about one hour, as in an interview.
- Each page builds patterns: a default choice, the signals that change it, and the trade-offs.
- No deep dives, no history, no "why this exists". Keep a detail only if it changes a design decision.

## Language

- Simple English that non-native readers can follow. Short sentences, common words.
- Terms and abbreviations go to the [glossary](#glossary). Do not expand them in parentheses in the text.
- Speak to the reader directly ("use", "pick", "say"). No filler and no jokes.

## Fundamentals pages

Fundamentals pages live in `src/content/docs/fundamentals/`. Each page has this shape:

1. **Intro** — one short paragraph: what the topic covers and when it comes up in an interview.
2. **Sections** — one `##` section per decision. Start with the default choice, then say when to pick something else.
3. **Comparison tables** — use a table when you compare two or more options.
4. **Interview tips** — put the exact phrase or move to use in an interview in a `:::tip[In the interview]` aside. One or two per section at most.
5. **Cheat sheet** — the last section. A short list of the rules from the page, one line each.

## Glossary

The glossary (`src/data/glossary.mjs`) is the one place where terms are defined. The site shows each entry on the [Glossary](https://tech0ver.github.io/sysdis/glossary/) page, and the first mention of a term on any page gets a tooltip with its short definition.

- Add every term or abbreviation that a reader may not know: protocols, patterns, jargon.
- `term` keeps the official spelling of names and abbreviations (OpenAPI, GraphQL, gRPC, TCP). Common words start with a capital letter (Failover, Exponential backoff).
- `short` is one sentence and fits any context. Write "how long a piece of data stays valid", not "how long a DNS answer is cached".
- `explanation` is two or three sentences: what it is and why it matters in a design.
- `expansion` is what an abbreviation stands for. Only for abbreviations.
- `readMore` is where to read more. Point to the page on this site that explains the term. If no page does, point to a trusted external source (MDN, the official docs, Wikipedia).
- A page that a term's `readMore` points to explains the term in its own text, broadly and clearly. That page gets no tooltip for the term.
- Do not explain a term in an article only to define it. If the article does not need the explanation to make a decision, the glossary is enough.

## Sources

- The author names the sources for each article: study notes, books, sites, or their own experience.
- Write everything in your own words. Do not copy text from any source.
- Other interview prep sites can show what to cover, not how to say it.
- When sources disagree, ask the author. Do not pick one silently.

## Adding a page

1. Create the Markdown file. Frontmatter needs `title` and `description`.
2. Add the page to `sidebar` in `astro.config.mjs`, in the right group.
3. Run `bun run build` and check the page in `bun run dev`.
