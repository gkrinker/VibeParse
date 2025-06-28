from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class CodeHighlight(BaseModel):
    """Represents a highlighted section of code in a scene."""
    file_path: str
    start_line: int
    end_line: int
    description: str
    code: str = ""

class Scene(BaseModel):
    """Represents a single scene in the explanation script."""
    title: str
    duration: int  # in seconds
    content: str
    code_highlights: List[CodeHighlight]

class Script(BaseModel):
    """Represents the complete explanation script."""
    scenes: List[Scene]
    
    @classmethod
    def from_json_response(cls, json_data: Dict[str, Any]) -> "Script":
        """
        Create a Script from the new JSON response format.
        Flattens all LLM-provided scenes from all chapters, with no extra chapter header scenes.
        """
        scenes = []
        for chapter in json_data.get("chapters", []):
            chapter_files = chapter.get("files", [])
            for scene_data in chapter.get("scenes", []):
                file_path = scene_data.get("file_path") or (chapter_files[0] if chapter_files else "unknown")
                code_highlight = CodeHighlight(
                    file_path=file_path,
                    start_line=1,
                    end_line=1,
                    description=scene_data.get("explanation", ""),
                    code=scene_data.get("code", "")
                )
                scene = Scene(
                    title=scene_data.get("title", ""),
                    duration=scene_data.get("duration", 20),
                    content=scene_data.get("explanation", ""),
                    code_highlights=[code_highlight] if scene_data.get("code") else []
                )
                scenes.append(scene)
        return cls(scenes=scenes)
    
    def to_markdown(self) -> str:
        """Convert the script to Markdown format."""
        markdown = "# Code Explanation Script\n\n"
        
        for scene in self.scenes:
            markdown += f"## {scene.title} ({scene.duration}s)\n\n"
            markdown += f"{scene.content}\n\n"
            
            if scene.code_highlights:
                markdown += "### Code Highlights\n\n"
                for highlight in scene.code_highlights:
                    markdown += f"**{highlight.file_path}** (lines {highlight.start_line}-{highlight.end_line}):\n"
                    if highlight.code:
                        markdown += f"```\n{highlight.code}\n```\n"
                    markdown += f"{highlight.description}\n\n"
            
            markdown += "---\n\n"
            
        return markdown 