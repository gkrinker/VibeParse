from typing import List, Dict, Optional
import os
from pathlib import Path
from .github_service import GitHubService
from .llm_service import LLMService
from ..models.script import Script
import tiktoken
import re
import logging
import time
import asyncio
import openai

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global rate limiter - only allow one LLM call at a time
llm_semaphore = asyncio.Semaphore(1)

class ScriptGenerator:
    def __init__(self):
        self.github_service = GitHubService()
        self.llm_service = LLMService()
        
    async def generate_script_from_url(
        self,
        github_url: str,
        proficiency: str = "beginner",
        depth: str = "key-parts",
        file_types: Optional[List[str]] = None,
        save_to_disk: bool = True
    ) -> Script:
        """
        Generate a script from a GitHub URL with per-file batching and error handling for large files.
        
        Args:
            github_url: URL of the GitHub file or directory
            proficiency: User's proficiency level
            depth: Explanation depth
            file_types: Optional list of file extensions to include
            save_to_disk: Whether to save the script to disk
            
        Returns:
            Generated Script object
        """
        # Check if mock mode is enabled
        MOCK_LLM_MODE = os.environ.get("MOCK_LLM_MODE", "false").lower() == "true"
        if MOCK_LLM_MODE:
            logger.info("[MockLLM] MOCK MODE ENABLED: Using existing src_script.md instead of making LLM calls")
            return await self._generate_mock_script(github_url, save_to_disk)
        
        logger.info("Starting script generation...")
        logger.info(f"URL: {github_url}")
        logger.info(f"Proficiency: {proficiency}")
        logger.info(f"Depth: {depth}")
        logger.info(f"File types: {file_types}")
        logger.info(f"Save to disk: {save_to_disk}")
        
        # Check JSON vs Markdown mode
        USE_JSON_SCRIPT_PROMPT = os.environ.get("USE_JSON_SCRIPT_PROMPT", "false").lower() == "true"
        logger.info(f"[ScriptGenerator] USE_JSON_SCRIPT_PROMPT: {USE_JSON_SCRIPT_PROMPT}")
        
        # Fetch code from GitHub
        files = await self.github_service.fetch_code(github_url, file_types)
        logger.info(f"[ScriptGenerator] Fetched {len(files)} files from GitHub")
        
        # Tokenizer for estimation
        enc = tiktoken.encoding_for_model("gpt-4")
        MAX_TOKENS = 10000  # Safe threshold per batch
        batches = []
        current_batch = []
        current_tokens = 0
        skipped_files = []
        for f in files:
            # Estimate tokens for this file
            file_tokens = len(enc.encode(f['content']))
            # If file itself is too large, skip it
            if file_tokens > MAX_TOKENS:
                logger.warning(f"Skipping file '{f['path']}' (tokens: {file_tokens}) - too large for a single batch.")
                skipped_files.append(f['path'])
                continue
            # If adding this file would exceed the batch limit, start a new batch
            if current_tokens + file_tokens > MAX_TOKENS and current_batch:
                logger.info(f"Created batch with {len(current_batch)} files, total tokens: {current_tokens}.")
                batches.append(current_batch)
                current_batch = []
                current_tokens = 0
            current_batch.append(f)
            current_tokens += file_tokens
        if current_batch:
            logger.info(f"Created batch with {len(current_batch)} files, total tokens: {current_tokens}.")
            batches.append(current_batch)
        
        logger.info(f"[ScriptGenerator] Created {len(batches)} batches for processing")
        
        # Process each batch using a single chat history
        all_scenes = []
        global_scene_idx = 1
        messages = [
            {"role": "system", "content": "You are an expert code explainer. Format output in Markdown as a list of scenes."}
        ]
        for idx, batch in enumerate(batches):
            chapter_title = f"Chapter {idx+1}: Files in this chapter"
            chapter_content = "This chapter covers the following files:\n" + "\n".join([f['path'] for f in batch])
            from ..models.script import Scene
            chapter_scene = Scene(
                title=chapter_title,
                duration=5,
                content=chapter_content,
                code_highlights=[]
            )
            all_scenes.append(chapter_scene)
            logger.info(f"[Batching] Processing chapter {idx+1}/{len(batches)} with {len(batch)} files...")
            
            # Check if we should use the new JSON path
            if USE_JSON_SCRIPT_PROMPT:
                logger.info(f"[ScriptGenerator] Using NEW JSON path for batch {idx+1}")
                try:
                    # Use the new LLMService.generate_script method
                    script = await self.llm_service.generate_script(batch, proficiency, depth)
                    logger.info(f"[ScriptGenerator] JSON path returned: {type(script)}")
                    if isinstance(script, dict):
                        logger.info(f"[ScriptGenerator] JSON response has {len(script.get('chapters', []))} chapters")
                        # Use the new from_json_response method
                        from ..models.script import Script
                        script = Script.from_json_response(script)
                        logger.info(f"[ScriptGenerator] Converted JSON to Script with {len(script.scenes)} scenes")
                    else:
                        logger.info(f"[ScriptGenerator] JSON path returned Script object with {len(script.scenes)} scenes")
                    
                    # Number scenes globally
                    for scene in script.scenes:
                        if not re.match(r'^Scene \d+:', scene.title):
                            scene.title = f"Scene {global_scene_idx}: {scene.title}"
                        global_scene_idx += 1
                        all_scenes.append(scene)
                except Exception as e:
                    logger.error(f"[ScriptGenerator] Error in JSON path for batch {idx+1}: {e}")
                    # Fall back to old path
                    logger.info(f"[ScriptGenerator] Falling back to old Markdown path for batch {idx+1}")
                    script = await self._process_batch_old_way(batch, proficiency, depth, messages, idx)
                    # Number scenes globally
                    for scene in script.scenes:
                        if not re.match(r'^Scene \d+:', scene.title):
                            scene.title = f"Scene {global_scene_idx}: {scene.title}"
                        global_scene_idx += 1
                        all_scenes.append(scene)
            else:
                logger.info(f"[ScriptGenerator] Using OLD Markdown path for batch {idx+1}")
                script = await self._process_batch_old_way(batch, proficiency, depth, messages, idx)
                # Number scenes globally
                for scene in script.scenes:
                    if not re.match(r'^Scene \d+:', scene.title):
                        scene.title = f"Scene {global_scene_idx}: {scene.title}"
                    global_scene_idx += 1
                    all_scenes.append(scene)
            
            logger.info(f"[Batching] Chapter {idx+1} processed successfully. Scenes added: {len(script.scenes)}.")
            
            if idx < len(batches) - 1:
                logger.info("[Throttling] Sleeping 5 seconds before next batch to avoid rate limits...")
                await asyncio.sleep(5)
        
        # Add a scene at the start if any files were skipped
        if skipped_files:
            from ..models.script import Scene
            skip_scene = Scene(
                title="Skipped Files",
                duration=10,
                content="The following files were skipped because they were too large to process in a single request:\n" + "\n".join(skipped_files),
                code_highlights=[]
            )
            all_scenes.insert(0, skip_scene)
        
        final_script = Script(scenes=all_scenes)
        logger.info(f"[ScriptGenerator] Final script has {len(final_script.scenes)} scenes total")
        
        # Modular multi-scene intro chapter for directory submissions
        ENABLE_INTRO_CHAPTER = os.environ.get("ENABLE_INTRO_CHAPTER", "false").lower() == "true"
        is_directory = len(files) > 1
        if ENABLE_INTRO_CHAPTER and is_directory:
            logger.info("[IntroChapter] ENABLED: Generating multi-scene repo overview intro chapter in the same chat...")
            logger.info(f"[IntroChapter] Processing directory with {len(files)} files")
            # Fetch repo tree
            logger.info("[IntroChapter] Fetching repository tree structure...")
            repo_tree = self.github_service.get_repo_tree(github_url)
            logger.info(f"[IntroChapter] Retrieved {len(repo_tree)} files/directories in repo tree")
            # Build mapping of files to scene titles
            logger.info("[IntroChapter] Building file-to-scene mapping...")
            file_to_scenes = {}
            for scene in all_scenes:
                for ch in getattr(scene, 'code_highlights', []):
                    file_to_scenes.setdefault(ch.file_path, []).append(scene.title)
            logger.info(f"[IntroChapter] Mapped {len(file_to_scenes)} files to their scenes")
            # Format repo tree as indented list
            logger.info("[IntroChapter] Formatting repository tree structure...")
            def format_tree(paths):
                from collections import defaultdict
                tree = lambda: defaultdict(tree)
                root = tree()
                for path in paths:
                    parts = path.split('/')
                    d = root
                    for part in parts:
                        d = d[part]
                def _format(d, indent=0):
                    lines = []
                    for k, v in d.items():
                        lines.append('  ' * indent + k + ('/' if v else ''))
                        if v:
                            lines.extend(_format(v, indent+1))
                    return lines
                return '\n'.join(_format(root))
            repo_tree_str = format_tree(repo_tree)
            logger.info("[IntroChapter] Repository tree formatted successfully")
            # Format scene mapping
            logger.info("[IntroChapter] Formatting scene mapping for LLM prompt...")
            explained_files = '\n'.join(f"- {f}: {', '.join(titles)}" for f, titles in file_to_scenes.items())
            # Construct prompt for intro chapter
            intro_prompt = f"""Repository structure:
{repo_tree_str}

Files explained in detail:
{explained_files}

Please provide a high-level overview of the project structure, broken down into 2-4 scenes. For each scene:
1. Start with a title in the format: \"## Scene Title (duration in seconds)\"
2. Follow with the scene content explaining that part of the project
3. If you want to highlight any code, use the format:
   ### Code Highlights
   **filepath** (lines start-end):
   ```
   code here
   ```
   Description of the code
4. End each scene with \"---\"

Focus each scene on a logical part of the repo (e.g., main entry point, UI components, utilities, configuration).
For each file or group of files, briefly describe its likely purpose and how it fits into the project.
If a file was not covered in detail, make an educated guess based on its name and location.
Summarize how the files relate to each other and the overall architecture.

Format your answer as a list of scenes, each with a title, duration, and content."""
            messages.append({"role": "user", "content": intro_prompt})
            logger.info("[IntroChapter] Sending prompt to LLM for intro chapter generation (in chat history)...")
            try:
                async def llm_intro_call():
                    return await self.llm_service.client.chat.completions.create(
                        model="gpt-4o",
                        messages=messages,
                        temperature=0.5,
                    )

                intro_response = await call_llm_with_retries(llm_intro_call)
                logger.info("[IntroChapter] Received response from LLM, parsing intro scenes...")
                intro_scenes = self.llm_service._parse_response(
                    intro_response.choices[0].message.content, files
                ).scenes
                logger.info(f"[IntroChapter] Generated {len(intro_scenes)} intro scenes")
                final_script.scenes = intro_scenes + final_script.scenes
                logger.info(f"[IntroChapter] Final script now has {len(final_script.scenes)} scenes")
            except Exception as e:
                logger.error(f"[IntroChapter] Error generating intro chapter: {e}. Skipping intro chapter.")
        else:
            logger.info(f"[IntroChapter] DISABLED or not a directory (ENABLE_INTRO_CHAPTER={ENABLE_INTRO_CHAPTER}, is_directory={is_directory})")
        
        # Save to disk if requested
        if save_to_disk:
            self._save_script(final_script, github_url)
        
        logger.info(f"[ScriptGenerator] Script generation completed. Returning script with {len(final_script.scenes)} scenes")
        return final_script

    async def _process_batch_old_way(self, batch, proficiency, depth, messages, idx):
        """Process a batch using the old Markdown-based approach."""
        logger.info(f"[ScriptGenerator] Processing batch {idx+1} using old Markdown approach")
        # Construct batch prompt
        prompt = self.llm_service._construct_prompt(batch, proficiency, depth)
        messages.append({"role": "user", "content": prompt})
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
            logger.info(f"[ScriptGenerator] Old Markdown approach returned {len(script.scenes)} scenes")
            return script
        except Exception as e:
            logger.error(f"[Batching] Error processing chapter {idx+1}: {e}. Skipping chapter.")
            # Return empty script
            from ..models.script import Script
            return Script(scenes=[])
    
    async def _generate_mock_script(self, github_url: str, save_to_disk: bool = True) -> Script:
        """
        Generate a mock script by loading the existing src_script.md file.
        This method is used when MOCK_LLM_MODE is enabled to avoid making actual LLM calls.
        
        Args:
            github_url: URL of the GitHub file or directory (used for logging)
            save_to_disk: Whether to save the script to disk (ignored in mock mode)
            
        Returns:
            Script object loaded from src_script.md
        """
        # Handle empty or default URLs in mock mode
        if not github_url or github_url == 'mock-repo':
            github_url = 'mock-repo'
        
        logger.info(f"[MockLLM] Generating mock script for URL: {github_url}")
        
        # Determine which script file to load based on the URL
        script_path = "test_output/src_script.md"  # default
        
        # Try to find a more specific script file based on the URL
        if "App.tsx" in github_url:
            script_path = "test_output/App.tsx_script.md"
        elif "setcharacters.js" in github_url:
            script_path = "test_output/setcharacters.js_script.md"
        elif "MyActivity.java" in github_url:
            script_path = "test_output/MyActivity.java_script.md"
        elif "ExpertSingleFileTest" in github_url:
            script_path = "test_output/ExpertSingleFileTest.md"
        
        logger.info(f"[MockLLM] Loading script from: {script_path}")
        
        try:
            # Read the existing script file
            with open(script_path, "r", encoding="utf-8") as f:
                script_content = f.read()
            
            logger.info(f"[MockLLM] Successfully loaded script file ({len(script_content)} characters)")
            
            # Parse the markdown content into a Script object using the LLMService parser
            # Create a dummy files list for parsing
            dummy_files = [{"path": "mock_file.md", "content": script_content}]
            script = self.llm_service._parse_response(script_content, dummy_files)
            logger.info(f"[MockLLM] Successfully parsed script with {len(script.scenes)} scenes")
            logger.info("[MockLLM] Scene titles:")
            for scene in script.scenes:
                logger.info(f"  - {scene.title}")
            
            return script
                
        except Exception as e:
            logger.error(f"[MockLLM] Error loading or parsing script: {e}")
            raise RuntimeError(f"Failed to load mock script: {e}")
    
    def _save_script(self, script: Script, github_url: str) -> None:
        """Save the script to disk in Markdown format."""
        # Create test_output directory if it doesn't exist
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # Generate filename from GitHub URL
        filename = github_url.split("/")[-1].replace("/", "_")
        output_path = output_dir / f"{filename}_script.md"
        
        logger.info(f"[SaveScript] Saving script to {output_path}")
        logger.info(f"[SaveScript] Script contains {len(script.scenes)} scenes")
        logger.info("[SaveScript] Scene titles:")
        for scene in script.scenes:
            logger.info(f"  - {scene.title}")
        
        # Save the script
        with open(output_path, "w") as f:
            f.write(script.to_markdown())
        logger.info("[SaveScript] Script saved successfully")

