# Instructions: Add LLM Throttling and Retry Logic to Script Generation

## Goal
Add retry logic and throttling to all LLM API calls in `src/services/script_generator.py` to avoid hitting OpenAI rate limits (429 errors). This should apply to both batch LLM calls and the intro chapter LLM call.

---

## 1. Add an Async Retry Helper Function
Place this function near the top of `src/services/script_generator.py` (after imports):

```python
import asyncio

def logger():
    # Use the existing logger in the file
    pass

async def call_llm_with_retries(llm_call, *args, max_retries=3, base_delay=2, **kwargs):
    for attempt in range(max_retries):
        try:
            return await llm_call(*args, **kwargs)
        except Exception as e:
            if hasattr(e, 'status_code') and e.status_code == 429:
                wait_time = base_delay * (2 ** attempt)
                logger.warning(f"[Throttling] 429 Too Many Requests. Retrying in {wait_time} seconds (attempt {attempt+1}/{max_retries})...")
                await asyncio.sleep(wait_time)
            else:
                raise
    raise RuntimeError("Exceeded maximum retries for LLM call due to repeated 429 errors.")
```

---

## 2. Wrap Each Batch LLM Call
In the batch processing loop, replace the direct LLM call with the following pattern:

```python
try:
    async def llm_batch_call():
        return await self.llm_service.client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7
        )
    response = await call_llm_with_retries(llm_batch_call)
    batch_response = response.choices[0].message.content
    messages.append({"role": "assistant", "content": batch_response})
    script = self.llm_service._parse_response(batch_response, batch)
    logger.info(f"[Batching] Chapter {idx+1} processed successfully. Scenes added: {len(script.scenes)}.")
    # Number scenes globally...
    if idx < len(batches) - 1:
        logger.info("[Throttling] Sleeping 2 seconds before next batch to avoid rate limits...")
        await asyncio.sleep(2)
except Exception as e:
    logger.error(f"[Batching] Error processing chapter {idx+1}: {e}. Skipping chapter.")
    skipped_files.extend([f['path'] for f in batch])
    continue
```

---

## 3. Wrap the Intro Chapter LLM Call
Replace the intro chapter LLM call with:

```python
messages.append({"role": "user", "content": intro_prompt})
logger.info("[IntroChapter] Sending prompt to LLM for intro chapter generation (in chat history)...")
async def llm_intro_call():
    return await self.llm_service.client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.5
    )
intro_response = await call_llm_with_retries(llm_intro_call)
```

---

## 4. Logging
- Ensure all retry and throttling events are logged using the existing logger.
- Log when a retry occurs, and when a 2-second delay is added between batches.

---

## 5. Testing
- Test with a large repo to ensure 429 errors are handled gracefully and the script generation completes without crashing.
- Check logs to confirm that retries and throttling are working as expected.

---

## 6. Notes
- The retry helper uses exponential backoff: waits 2s, 4s, 8s (up to 3 tries).
- The 2s delay between batches helps avoid bursts that could exceed your OpenAI rate limits.
- If you need to adjust the delay or max retries, change the `base_delay` or `max_retries` parameters in the helper. 