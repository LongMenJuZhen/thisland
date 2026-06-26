---
title: A Rant About Voice Input Methods
date: 2026-05-12


tags: []

draft: false
---

Oh my god 🫢 I actually have a blog? Wait, what ⬆️!

Alright, jokes aside, let me talk about what I've been doing these past two days.

If I don't write this down, these past few days will have been a complete waste of time.

I absolutely must record this lesson.



Here's what happened. We've entered the era of vibe coding now. With natural language programming gradually becoming a reality.

You'll find that typing to ask AI to do things is nowhere near as fast as just speaking. So a good voice input method has become a must-have tool.



However, commercial input methods are bundled with all sorts of random stuff. Some of them... well, considering this is a public webpage, I'll be polite and not name names.

> Some input methods, could you please stop pushing your PDF editor on me? I already have one. Every time I use it, it somehow gets replaced without my permission 😡

But aside from that legacy input method, the AI newcomers aren't actually that great either.

While thanks to new large language models their benchmark scores are pretty good.

But I really don't think a model that's only a few hundred million to a billion parameters needs to run in the cloud.

The internet at my rental place is terrible, so using these online input methods results in absurdly high latency. Not to mention:

> That thing made by some e-commerce giant... it's an input method, why do you need to bundle half a gigabyte of browser shell inside it? Memory is already expensive these days. And some manufacturers... you know... they have to release multiple AI apps, even with my new 32GB RAM laptop, it can't handle your bloat.

Of course, I've also tried Microsoft's. Microsoft's behavior is quite bizarre — the voice input in their input method runs online, but there's a voice control accessibility feature that comes with a voice input capability that doesn't require internet at all. Though the recognition rate isn't very high.

> So if you happen to see typos in this article, don't think twice — Microsoft's accessibility feature is entirely to blame.

So I thought, why not make one myself? And then I fell into a bottomless pit.

I first went to look at the Hugging Face leaderboard.

[Open ASR Leaderboard - a Hugging Face Space by hf-audio](https://huggingface.co/spaces/hf-audio/open_asr_leaderboard)

I looked through the models one by one from top to bottom to see if any were suitable... Meh...

You know what, I'm short on time so I'll cut to the chase.

Basically, I tried them one by one from top to bottom, and they either only support Linux, or only support English, or don't support streaming transmission. But I specifically wanted to find a model that supports Chinese, can do streaming/real-time recognition, and ideally has GPU acceleration on Windows.

After messing around for two or three days, burned through $5 on OpenRouter, and couldn't even get the most basic demo to run.

Until nearly midnight on the last day, I discovered this project comes with Rust bindings.

[k2-fsa/sherpa-onnx: Speech-to-text, text-to-speech, speaker diarization, speech enhancement, source separation, and VAD using next-gen Kaldi with onnxruntime without Internet connection. Support embedded systems, Android, iOS, HarmonyOS, Raspberry Pi, RISC-V, RK NPU, Axera NPU, Ascend NPU, x86_64 servers, websocket server/client, support 12 programming languages](https://github.com/k2-fsa/sherpa-onnx)

They even have Rust demo code.

And this demo can be run with a single script.

And the demo that actually ran was the Qwen ASR that I couldn't get working before.

And after it ran, it didn't even need a GPU to achieve real-time performance.

And it doesn't actually do streaming transmission but can fake being real-time.

Theoretically it looks quite hacky but the actual results are surprisingly good.

The only minor downside is that the documentation is a bit messy.

But the exploration ends here for now.

Looking back at these two days of fumbling around.

I think I was just too eager to start from the bottom layer and bypass these middlemen.

I always felt that building software this way would be cleaner and we could get access to new underlying technologies faster.

But the reality is that struggling with these unfamiliar low-level architectures is actually quite inefficient.

A mature solution can indeed solve many problems for you. There's a reason these projects exist.

Maybe instead of building layer by layer from the bottom up, it's better to clearly understand your requirements and then find a solution that 100% meets your needs, without worrying about how that solution is implemented.

That's it for today. I'll try to write more on this blog in the future. Today was just a random rambling post, but at least I updated, right? There's a long road ahead, I haven't given up on this site yet. See you around!

> Oh, by the way, did you notice that all numbers in today's article are actual digits instead of Chinese characters? That's another signature feature of Microsoft's accessibility tool.
