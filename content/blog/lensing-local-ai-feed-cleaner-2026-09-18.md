# Lensing, a local AI feed cleaner for your social feeds

<!-- description: Lensing is a browser extension that blurs off-topic posts on X, LinkedIn and Reddit using a small language model that runs entirely on your device. Here's why I built it and how the on-device model actually works. -->

![Lensing icon and wordmark, "Blur what's off topic", on a dark background](/images/lensing-promo.png)

A few days ago I shipped [Lensing](https://chromewebstore.google.com/detail/lensing/ahlojbckjlffcfdhmkjepaglnhhpmdck) to the Chrome Web Store. It's a browser extension that blurs the posts in your feed that don't match topics you actually care about, and by default collapses them down to a thin row so they barely take up space. Nothing gets deleted and nothing disappears for good, a blurred post is one click away, it just stops being the thing your thumb hits first.

## Why I built it

I kept opening LinkedIn or X to check on one specific thing and leaving twenty minutes later having read none of it. Rage bait, the outrage of the day, someone's hot take on a topic I never asked to hear about. The feed's job is to keep you scrolling, not to show you what you actually opened the app for, and those two goals overlap less every year. I wanted a filter that worked for me instead of for the platform's engagement numbers.

## Privacy first

The one thing I was not willing to ship was an extension that reads your feed and sends it somewhere. Your feed is one of the more personal things about you: who you follow, what you stop on, what you scroll past without a second look. Keeping that on your device wasn't a nice-to-have, it was the actual point of building this. A "privacy tool" that phones home to work isn't a privacy tool, it's a data collector with a better pitch.

So everything runs on-device. Lensing reads the text of a post in your browser, scores it in your browser, and forgets it. No account, no server, no analytics, nothing to log even if I wanted to. That one constraint, local only, no exceptions, is also what decided the whole architecture, which is the part I actually want to talk about.

## Why AI, and why now

This only works because small models finally got good enough to run in a browser tab. A few years back, "local AI" meant a toy model that could barely hold a sentence together. Now Whisper.cpp transcribes audio offline on a laptop, Ollama runs a genuinely useful coding model on your own GPU, Apple does on-device summarization on an iPhone, Chrome itself ships a small model on-device for tasks like this. Same trend everywhere: push the model down to the device instead of the data up to a server, because the device finally got fast enough and people got tired of paying the latency and the privacy tax of a round trip. Lensing rides that same wave, just for one narrow job: read a post, decide if it's actually about what you said you care about.

## The model doing the work: E5-small-v2

The model under the hood is E5-small-v2, out of a 2022 paper called "Text Embeddings by Weakly-Supervised Contrastive Pre-training". Here's the idea without the jargon.

An embedding is a way of turning a piece of text into a list of numbers, a vector, such that texts with similar meaning land close together in that number space and unrelated ones land far apart. Once you have that, "is this post about my topic" stops being a language problem and turns into a distance problem: turn the post into a vector, turn your topic into a vector, measure how close they sit (cosine similarity), done. No keyword lists, no "contains the word crypto".

Training a good embedding model usually means paying people to label pairs of sentences as related or not, which is slow and doesn't scale. E5's trick was skipping that entirely: the authors pulled around 270 million pairs of text that already sit next to each other naturally on the internet, a Reddit post and its top comment, a question and its accepted answer, a title and its body, on the bet that text placed next to text is usually related. They trained on that with contrastive learning: show the model a real pair, show it a batch of random, unrelated pairs alongside it, and nudge the model until real pairs land close and random ones land far apart. A smaller fine-tuning pass on actual labeled data sharpens it after that first big, cheap phase.

The architecture itself isn't exotic, a standard BERT-style transformer that reads the text and pools the output into one fixed-size vector. It ships in three sizes, small at 33M parameters, base at 110M, large at 330M, and small is the one that makes sense running inside a browser tab instead of a server rack.

One detail that actually matters if you're using this model instead of just reading about it: E5 expects you to prefix your text before embedding it, `query: ` for the thing you're comparing from, `passage: ` for the thing being compared against. Skip the prefixes and accuracy drops, quietly, no error thrown. In Lensing your topic is the query and every post is a passage. Get that backwards and the scores just get worse without telling you why.

The paper's headline result: without training on any labeled data for the target task, E5 was the first embedding model to beat BM25, the decades-old keyword-search algorithm search engines were built on, on a standard retrieval benchmark. After fine-tuning, it beat embedding models forty times its size. That ratio of quality to size is exactly why it made sense for something that has to run on a laptop or a phone instead of a rack of GPUs.

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
