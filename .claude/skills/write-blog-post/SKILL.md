---
name: write-blog-post
description: Use whenever the user asks to write, draft, or edit a post for depre.net (this repo) — "write a post about X", "let's do a blog post on Y", "turn this into a post", or a request to revise a file under content/blog/. Captures the voice this blog needs (blunt, first-person, no AI-slop phrasing) and this repo's exact publishing workflow. Consult this before drafting any post prose, even if the request looks like a simple writing task — the default polished/AI-generated register is wrong for this blog and gets rejected on sight.
---

# Writing a depre.net post

## Before you write anything

- Read `AGENTS.md` at the repo root. It's the actual source of truth for file location, naming, and CI expectations, and it can change after this skill was written.
- Skim two or three existing posts in `content/blog/` closest in subject to what you're writing, to recalibrate voice before drafting. The voice section below is a starting point, not a substitute for reading recent examples.
- If the post is about a project or tool the user built, read that project's own README, `docs/`, and any internal knowledge folder (one post here drew on a project's own `wiki-llm/` folder) before writing a single claim about how it works. Never invent behavior, and never take the user's own recollection of how their project works as the final word either, they'll say "IIRC" or describe a mechanism from memory and get a detail wrong. Check it against the actual docs before it goes in the post. The wiki/docs are the source of truth, not the user's memory and not your assumption. If a draft claim contradicts the source docs, the docs win, fix the draft.
- Reading that source material is for your own accuracy, not for the reader. Don't link the post to a GitHub repo, a `wiki-llm/`-style internal folder, or anything else in the source code unless the user has confirmed it's actually public. A reader of the blog post has no reason to have access to the project's source, and a link or mention that assumes they do (e.g. "the source is public, see the `wiki-llm/` folder") is a claim you haven't verified. Don't guess a repo is public from its remote URL either, ask, or leave the reference out.

## Voice

This is the part that gets corrected most often, so slow down here.

Write the way the user actually talks about their own work: direct, first person, a little blunt. State the annoyance or the fact plainly instead of building it up rhetorically.

- Reject: "The feed's job is to keep you scrolling, not to show you what you actually opened the app for, and those two goals overlap less every year." — a parallel-structure sentence that sounds written at the reader.
- Accept: "Every time I opened LinkedIn or X to check on one thing, I ended up reading twenty minutes of rage bait, cringe posts, and someone's hot take I never asked for before I got to anything I actually cared about." — flat, sequential, sounds spoken.

Reject invented metaphors and marketing filler ("it just stops being the thing your thumb hits first", "barely take up space"). Say the mechanism plainly instead: it hides the post, it shrinks it to a thin row.

When explaining how something works technically, stay precise, but say only what's needed to justify the point being made, don't teach a mini-course on the underlying concept unless the user asked for that. If the question on the table is "why did you pick this model," answer that; don't first explain what an embedding is.

This post is for anyone curious on the internet, not for a developer who might contribute to the project. If the source has an architecture diagram with named pieces (a content script, an iframe, a worker, whatever), and you're using that diagram in the post, actually explain what each piece does, in plain terms, don't caption a diagram with three technical names and then talk around it in the prose, and don't collapse it into one vague sentence that could describe any app ("it checks your feed and keeps things private" says nothing on its own). Use the diagram's own names for the pieces (don't paraphrase them as "the first part", "a second piece", the reader is looking at the picture and matching your words to its labels), and say what each one's job is, in order, the way you'd explain it out loud to someone standing next to you. What you leave out is the *why*: the engineering constraints that made the split necessary (why a background process couldn't do it, what a browser blocks, what had to be worked around). That justification is real and often interesting, but it's a level down from "how it works," it belongs in the project's own docs, not in a post for a general reader.

Watch the connotation of words describing internal mechanics, not just their technical accuracy. "Hidden," "invisible," "silently" and similar are accurate descriptions of an iframe or background process, but to a reader who isn't a developer they land as "this thing is doing something behind your back", which is the opposite of what a privacy-focused post should sound like. Say what the part does (it's a separate step, it runs off to the side) instead of how it's built (it's hidden, it's invisible). This holds even when the diagram's own label uses the word, e.g. a box labeled "hidden iframe": use its short name ("the iframe") in prose and drop the adjective, the "use the diagram's own names" rule above is about which noun to use for each piece, not about repeating every word in its label.

Contractions are normal. Paragraphs are short. Bullets are for scannable lists (settings, options), never for storytelling, narrative sections read as prose.

On emoji: don't add them yourself when drafting, this blog's baseline is plain text. But if the user adds one, in a heading or inline, while editing, that's them setting the tone for that post, not a slip to clean up. Confirmed on the Lensing post: a couple of emoji in section headings and one inline read as "very much how I usually write" once asked. Leave user-added emoji alone unless they say otherwise.

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

Right before a commit (not after every small edit along the way, see below): run `npx prettier --check content/blog/<file>.md` (or `--write` to fix it, CI enforces formatting), and actually render the post, start `npm run dev`, poll rather than sleep once (`curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/blog/<slug>/` in a short retry loop, first compile takes a few seconds), spot-check the rendered HTML has the images and content you expect, then kill the dev server. Don't tell the user a post works without having done this at least once before it's committed.

## Git

`main` is protected, never commit there directly (see `AGENTS.md`). Create a branch and commit to it; let the user push and open the PR unless they've explicitly asked you to push. When picking a branch name: this repo can have legacy single-word branches (e.g. `post`) sitting around, which blocks git from also creating `post/<anything>`, since a ref can't be both a branch and a directory of branches. A name like `blog/<slug>` sidesteps that.

## Iterating on feedback

The user reviews in small rounds: resize an image, fix a claim, redo one section's tone, simplify a section further. Apply exactly what they asked, keep the diff scoped to that instead of rewriting untouched sections while you're in there.

Don't run prettier or the render check after every one of these small rounds, and don't commit after every one either, both were tried and the user shut them down explicitly. Mid-round, just make the edit and say what changed. Do the format-check-and-render pass once, right before a commit, not on every edit in between. Only commit when the user asks for it, or once a batch of related edits has actually settled (e.g. right before they ask you to push). When you do commit, it's fine for one commit to cover several of these small rounds at once.
