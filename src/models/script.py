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
        Transforms chapters/scenes structure to flat scenes array.
        """
        scenes = []
        
        # Add chapter header scene if there are multiple chapters
        if len(json_data.get("chapters", [])) > 1:
            chapter_titles = [chapter.get("title", "") for chapter in json_data.get("chapters", [])]
            scenes.append(Scene(
                title="Files in this chapter",
                duration=5,
                content=f"This chapter covers the following files:\n" + "\n".join(chapter_titles),
                code_highlights=[]
            ))
        
        # Process each chapter
        for chapter in json_data.get("chapters", []):
            chapter_title = chapter.get("title", "")
            chapter_files = chapter.get("files", [])
            
            # Add chapter header scene
            if len(json_data.get("chapters", [])) > 1:
                scenes.append(Scene(
                    title=f"Chapter: {chapter_title}",
                    duration=5,
                    content=f"This chapter covers the following files:\n" + "\n".join(chapter_files),
                    code_highlights=[]
                ))
            
            # Process scenes in this chapter
            for scene_data in chapter.get("scenes", []):
                # Create code highlight from scene data
                code_highlight = CodeHighlight(
                    file_path=chapter_files[0] if chapter_files else "unknown",
                    start_line=1,
                    end_line=1,
                    description=scene_data.get("explanation", ""),
                    code=scene_data.get("code", "")
                )
                
                # Create scene
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