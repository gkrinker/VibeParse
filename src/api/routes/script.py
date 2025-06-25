from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from ...services.script_generator import ScriptGenerator
from ...models.script import Script, Scene, CodeHighlight
import os
import uuid
import re
from fastapi.responses import JSONResponse

router = APIRouter()
script_generator = ScriptGenerator()

# In-memory storage for scripts by ID
script_store = {}

def get_project_paths():
    current_file = os.path.abspath(__file__)
    src_dir = os.path.dirname(current_file)
    api_dir = os.path.dirname(src_dir)
    src_parent = os.path.dirname(api_dir)
    project_root = os.path.dirname(src_parent)
    return {
        'project_root': project_root,
        'sample_script_path': os.path.join(project_root, "test_output", "src_script.md")
    }

PATHS = get_project_paths()
SAMPLE_SCRIPT_PATH = PATHS['sample_script_path']

def extract_code_blocks_from_content(content: str) -> list:
    code_block_pattern = re.compile(r'```([a-zA-Z0-9]*)[ \t]*\r?\n([\s\S]*?)```', re.MULTILINE)
    highlights = []
    
    # Try to extract file path from content (look for patterns like "The `src/App.css` file")
    file_path = "scene-content"  # default
    file_path_match = re.search(r'The `([^`]+)` file', content)
    if file_path_match:
        file_path = file_path_match.group(1)
    
    for match in code_block_pattern.finditer(content):
        lang = match.group(1) or ""
        code = match.group(2).strip()
        highlights.append(CodeHighlight(
            file_path=file_path,
            start_line=0,
            end_line=0,
            description="Inline code block from scene content",
            code=code
        ))
    return highlights

def parse_sample_script_md(md_path: str) -> Script:
    scenes = []
    with open(md_path, "r") as f:
        lines = f.readlines()

    current_scene = None
    current_highlights = []
    in_highlights = False
    highlight_file = None
    highlight_start = None
    highlight_end = None
    highlight_desc = ""
    highlight_code = ""
    code_block = False
    content_lines = []
    scene_title = ""
    scene_duration = 0
    scene_content = ""

    for line in lines:
        if line.startswith("## ") and ("Scene" in line or "Chapter" in line):
            if current_scene:
                current_scene["content"] = "".join(content_lines).strip()
                content_highlights = extract_code_blocks_from_content(current_scene["content"])
                all_highlights = current_highlights + content_highlights
                scenes.append(Scene(
                    title=current_scene["title"],
                    duration=current_scene["duration"],
                    content=current_scene["content"],
                    code_highlights=all_highlights
                ))
                current_highlights = []
                content_lines = []
            # Match both Scene and Chapter patterns
            m = re.match(r"## (Scene|Chapter) [0-9]+: (.*) \((\d+)s\)", line)
            if m:
                scene_title = m.group(2).strip()
                scene_title = re.sub(r'^(Scene \d+: |Chapter \d+: )+', '', scene_title)
                scene_duration = int(m.group(3))
                current_scene = {"title": scene_title, "duration": scene_duration}
        elif line.strip() == "### Code Highlights":
            in_highlights = True
        elif in_highlights and line.startswith("**"):
            if highlight_file:
                current_highlights.append(CodeHighlight(
                    file_path=highlight_file,
                    start_line=highlight_start,
                    end_line=highlight_end,
                    description=highlight_desc.strip(),
                    code=highlight_code.strip()
                ))
                highlight_desc = ""
                highlight_code = ""
            # Parse the line number format: **filename** (lines start-end):
            m = re.match(r"\*\*(.+?)\*\* \(lines (\d+)-(\d+)\):", line)
            if m:
                highlight_file = m.group(1).strip()
                highlight_start = int(m.group(2))
                highlight_end = int(m.group(3))
            else:
                # Try alternative pattern without colon
                m2 = re.match(r"\*\*(.+?)\*\* \(lines (\d+)-(\d+)\)", line)
                if m2:
                    highlight_file = m2.group(1).strip()
                    highlight_start = int(m2.group(2))
                    highlight_end = int(m2.group(3))
                else:
                    highlight_file = None
                    highlight_start = None
                    highlight_end = None
        elif in_highlights and line.strip() == "```":
            code_block = not code_block
        elif in_highlights and code_block:
            highlight_code += line
        elif in_highlights and line.strip() == "":
            pass
        elif in_highlights and not code_block:
            highlight_desc += line
        elif line.strip() == "---":
            in_highlights = False
        elif current_scene and not in_highlights:
            content_lines.append(line)

    if highlight_file:
        current_highlights.append(CodeHighlight(
            file_path=highlight_file,
            start_line=highlight_start,
            end_line=highlight_end,
            description=highlight_desc.strip(),
            code=highlight_code.strip()
        ))
    if current_scene:
        current_scene["content"] = "".join(content_lines).strip()
        content_highlights = extract_code_blocks_from_content(current_scene["content"])
        all_highlights = current_highlights + content_highlights
        scenes.append(Scene(
            title=current_scene["title"],
            duration=current_scene["duration"],
            content=current_scene["content"],
            code_highlights=all_highlights
        ))
    return Script(scenes=scenes)

class ScriptRequest(BaseModel):
    github_url: str
    proficiency: str = "beginner"
    depth: str = "key-parts"
    file_types: Optional[List[str]] = None
    save_to_disk: bool = True

class ScriptWithID(BaseModel):
    script_id: str
    script: Script

@router.post("/generate-script", response_model=ScriptWithID)
async def generate_script(request: ScriptRequest):
    try:
        script = await script_generator.generate_script_from_url(
            github_url=request.github_url,
            proficiency=request.proficiency,
            depth=request.depth,
            file_types=request.file_types,
            save_to_disk=request.save_to_disk
        )
        script_id = str(uuid.uuid4())
        script_store[script_id] = script
        return ScriptWithID(script_id=script_id, script=script)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scripts/{script_id}", response_model=Script)
async def get_script_by_id(script_id: str):
    script = script_store.get(script_id)
    if not script:
        raise HTTPException(status_code=404, detail="Script not found.")
    return script

@router.get("/scripts/current")
async def get_current_script():
    script_id = "current"
    script = script_store.get(script_id)
    if script is not None:
        return script
    if os.path.exists(SAMPLE_SCRIPT_PATH):
        with open(SAMPLE_SCRIPT_PATH, "r") as f:
            md_content = f.read()
        script = parse_sample_script_md(md_content)
        script_store[script_id] = script
        return script
    return JSONResponse(status_code=404, content={"detail": "Script not found."})