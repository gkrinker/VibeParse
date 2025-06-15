# 🎯 Product Requirements Document 

## 🧭 Market Context

### The Rise of 'Vibe Coding'

We're entering an era where AI is generating more code than humans. Developers are increasingly pasting in Copilot or ChatGPT-generated snippets without deeply understanding them. This is especially true in rapid prototyping or MVP work—where time trumps clarity.

But the cost comes later: debugging code you don't understand, misusing libraries, or being unable to explain how things work to teammates or future maintainers. Reading code is cognitively taxing. Watching a quick, bite-sized explanation, tailored to your skill level, reduces friction and makes understanding code feel more like a tutorial than doing a chore.

This product is purpose-built for that moment—the early days of 'vibe coding'—where AI writes the code, and you just want to know what it actually *does*.

---

## 👥 User Segments (Pain is the Pitch)

### 1. Coding Bootcamp Students
- **Pain**: You paste in some Copilot code that sort of does what you want, but you have no idea how it works. You try to trace it line by line, but it feels like deciphering hieroglyphics. You don't want to keep asking instructors dumb questions, and you're too early to read documentation fluently. AI coding was supposed to save time—not leave you more lost.
- **Distribution Strategy**:
  - Partner with bootcamps to offer free trials
  - Target Reddit (r/learnprogramming) and Discord servers with short explainer clips

### 2. Junior Developers / Interns
- **Pain**: You used ChatGPT to scaffold your feature, and now there's a bug. You don't even remember how half of this logic came together. You stare at a wall of code, unsure where the problem starts, too embarrassed to ask your senior dev to walk through what *your* commit does. You just want a five-minute breakdown so you can fix it, fast.
- **Distribution Strategy**:
  - Share video explainers for trending GitHub repos on LinkedIn
  - Twitter/X ads targeting early-career devs
  - Offer Chrome extension to use directly on GitHub

### 3. Technical PMs / Designers / Non-coders
- **Pain**: The dev team shared a link to a GitHub repo with the new AI-generated backend logic. It looks like Greek. You scroll through hundreds of lines, trying to extract enough context to write your spec or update a deck. You wish someone could just summarize what this thing *does*, in plain English.
- **Distribution Strategy**:
  - Publish demo videos explaining famous open-source projects
  - Launch on ProductHunt with a "non-coder friendly" angle
  - LinkedIn ads focused on PMs and tech leads

### 4. Dev Content Creators / Educators
- **Pain**: You're working on a tutorial about using AI to build apps fast, but you barely understand the code Copilot wrote. You know it works, but now you have to explain it, line by line, to your audience. You spend more time reverse-engineering than teaching. What should be effortless content turns into a research project.
- **Distribution Strategy**:
  - Partner with YouTubers, Twitch streamers, and Udemy instructors
  - Create an affiliate/referral program with generous rev share
  - Run paid campaigns in creator newsletters (e.g. Bytes.dev)

---

## 🧪 MVP Requirements

- ✅ GitHub URL input (file or directory)
- ✅ Proficiency level selection
- ✅ Depth selection: line-by-line, chunk, key-parts
- ✅ Syntax highlighting (mobile and desktop)
- ✅ Bite-sized code explanations (text)
- ✅ Downloadable/shareable text summary
- ✅ Responsive layout (desktop + mobile)
- ✅ Queue/Status page for explanation generation
- ✅ Rate limiting to protect costs

---

## 💰 Monetization Strategy

### ⭐ Top Recommendation: Paid Credits for Explainers
- Users pay for credits (e.g. 3 videos = $5, 10 = $10)
- **Why**:
  - Easy entry for low-commitment users
  - Freemium model = wide top of funnel
  - Allows tight cost control on AI/video processing
- **MRR Estimate (Month 1)**:
  - 1,000 free signups via Reddit + PH + LinkedIn
  - 10% convert → 100 paid users
  - Avg spend $10 → **$1,000 MRR**

### ⚠️ Alternative 1: Subscription SaaS ($20/mo)
- Higher barrier for casual users
- Harder to justify unless using weekly

### ⚠️ Alternative 2: Ad-Supported Videos
- Poor UX, hurts perceived quality
- Revenue per user too low to justify AI + video cost

---

## ❗ Biggest Uncertainties + Mitigations

### ❓ Will users *actually* watch explainer videos of code?
- **24h Test**: Post 3 code explainers on Reddit + Twitter. Measure watch rate + engagement.
- **Mitigation**: Offer a faster, lightweight mode: "text + audio only"—no visuals, no video rendering. This makes it cheaper to produce and faster to deliver while still delivering the core value of clarity. It also gives users an option when they want a quick listen or skim, not a full walkthrough.