async def call_llm_with_retries(llm_call, *args, max_retries=3, base_delay=30, **kwargs):
    """
    Call an LLM function with retry logic for rate limiting and other transient errors.
    Uses a global semaphore to ensure only one LLM call happens at a time.
    
    Args:
        llm_call: Async function to call
        *args: Arguments to pass to llm_call
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds for exponential backoff if headers are not available
        **kwargs: Keyword arguments to pass to llm_call
        
    Returns:
        Result from llm_call
        
    Raises:
        RuntimeError: If max retries exceeded
        Exception: Original exception if not a retryable error
    """
    async with llm_semaphore:  # Ensure only one LLM call at a time
        for attempt in range(max_retries):
            try:
                logger.info(f"[Throttling] Making LLM call (attempt {attempt+1}/{max_retries})...")
                return await llm_call(*args, **kwargs)
            except openai.RateLimitError as e:
                headers = e.response.headers
                logger.warning("[Throttling] OpenAI Rate Limit Error (429). Headers:")
                logger.warning(f"  - Limit Requests: {headers.get('x-ratelimit-limit-requests')}")
                logger.warning(f"  - Remaining Requests: {headers.get('x-ratelimit-remaining-requests')}")
                logger.warning(f"  - Reset Requests: {headers.get('x-ratelimit-reset-requests')}")

                reset_time_str = headers.get('x-ratelimit-reset-requests')
                
                # Use the reset time from the header if available, otherwise use exponential backoff with a 30s base
                if reset_time_str:
                    try:
                        if reset_time_str.endswith('ms'):
                            wait_time = float(reset_time_str.replace('ms', '')) / 1000.0
                        else:
                            wait_time = float(reset_time_str.replace('s', ''))
                        wait_time += 0.1  # Add a small buffer
                        logger.warning(f"[Throttling] Rate limit exceeded. Waiting for {wait_time:.2f} seconds based on 'x-ratelimit-reset-requests'.")
                    except (ValueError, AttributeError):
                        wait_time = base_delay * (2 ** attempt)
                        logger.warning(f"[Throttling] Could not parse reset time '{reset_time_str}'. Falling back to exponential backoff: {wait_time}s.")
                else:
                    wait_time = base_delay * (2 ** attempt)
                    logger.warning(f"[Throttling] No reset time in header. Falling back to exponential backoff: {wait_time}s.")

                await asyncio.sleep(wait_time)

            except Exception as e:
                # Fallback for other retryable errors
                if hasattr(e, 'status_code') and e.status_code >= 500:
                    wait_time = base_delay * (2 ** attempt)
                    logger.warning(f"[Throttling] Server error {e.status_code}. Retrying in {wait_time} seconds (attempt {attempt+1}/{max_retries})...")
                    await asyncio.sleep(wait_time)
                elif "timeout" in str(e).lower() or "connection" in str(e).lower():
                    wait_time = base_delay * (2 ** attempt)
                    logger.warning(f"[Throttling] Connection/timeout error: {e}. Retrying in {wait_time} seconds (attempt {attempt+1}/{max_retries})...")
                    await asyncio.sleep(wait_time)
                else:
                    # Non-retryable error, re-raise immediately
                    logger.error(f"[Throttling] Non-retryable error on attempt {attempt+1}: {e}")
                    raise
    raise RuntimeError(f"Exceeded maximum retries ({max_retries}) for LLM call due to repeated errors.") 