# Lensing, a local AI feed cleaner for your social feeds

<!-- description: Lensing is a browser extension that hides off-topic posts on X, LinkedIn and Reddit using a small language model that runs entirely on your device. Here's why I built it and how the on-device model actually works. -->

![Lensing icon and wordmark, "Blur what's off topic", on a dark background](/images/lensing-promo.png)

A few days ago I shipped [Lensing](https://chromewebstore.google.com/detail/lensing/ahlojbckjlffcfdhmkjepaglnhhpmdck) to the Chrome Web Store. It's a browser extension that hides the posts in your feed that don't match topics you actually care about. It runs entirely on your device, your feed never leaves your browser, and you control how aggressive it is.

## Why I built it

Every time I opened LinkedIn or X to check on one thing, I ended up reading twenty minutes of rage bait, cringe posts, and someone's hot take I never asked for before I got to anything I actually cared about. The feed doesn't care why you opened the app, it cares that you keep scrolling. I wanted something that filtered for me instead of for the platform.

## Privacy first

I wasn't going to ship an extension that reads your feed and sends it somewhere. Your feed says a lot about you, who you follow, what you stop on, what you scroll past. That's not something I wanted touching a server, mine or anyone else's. If a "privacy tool" needs to phone home to work, it's not a privacy tool, it's just data collection with better marketing.

So everything runs on your device. Lensing reads a post, scores it, forgets it, all inside your browser. No account, no server, no analytics, nothing to log even if I wanted to. That one rule, local only, no exceptions, ended up shaping the whole architecture, which is the part I actually want to get into.

## Why AI, and why now

This only works because small models got good enough to run in a browser tab. A few years ago "local AI" meant a toy model that could barely finish a sentence. Now Whisper.cpp transcribes audio offline on a laptop, Ollama runs a real coding model on your own GPU, Apple does on-device summarization on an iPhone, Chrome ships a small model on-device for stuff like this. The device finally got fast enough, so why send the data anywhere. Lensing does the same thing for one job: read a post, decide if it's actually about what you said you care about.

## The model doing the work: E5-small-v2

Lensing runs on E5-small-v2, a text embedding model out of Microsoft, and it's a good fit for exactly this job for three reasons. It's tiny, 33M parameters, small enough to run inside a browser tab without melting the page. It didn't need hand-labeled training data to get good, it was trained on naturally occurring pairs of text scraped from the internet, so it generalizes to "is this post about my topic" without me fine-tuning anything. And despite the size it's not a toy: zero-shot, it was the first embedding model to beat BM25, the decades-old keyword-search algorithm, on a standard benchmark, and after fine-tuning it beat models forty times its size. That's the ratio that matters when the thing has to run on a phone instead of a rack of GPUs.

## How it works

<img src="/images/lensing-how-it-works.svg" alt="Flowchart: the content script on the host page exchanges post text and scores with a hidden extension-origin iframe, which hands text to a worker thread running e5-small-v2 to embed and score it against your topics" style="max-width: 290px;" />

Three pieces, each for one reason. The **content script** lives inside the page, so it's the only part that can read the feed or blur anything. The **iframe** exists because a content script can't spawn an extension-origin worker directly, cross-origin, blocked by the host page's own CSP, but a document already sitting on the extension's origin can. The **worker** runs on its own thread so scoring never blocks scrolling.

The iframe never sees the page. Strings go in, floats come out. That boundary is what actually keeps post text on your device instead of "we promise not to look at it": the model layer doesn't know what X, LinkedIn or Reddit even are, it just scores text it's handed.

## How you can tune the results

Strictness is a 0–10 slider, and every step is a measured threshold rather than a guess, the popup tells you roughly how much of a typical feed survives at that setting, including how much of what survives will still turn out off-topic. It won't be perfect and it doesn't pretend to be: it reads words, not pictures, so a photo with no caption can't be judged on content, and it matches subjects, not quality, so a great post and a mediocre one about the same thing both get through.

There's also a thumbs-up/thumbs-down option, off by default. Rating a post nudges the vector for whichever topic came closest to claiming it, pulling it toward what you kept and away from what you blurred. There's no keyword extraction hiding in there to inspect, the post goes in as one string and comes back as one vector, so a correction lives on the topic line it shaped, and rating the same post again just undoes it.

If you want the actual measured numbers behind the slider, or the reasoning behind the architecture above, the source is public: [github.com/dephelion/lensing](https://github.com/dephelion/lensing), the `wiki-llm/` folder is where the design decisions and their reasoning actually live.

## Next steps

Right now Lensing is Chrome Web Store only. The build already runs on Firefox, MV3 works there too, it's just not published to Firefox Add-ons or the Microsoft Edge store yet. That's next, and it's not just a box to check: Firefox for Android only installs extensions that come from a curated AMO collection, no sideloading. Getting listed there is what actually puts Lensing on a phone, not a separate mobile build.

## Try it

[Lensing](https://chromewebstore.google.com/detail/lensing/ahlojbckjlffcfdhmkjepaglnhhpmdck) works on X, LinkedIn and Reddit today. Pick a few topics, give it a feed, and see what's left once the noise is gone.

If you like this post, don't forget to say hi.

<small><em>This post was co-authored with Claude.</em></small>
