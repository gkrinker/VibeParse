# Video route removed as video generation is no longer supported.

import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ...models.script import Scene, CodeHighlight, Script
from ...video.scene_to_video import SceneToVideo

router = APIRouter()
scene_to_video_service = SceneToVideo()

class VideoRequest(BaseModel):
    scene: Scene
    output_path: str = "scene.mp4"

class SceneIndexRequest(BaseModel):
    scene_index: int
    output_path: str = "scene.mp4"

def parse_scenes_from_md(md_path="test_output/src_script.md"):
    with open(md_path, "r") as f:
        lines = f.readlines()
    scenes = []
    i = 0
    while i < len(lines):
        if lines[i].strip().startswith("## "):
            # Extract scene title and duration
            title_line = lines[i].strip()
            title = title_line.replace("## ", "").split("(")[0].strip()
            duration = 20
            if "(" in title_line and "s" in title_line:
                try:
                    duration = int(title_line.split("(")[1].split("s")[0].strip())
                except Exception:
                    pass
            # Extract content until next '### Code Highlights' or next scene
            content_lines = []
            i += 1
            while i < len(lines):
                if lines[i].strip().startswith("### Code Highlights"):
                    i += 1
                    break
                if lines[i].strip().startswith("## ") or lines[i].strip().startswith("---"):
                    break
                content_lines.append(lines[i].strip())
                i += 1
            content = " ".join([l for l in content_lines if l])
            # Extract code highlights
            code_highlights = []
            while i < len(lines):
                line = lines[i].strip()
                if line.startswith("**"):
                    # Parse file path and lines
                    match = re.match(r"\*\*(.+?)\*\* \(lines (\d+)[-–](\d+)\):", line)
                    if match:
                        file_path = match.group(1).strip()
                        start_line = int(match.group(2))
                        end_line = int(match.group(3))
                        # Next line should be code block start
                        i += 1
                        code_lines = []
                        if lines[i].strip().startswith("```"):
                            i += 1
                            while i < len(lines) and not lines[i].strip().startswith("```"):
                                code_lines.append(lines[i].rstrip("\n"))
                                i += 1
                            i += 1  # skip closing ```
                        code = "\n".join(code_lines)
                        # Next non-empty line(s) is description
                        desc_lines = []
                        while i < len(lines):
                            desc_line = lines[i].strip()
                            if not desc_line or desc_line.startswith("**") or desc_line.startswith("##") or desc_line.startswith("---"):
                                break
                            desc_lines.append(desc_line)
                            i += 1
                        description = " ".join(desc_lines)
                        code_highlights.append(CodeHighlight(
                            file_path=file_path,
                            start_line=start_line,
                            end_line=end_line,
                            description=description,
                            code=code
                        ))
                    else:
                        i += 1
                elif line.startswith("## ") or line.startswith("---"):
                    break
                else:
                    i += 1
            scenes.append(Scene(
                title=title,
                duration=duration,
                content=content,
                code_highlights=code_highlights
            ))
        else:
            i += 1
    return scenes

@router.post("/generate-video")
async def generate_video(request: VideoRequest):
    """
    Generate a video for a single scene.
    """
    try:
        video_path = scene_to_video_service.scene_to_video(request.scene, request.output_path)
        return {"video_path": video_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-scene-video")
async def generate_scene_video(request: SceneIndexRequest):
    """
    Generate a video for a scene by index from the Markdown script.
    """
    try:
        print(f"[API] /generate-scene-video called with scene_index={request.scene_index}, output_path={request.output_path}")
        scenes = parse_scenes_from_md()
        print(f"[API] Parsed {len(scenes)} scenes from Markdown.")
        if request.scene_index < 0 or request.scene_index >= len(scenes):
            raise HTTPException(status_code=400, detail="Invalid scene index")
        scene = scenes[request.scene_index]
        print(f"[API] Selected scene: {scene.title}")
        print(f"[API] Starting video generation...")
        video_path = scene_to_video_service.scene_to_video(scene, request.output_path)
        print(f"[API] Video generation complete. Output: {video_path}")
        return {"video_path": video_path}
    except Exception as e:
        print(f"[API] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test-video-from-md")
async def test_video_from_md(md_path: str = "test_output/src_script.md", output_path: str = "test_output/sample_scene.mp4"):
    """
    Extract the first scene from a Markdown file and generate a video for it.
    """
    try:
        with open(md_path, "r") as f:
            lines = f.readlines()
        # Find the first scene
        scene_start = None
        for i, line in enumerate(lines):
            if line.strip().startswith("## Scene"):
                scene_start = i
                break
        if scene_start is None:
            raise Exception("No scene found in markdown.")
        # Extract scene title and duration
        title_line = lines[scene_start].strip()
        title = title_line.replace("## ", "").split("(")[0].strip()
        duration = 20
        if "(" in title_line and "s" in title_line:
            try:
                duration = int(title_line.split("(")[1].split("s")[0].strip())
            except Exception:
                pass
        # Extract content until next '### Code Highlights' or next scene
        content_lines = []
        i = scene_start + 1
        while i < len(lines):
            if lines[i].strip().startswith("### Code Highlights"):
                i += 1
                break
            if lines[i].strip().startswith("## Scene") or lines[i].strip().startswith("---"):
                break
            content_lines.append(lines[i].strip())
            i += 1
        content = " ".join([l for l in content_lines if l])
        # Extract code highlights
        code_highlights = []
        while i < len(lines):
            line = lines[i].strip()
            if line.startswith("**"):
                # Parse file path and lines
                match = re.match(r"\*\*(.+?)\*\* \(lines (\d+)[-–](\d+)\):", line)
                if match:
                    file_path = match.group(1).strip()
                    start_line = int(match.group(2))
                    end_line = int(match.group(3))
                    # Next line should be code block start
                    i += 1
                    code_lines = []
                    if lines[i].strip().startswith("```"):
                        i += 1
                        while i < len(lines) and not lines[i].strip().startswith("```"):
                            code_lines.append(lines[i].rstrip("\n"))
                            i += 1
                        i += 1  # skip closing ```
                    code = "\n".join(code_lines)
                    # Next non-empty line(s) is description
                    desc_lines = []
                    while i < len(lines):
                        desc_line = lines[i].strip()
                        if not desc_line or desc_line.startswith("**") or desc_line.startswith("##") or desc_line.startswith("---"):
                            break
                        desc_lines.append(desc_line)
                        i += 1
                    description = " ".join(desc_lines)
                    code_highlights.append(CodeHighlight(
                        file_path=file_path,
                        start_line=start_line,
                        end_line=end_line,
                        description=description,
                        code=code
                    ))
                else:
                    i += 1
            elif line.startswith("## Scene") or line.startswith("---"):
                break
            else:
                i += 1
        scene = Scene(
            title=title,
            duration=duration,
            content=content,
            code_highlights=code_highlights
        )
        video_path = scene_to_video_service.scene_to_video(scene, output_path=output_path)
        return {"video_path": video_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 