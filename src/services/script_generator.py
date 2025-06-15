from typing import List, Dict, Optional
import os
from pathlib import Path
from .github_service import GitHubService
from .llm_service import LLMService
from ..models.script import Script
import tiktoken
import re

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
        # Fetch code from GitHub
        files = await self.github_service.fetch_code(github_url, file_types)
        
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
                print(f"[Batching] Skipping file '{f['path']}' (tokens: {file_tokens}) - too large for a single batch.")
                skipped_files.append(f['path'])
                continue
            # If adding this file would exceed the batch limit, start a new batch
            if current_tokens + file_tokens > MAX_TOKENS and current_batch:
                print(f"[Batching] Created batch with {len(current_batch)} files, total tokens: {current_tokens}.")
                batches.append(current_batch)
                current_batch = []
                current_tokens = 0
            current_batch.append(f)
            current_tokens += file_tokens
        if current_batch:
            print(f"[Batching] Created batch with {len(current_batch)} files, total tokens: {current_tokens}.")
            batches.append(current_batch)
        # Process each batch
        all_scenes = []
        global_scene_idx = 1
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
            print(f"[Batching] Processing chapter {idx+1}/{len(batches)} with {len(batch)} files...")
            try:
                script = await self.llm_service.generate_script(batch, proficiency, depth)
                print(f"[Batching] Chapter {idx+1} processed successfully. Scenes added: {len(script.scenes)}.")
                # Number scenes globally
                for scene in script.scenes:
                    # Only prepend if not already present
                    if not re.match(r'^Scene \d+:', scene.title):
                        scene.title = f"Scene {global_scene_idx}: {scene.title}"
                    global_scene_idx += 1
                    all_scenes.append(scene)
            except Exception as e:
                print(f"[Batching] Error processing chapter {idx+1}: {e}. Skipping chapter.")
                skipped_files.extend([f['path'] for f in batch])
                continue
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
        # Save to disk if requested
        if save_to_disk:
            self._save_script(final_script, github_url)
        return final_script
    
    def _save_script(self, script: Script, github_url: str) -> None:
        """Save the script to disk in Markdown format."""
        # Create test_output directory if it doesn't exist
        output_dir = Path("test_output")
        output_dir.mkdir(exist_ok=True)
        
        # Generate filename from GitHub URL
        filename = github_url.split("/")[-1].replace("/", "_")
        output_path = output_dir / f"{filename}_script.md"
        
        # Save the script
        with open(output_path, "w") as f:
            f.write(script.to_markdown()) 