### ❓ Will LLMs give consistently accurate + simple explanations?
- **Test**: Run 20 sample files through prompt variations.
- **Mitigation**: Add feedback button on every video: "Was this accurate?"

### ❓ Can we keep generation cost low enough for profit?
- **Data**: Track average API + rendering time per explainer in MVP
- **Mitigation**: Cap free usage and experiment with token-efficient prompts

### ❓ Will context switching (leaving coding environment) hurt adoption?
- **Risk**: Requiring users to leave GitHub, VS Code, or their coding tool to visit a separate website to view their video might break flow and reduce usage.
- **Mitigation**: Develop a browser extension or in-editor plugin (e.g., VS Code) to preview and access videos directly within GitHub or the IDE. Offer deep-link embeds or inline previews on PR comments.

## 📝 Explanation Design Principles

### Structure for Maximum Engagement
To maximize impact, especially on mobile platforms, our explanations should be structured into **short, high-impact sections**:

#### ⏱ Section Length Strategy
- **Primary Section Length**: 15–30 seconds to read
  - Ideal for maintaining attention
  - Enough time to cover one concept with context
- **Micro-Sections**: 3–7 seconds
  - Zoom into individual lines or logic
  - Used for highlighting specific parts of the code

#### 📱 Content Structure Examples
- **Section 1 (20s)**: *"What does this function do?"*
  - 3s: Show function signature
  - 10s: Plain-English explanation
  - 7s: Input/output example

- **Section 2 (25s)**: *"The clever part"*
  - 5s: Highlight key logic
  - 15s: Explain why it works
  - 5s: Analogy

- **Section 3 (15s)**: *"Watch out for this"*
  - 5s: Show potential problem area
  - 10s: Explain edge case or mistake

### 🎯 Proficiency-Based Pacing
- **Beginner**: 20–30s sections, slow pace, lots of analogies (3–5 per function)
- **Intermediate**: 15–20s sections, focus on "why", less scaffolding (2–3 per function)
- **Expert**: 10–15s sections, dense and sharp insights (1–2 per function, mostly edge cases)

### 🧠 Cognitive Load Strategy
- Follow the **7±2 Rule** of working memory
- Stick to 1–2 concepts per section
- Use highlighting and formatting to reduce visual overload

#### 🌀 Spaced Reinforcement
- Start each section with a 2–3s recap
- End with a teaser or leading thought for the next bit

### 🖼️ Production & Prompting Implications
- **Prompt Template**: Each section prompt should:
  - Focus on one concept only
  - Include a code snippet to highlight visually
  - Include an analogy, example, or warning if appropriate

---

## 🚀 Non-MVP Feature Ideas

These features are not required for the initial launch but represent high-leverage extensions to improve adoption, retention, and engagement across power users, teams, and educators.

### 🧩 Platform & Integration
- **Browser Extension and IDE Plugin**: Allow users to generate and view explainers directly in GitHub, VS Code, or browser tabs—eliminating the need to visit a separate site.
- **Save Video for Later**: Users can bookmark and organize generated videos in their dashboard for review, sharing, or rewatching.

### 🌐 Accessibility and Customization
- **Multi-language Support**: Generate explanations and voiceovers in multiple spoken and programming languages to serve international and multilingual users.
- **Customize Voice and Visual Style**: Let users choose narration voice tone (e.g., friendly, professional, funny) and video theme (e.g., dark mode, brand colors).

### 👥 Community & Collaboration
- **Peer Review System**: Users can validate, flag, or suggest improvements to AI explanations, improving trust and accuracy.
- **Q&A Integration**: Let users ask follow-up questions directly to the AI—or link out to relevant Stack Overflow discussions and similar forums.

### 📊 Intelligence and History
- **User History and Insights**: Show users a history of their analyzed files and track improvement over time.
- **Smart Suggestions**: Recommend related repos or explanations based on previous usage.

### 📝 Non-MVP Feature: Reading Mode for Scripts
- Allow users to view the generated explanation script as formatted Markdown or HTML for reading, not just for video consumption.
- This mode should provide clear scene structure, code highlights, and explanations for users who prefer to read rather than watch a video.

## ⚠️ Additional Risk Mitigation (June 2024)
- Before production, enforce a hard limit on the number of files and/or total code size (lines/tokens) per request to prevent LLM overload and ensure reliability.
- If a file or batch is too large for the LLM, handle gracefully: inform the user, skip the file, and suggest splitting or reducing scope.
- Batching strategy: group files into batches under the LLM token limit; if a single file is too large, handle as above.

---

