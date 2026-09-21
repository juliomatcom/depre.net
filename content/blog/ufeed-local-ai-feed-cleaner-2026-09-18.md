# uFeed, a local AI feed cleaner for your social feeds

<!-- description: uFeed is a browser extension that hides off-topic posts on X, LinkedIn and Reddit using a small language model that runs entirely on your device. Here's why I built it and how the on-device model actually works. -->

![uFeed icon and wordmark, "Blur what's off topic", on a dark background](/images/lensing-promo.png)

A few days ago I shipped [uFeed](https://chromewebstore.google.com/detail/ahlojbckjlffcfdhmkjepaglnhhpmdck) to the Chrome Web Store. It's a browser extension that hides the posts in your feed that don't match topics you actually care about. It runs entirely on your device, your feed never leaves your browser, and you control how aggressive it is.

## Why I built it 🧑🏽‍💻

Every time I opened LinkedIn or X to check on one thing, I ended up reading a LOT of cringe posts, slop, or someone's "hot take" I never asked for before I got to anything I actually cared about. The feed doesn't care why you opened the app, **it cares that you keep scrolling** (and killing your 🧠 in the process). I wanted something that filtered **for me** instead of for the platform.

## How to use it

Install it from the Chrome Web Store, click the uFeed icon in your toolbar, and type in a few topics, one per line. A topic works better as a short list of concrete words than a single word or a full sentence, something like `software, programming, engineering, AI` if you're into software engineering, or `basketball, NBA, playoffs, highlights` for sports. Hit apply and keep scrolling like normal. Posts that don't match get blurred, everything else shows up untouched. There's a strictness slider in the same popup if the default is too loose or too tight for you.

## Privacy first

I wasn't going to ship an extension that reads your feed and sends it somewhere. Your feed says a lot about you, who you follow, what you stop on, what you scroll past. That's not something I wanted touching a server, mine or anyone else's. If a "privacy tool" needs to phone home to work, it's not a privacy tool, it's just data collection with better marketing.

So everything runs on your device. uFeed reads a post, scores it, forgets it, all inside your browser. No account, no server, no analytics, nothing to log even if I wanted to. That one rule, local only, no exceptions, ended up shaping the whole architecture, which is the part I actually want to get into.

## Why AI, and why now

I know I know, no one wants another AI tool in their life, but hear me out.

Without AI, filtering your feed for relevance would require either lots of inflexible rules based on keywords, or a server-side model that sees everything you read. Neither is ideal: the first is brittle and hard to maintain, the second compromises privacy.

A few years ago "local AI" meant a toy model that could barely finish a sentence, today you can run sophisticated models right in your browser tab. The device finally got fast enough, so why send the data anywhere. uFeed does the same thing for one job: read a post, decide if it's actually about what you said you care about.

## How it works 🤓

<img src="/images/lensing-how-it-works.svg" alt="Flowchart: the content script on the host page exchanges post text and scores with a hidden extension-origin iframe, which hands text to a worker thread running e5-small-v2 to embed and score it against your topics" style="max-width: 290px;" />

The picture shows three pieces, and each one does one job. The **content script** sits right inside the page, watching your feed as you scroll, it's the only one that can actually see a post and blur it. As posts come in, it hands their text off to the **iframe**, whose only job is passing that text along and bringing a score back. That score comes from the **worker**, where the model itself lives: it reads the text, compares it to your topics, and works out how close a match it is.

Splitting the work like that keeps the actual thinking off to the side, so it never slows down your scrolling. It's also why nothing about your feed goes anywhere: each part only ever passes along a bit of text or a number, never the page itself, and none of it leaves your device.

### The model

uFeed runs on E5-small-v2, a text embedding model out of Microsoft, and it's a good fit for exactly this job for three reasons. It's tiny, 33M parameters, small enough to run inside a browser tab without melting the page. It didn't need hand-labeled training data to get good, it was trained on naturally occurring pairs of text scraped from the internet, so it generalizes to "is this post about my topic" without me fine-tuning anything. And despite the size it's not a toy: zero-shot, it was the first embedding model to beat BM25, the decades-old keyword-search algorithm, on a standard benchmark, and after fine-tuning it beat models forty times its size. That's the ratio that matters when the thing has to run on a phone instead of a rack of GPUs.

<small><em>Credits to: Wang, Liang and Yang, Nan and Huang, Xiaolong and Jiao, Binxing and Yang, Linjun and Jiang, Daxin and Majumder, Rangan and Wei, Furu</em></small>


## Improving your feeds even more

Strictness is a 0–10 slider, and every step is a measured threshold rather than a guess, the popup tells you roughly how much of a typical feed survives at that setting, including how much of what survives will still turn out off-topic. It won't be perfect and it doesn't pretend to be: it reads words, not pictures, so a photo with no caption can't be judged on content, and it matches subjects, not quality, so a great post and a mediocre one about the same thing both get through.

There's also a thumbs-up/thumbs-down option, off by default. Rate a post, and the next repost or copy of it follows your call instead of getting judged from scratch. Everything else still goes by your topics as usual, and rating the same post again just undoes it.

None of that tuning is stuck on one machine either. The popup can export your settings, topics, strictness, every toggle you've flipped, plus every correction you've made, into a single backup file, and import it back on another browser or another computer. So if you've spent a few weeks training uFeed on what "on-topic" means to you, you can hand that same tuning to your laptop, your work computer, wherever else you use it, instead of starting over.

## Next steps

Right now uFeed is Chrome Web Store only. The build already runs on Firefox, MV3 works there too, it's just not published to Firefox Add-ons or the Microsoft Edge store yet. That's next, and it's not just a box to check: Firefox for Android only installs extensions that come from a curated AMO collection, no sideloading. Getting listed there is what actually puts uFeed on a phone, not a separate mobile build.

## Try it

[uFeed](https://chromewebstore.google.com/detail/ahlojbckjlffcfdhmkjepaglnhhpmdck) works on X, LinkedIn and Reddit today. Pick a few topics, give it a feed, and see what's left once the noise is gone.

So, how are you dealing with brain engineering in your social feeds?

<small><em>This post was co-authored with Claude.</em></small>
