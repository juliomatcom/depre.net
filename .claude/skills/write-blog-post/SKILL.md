---
name: write-blog-post
description: Use whenever the user asks to write, draft, or edit a post for depre.net (this repo) — "write a post about X", "let's do a blog post on Y", "turn this into a post", or a request to revise a file under content/blog/. Captures the voice this blog needs (blunt, first-person, no AI-slop phrasing) and this repo's exact publishing workflow. Consult this before drafting any post prose, even if the request looks like a simple writing task — the default polished/AI-generated register is wrong for this blog and gets rejected on sight.
---

# Writing a depre.net post

## Before you write anything

- Read `AGENTS.md` at the repo root. It's the actual source of truth for file location, naming, and CI expectations, and it can change after this skill was written.
- Skim two or three existing posts in `content/blog/` closest in subject to what you're writing, to recalibrate voice before drafting. The voice section below is a starting point, not a substitute for reading recent examples.
- If the post is about a project or tool the user built, read that project's own README, `docs/`, and any internal knowledge folder (one post here drew on a project's own `wiki-llm/` folder) before writing a single claim about how it works. Never invent behavior. If a draft claim contradicts the source docs, the docs win, fix the draft.

## Voice

This is the part that gets corrected most often, so slow down here.

Write the way the user actually talks about their own work: direct, first person, a little blunt. State the annoyance or the fact plainly instead of building it up rhetorically.

- Reject: "The feed's job is to keep you scrolling, not to show you what you actually opened the app for, and those two goals overlap less every year." — a parallel-structure sentence that sounds written at the reader.
- Accept: "Every time I opened LinkedIn or X to check on one thing, I ended up reading twenty minutes of rage bait, cringe posts, and someone's hot take I never asked for before I got to anything I actually cared about." — flat, sequential, sounds spoken.

Reject invented metaphors and marketing filler ("it just stops being the thing your thumb hits first", "barely take up space"). Say the mechanism plainly instead: it hides the post, it shrinks it to a thin row.

When explaining how something works technically, stay precise, but say only what's needed to justify the point being made, don't teach a mini-course on the underlying concept unless the user asked for that. If the question on the table is "why did you pick this model," answer that; don't first explain what an embedding is.

Contractions are normal. Paragraphs are short. No emoji. Bullets are for scannable lists (settings, options), never for storytelling, narrative sections read as prose.

When in doubt, prefer the plainest way to say a true thing over a polished way to say it.

The user will say directly when something reads as "AI slop." Treat that as a signal to cut, not to rephrase more elaborately. Watch for: parallel or rhetorical sentence pairs, manufactured metaphors, and any sentence that summarizes for effect rather than states a fact.

## Assets

- Prefer a source project's own real images over generating new ones: an icon, a promo tile, a screenshot it already ships. Check its `public/`, `assets/`, or a local/`.local/`-type folder before creating anything.
- Don't publish a screenshot that exposes other identifiable real people's content (real names, real posts, real handles) without a clear reason. When a project's own screenshots have that problem, use its promo art or icon instead.
- This site's markdown pipeline (`src/lib/markdown.ts`) is plain `remark` with no mermaid support. If the thing you're documenting already has a mermaid diagram (its README, say), don't redraw it as ASCII art: render the *original* mermaid source through `npx -y @mermaid-js/mermaid-cli` to a themed SVG and embed that as a normal image. Theme it to match this site: body background is black, the link/accent color is yellowgreen (`#9acd32`), code blocks are `#1e1e1e`. Pick a border or highlight color that fits the subject if one makes sense, e.g. the product's own brand color.
- Raw HTML is allowed inline in post markdown (`remark-html` runs with `sanitize: false`), so size an image precisely with `<img src="..." style="max-width: Npx" />` instead of fighting markdown image syntax when something needs to be smaller than the column width.

## Format

Follow `AGENTS.md`'s "Writing / editing a post" section literally. As of this writing that means:

- `content/blog/<slug>-YYYY-MM-DD.md`, the date in the filename is the publish date.
- First line is `# Title`, no frontmatter.
- The first `![alt](/images/x.png)` in the file becomes the OG/Twitter card image.
- Add `<!-- description: ... -->` as a plain-sentence summary, not keyword-stuffed.
- If the post had AI help writing it, credit it as `<small><em>This post was co-authored with X.</em></small>` on its own line at the very end of the post, after the closing line, not under the title.

## Before calling it done

- `npx prettier --check content/blog/<file>.md` (or `--write` to fix it). CI enforces formatting.
- Actually render the post: start `npm run dev`, then poll rather than sleep once (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/blog/<slug>/` in a short retry loop, first compile takes a few seconds), and spot-check the rendered HTML has the images and content you expect. Kill the dev server when done. Don't tell the user a post works without having done this.

## Git

`main` is protected, never commit there directly (see `AGENTS.md`). Create a branch and commit to it; let the user push and open the PR unless they've explicitly asked you to push. When picking a branch name: this repo can have legacy single-word branches (e.g. `post`) sitting around, which blocks git from also creating `post/<anything>`, since a ref can't be both a branch and a directory of branches. A name like `blog/<slug>` sidesteps that.

## Iterating on feedback

The user reviews in small rounds: resize an image, fix a claim, redo one section's tone. Apply exactly what they asked, keep the diff scoped to that instead of rewriting untouched sections while you're in there, re-run prettier and the render check, and commit each round separately with a message that says what changed and, where it's non-obvious, why.
