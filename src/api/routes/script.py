from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from ...services.script_generator import ScriptGenerator
from ...models.script import Script

router = APIRouter()
script_generator = ScriptGenerator()

class ScriptRequest(BaseModel):
    github_url: str
    proficiency: str = "beginner"
    depth: str = "key-parts"
    file_types: Optional[List[str]] = None
    save_to_disk: bool = True

@router.post("/generate-script", response_model=Script)
async def generate_script(request: ScriptRequest):
    """
    Generate a script for explaining code from a GitHub URL.
    """
    try:
        script = await script_generator.generate_script_from_url(
            github_url=request.github_url,
            proficiency=request.proficiency,
            depth=request.depth,
            file_types=request.file_types,
            save_to_disk=request.save_to_disk
        )
        return script
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 