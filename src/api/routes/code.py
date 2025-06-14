from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from src.services.github_service import GitHubService
import os

router = APIRouter()
github_service = GitHubService()

class CodeRequest(BaseModel):
    github_url: HttpUrl
    file_types: Optional[List[str]] = None
    save_to_disk: Optional[bool] = False

def save_files_to_disk(files: List[dict], base_dir: str = "test_output") -> List[str]:
    saved_paths = []
    for file in files:
        file_path = os.path.join(base_dir, file["path"])
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(file["content"])
        saved_paths.append(file_path)
    return saved_paths

@router.post("/fetch-code")
async def fetch_code(request: CodeRequest):
    """
    Fetch code from a GitHub URL. The URL can point to either a file or a directory.
    If it's a directory, you can optionally specify file types to include.
    If save_to_disk is true, save the files to test_output/.
    """
    try:
        url = str(request.github_url)
        
        # Check if URL points to a file or directory
        if "/blob/" in url:
            result = await github_service.get_file_content(url)
            files = [result]
        elif "/tree/" in url:
            files = await github_service.get_directory_content(url, request.file_types)
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid GitHub URL. Must point to a file (blob) or directory (tree)."
            )
        
        if request.save_to_disk:
            saved_paths = save_files_to_disk(files)
            return {"saved_files": saved_paths}
        else:
            return {"files": files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 