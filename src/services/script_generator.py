from typing import List, Dict, Optional
import os
from pathlib import Path
from .github_service import GitHubService
from .llm_service import LLMService
from ..models.script import Script

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
        Generate a script from a GitHub URL.
        
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
        
        # Generate script using LLM
        script = await self.llm_service.generate_script(files, proficiency, depth)
        
        # Save to disk if requested
        if save_to_disk:
            self._save_script(script, github_url)
            
        return script
    
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