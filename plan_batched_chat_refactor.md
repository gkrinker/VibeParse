# Plan: Refactor Batching to Use a Single Chat (Conversation History)

## Overview

Currently, each batch of files is processed with a separate, stateless LLM call. This plan outlines how to refactor the batching logic to use a single chat (conversation history) for all batches, so the LLM has access to all previous context. This should improve lesson cohesion, reduce redundancy, and enable better cross-file insights.

---

## 1. High-Level Steps

1. **Initialize the Chat**
   - Start with a system prompt (instructions, repo context, etc.).

2. **Iterate Over Batches**
   - For each batch:
     - Append the batch prompt as a new user message to the `messages` list.
     - Call the LLM with the full message history.
     - Append the LLM's response as an assistant message to the `messages` list.
     - Parse and store the scenes as usual.

3. **Intro Chapter (Optional)**
   - If generating the intro chapter last, append a user message requesting a high-level summary, referencing all previous content.
   - Call the LLM with the full message history and parse the intro scenes.

4. **Final Assembly**
   - Aggregate all scenes (intro + batch scenes) into the final script.

---

## 2. Implementation Details

### a. Message History Structure
```python
messages = [
    {"role": "system", "content": "You are an expert code explainer..."}
]
for batch in batches:
    messages.append({"role": "user", "content": batch_prompt})
    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=messages,
        ...
    )
    messages.append({"role": "assistant", "content": response.choices[0].message.content})
    # Parse and store scenes
```

### b. Prompt Engineering
- Each batch prompt should be self-contained but may reference previous explanations if needed.
- Consider including a running summary or explicit instructions to avoid redundancy.

### c. Context Window Management
- Each API call includes the full message history, so token usage grows with each batch.
- For large repos, monitor the total token count and truncate or summarize earlier messages if needed.
- Optionally, only keep the most recent N messages or add a summary message after every M batches.

---

## 3. Token/Context Limit Analysis

### GPT-4o (128k tokens)
- **System prompt:** ~500 tokens
- **Each batch prompt:** ~500-1,000 tokens (depends on number/size of files)
- **Each LLM response:** ~1,000-2,000 tokens (depends on number of scenes)
- **Example:**
  - 1 batch = 1,500 (prompt) + 2,000 (response) = 3,500 tokens
  - 10 batches = 35,000 tokens
  - 20 batches = 70,000 tokens
  - Leaves room for intro chapter and some buffer
- **Estimate:**
  - If each batch covers ~10 files, and you have 20 batches, you can process ~200 files before hitting the 128k token limit (assuming average batch size and response length).

### GPT-4 (32k tokens)
- **System prompt:** ~500 tokens
- **Each batch prompt:** ~500-1,000 tokens
- **Each LLM response:** ~1,000-2,000 tokens
- **Example:**
  - 1 batch = 3,500 tokens
  - 5 batches = 17,500 tokens
  - 8 batches = 28,000 tokens
- **Estimate:**
  - If each batch covers ~10 files, and you have 8 batches, you can process ~80 files before hitting the 32k token limit.

### Real-World Example (Recent Files)
- Recent runs processed ~60-70 files in 6-7 batches.
- With GPT-4o, this fits comfortably within the 128k token window.
- With GPT-4, you may need to reduce batch size or number of batches for very large repos.

---

## 4. Risks & Mitigations
- **Token Limit Exceeded:**
  - Monitor token usage per call.
  - Truncate or summarize earlier messages if needed.
- **Cost:**
  - Each call includes the full history, so cost per call increases as the chat grows.
- **Implementation Complexity:**
  - Need to manage message history and parsing carefully.

---

## 5. Next Steps
- Prototype the message history approach on a small repo.
- Measure token usage per batch and per call.
- Adjust batch size and summarization strategy as needed.
- Update prompt engineering to encourage cross-batch references and avoid redundancy.

---

## 6. References
- [OpenAI Chat API docs](https://platform.openai.com/docs/guides/gpt)
- [Token counting tool](https://platform.openai.com/tokenizer) 