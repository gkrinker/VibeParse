from typing import List, Optional
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