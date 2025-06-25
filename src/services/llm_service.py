from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from ..models.script import Script, Scene, CodeHighlight
import re
import json
from pathlib import Path

# Load environment variables
load_dotenv()

class LLMService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is not set")
        self.client = AsyncOpenAI(api_key=api_key)
        
    async def generate_script(
        self,
        files: List[Dict[str, str]],
        proficiency: str = "beginner",
        depth: str = "key-parts"
    ) -> Script:
        print("[LLMService] generate_script called")
        print(f"[LLMService] Processing {len(files)} files")
        print(f"[LLMService] Proficiency: {proficiency}, Depth: {depth}")
        
        USE_JSON_SCRIPT_PROMPT = os.environ.get("USE_JSON_SCRIPT_PROMPT", "false").lower() == "true"
        print(f"[LLMService] USE_JSON_SCRIPT_PROMPT environment variable: {USE_JSON_SCRIPT_PROMPT}")
        
        if USE_JSON_SCRIPT_PROMPT:
            print("[LLMService] Using NEW JSON script prompt and message structure.")
            try:
                with open("src/services/llm_system_prompt.txt", "r", encoding="utf-8") as f:
                    system_prompt = f.read()
                print(f"[LLMService] Loaded system prompt ({len(system_prompt)} characters)")
                
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Proficiency Level: {proficiency}\nExplanation Depth: {depth}"}
                ]
                print(f"[LLMService] Created initial messages: system + proficiency/depth")
                
                for i, file in enumerate(files):
                    file_message = {
                        "role": "user",
                        "content": f"File: {file['path']}\nContent:\n{file['content']}"
                    }
                    messages.append(file_message)
                    print(f"[LLMService] Added file {i+1}/{len(files)}: {file['path']} ({len(file['content'])} chars)")
                
                messages.append({
                    "role": "user",
                    "content": "Please generate the JSON script for all files above, following the guidelines and schema."
                })
                print(f"[LLMService] Added final instruction message. Total messages: {len(messages)}")
                
                print("[LLMService] Making LLM API call with JSON prompt...")
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    temperature=0.7
                )
                print("[LLMService] Received response from LLM")
                
                json_str = response.choices[0].message.content
                print(f"[LLMService] Raw response length: {len(json_str)} characters")
                print(f"[LLMService] Response preview: {json_str[:200]}...")
                
                # Clean the response - remove markdown code block markers if present
                original_json_str = json_str
                json_str = json_str.strip()
                
                # Handle various markdown code block formats
                if json_str.startswith("```json"):
                    # Remove opening ```json and any following newlines
                    json_str = json_str[7:].lstrip()
                    # Remove closing ``` and any preceding newlines
                    if json_str.endswith("```"):
                        json_str = json_str[:-3].rstrip()
                    print(f"[LLMService] Cleaned JSON response (removed markdown markers)")
                    print(f"[LLMService] Original length: {len(original_json_str)}, Cleaned length: {len(json_str)}")
                elif json_str.startswith("```"):
                    # Handle case where language isn't specified
                    json_str = json_str[3:].lstrip()
                    if json_str.endswith("```"):
                        json_str = json_str[:-3].rstrip()
                    print(f"[LLMService] Cleaned JSON response (removed generic markdown markers)")
                    print(f"[LLMService] Original length: {len(original_json_str)}, Cleaned length: {len(json_str)}")
                
                # Save raw JSON response to file for inspection
                output_dir = Path("test_output")
                output_dir.mkdir(exist_ok=True)
                
                # Generate filename based on files being processed
                file_names = [f['path'].replace('/', '_').replace('.', '_') for f in files]
                json_filename = f"json_response_{'_'.join(file_names[:3])}.json"  # Limit to first 3 files
                json_path = output_dir / json_filename
                
                with open(json_path, "w", encoding="utf-8") as f:
                    f.write(json_str)
                print(f"[LLMService] Saved raw JSON response to: {json_path}")
                
                try:
                    data = json.loads(json_str)
                    print("[LLMService] Successfully parsed JSON response")
                except Exception as e:
                    print(f"[LLMService] JSON parsing failed: {e}")
                    raise RuntimeError(f"LLM did not return valid JSON: {e}\nRaw output:\n{json_str}")
                
                # Validate schema
                print("[LLMService] Validating JSON schema...")
                if not isinstance(data, dict) or "chapters" not in data or not isinstance(data["chapters"], list):
                    print(f"[LLMService] Schema validation failed: missing 'chapters' array")
                    raise RuntimeError(f"LLM JSON missing 'chapters' array. Raw output:\n{json_str}")
                
                print(f"[LLMService] Found {len(data['chapters'])} chapters")
                for i, chapter in enumerate(data["chapters"]):
                    if not all(k in chapter for k in ("title", "files", "scenes")):
                        print(f"[LLMService] Chapter {i} missing required fields: {chapter}")
                        raise RuntimeError(f"Chapter missing required fields: {chapter}")
                    print(f"[LLMService] Chapter {i}: '{chapter.get('title')}' with {len(chapter.get('scenes', []))} scenes")
                    
                    for j, scene in enumerate(chapter["scenes"]):
                        if not all(k in scene for k in ("title", "duration", "explanation", "code", "type_of_code")):
                            print(f"[LLMService] Scene {j} in chapter {i} missing required fields: {scene}")
                            raise RuntimeError(f"Scene missing required fields: {scene}")
                        print(f"[LLMService] Scene {j}: '{scene.get('title')}' ({scene.get('duration')}s, {scene.get('type_of_code')})")
                
                print("[LLMService] JSON schema validation passed")
                print(f"[LLMService] Returning JSON data with {len(data['chapters'])} chapters")
                return data  # Return parsed and validated JSON
                
            except Exception as e:
                print(f"[LLMService] Error in JSON path: {e}")
                raise
        else:
            print("[LLMService] Using OLD Markdown script prompt and message structure.")
            print(f"[M] Starting script generation for {len(files)} files (proficiency: {proficiency}, depth: {depth})...")
            try:
                prompt = self._construct_prompt(files, proficiency, depth)
                print(f"[LLMService] Constructed Markdown prompt ({len(prompt)} characters)")
                
                response = await self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": self._get_system_prompt(proficiency)},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )
                print(f"[M] Script generation completed for {len(files)} files.")
                
                response_content = response.choices[0].message.content
                print(f"[LLMService] Markdown response length: {len(response_content)} characters")
                print(f"[LLMService] Response preview: {response_content[:200]}...")
                
                script = self._parse_response(response_content, files)
                print(f"[LLMService] Parsed Markdown response into {len(script.scenes)} scenes")
                return script
            except Exception as e:
                print(f"[M] Error during script generation: {e}")
                raise
    
    def _construct_prompt(self, files: List[Dict[str, str]], proficiency: str, depth: str) -> str:
        """Construct the prompt for the LLM based on files and parameters."""
        prompt = f"""Please analyze the following code and generate an explanation script.\nFor each scene, provide:\n- A title and duration\n- Exactly one code snippet (as a fenced code block, with language if possible)\n- Pair the code snippet with a detailed, plain-English explanation\n- The explanation should be detailed enough that reading or listening to it would take between 15 and 30 seconds\n- Do not mention or reference the word 'scene' or any script structure (e.g., 'In this scene', 'The next scene', etc.) in your explanations. Write as if you are naturally explaining the code to a learner.\nIf a scene is only context/transition, you may omit the code snippet.\n\nFormat example:\n\n## Scene Title (duration in seconds)\nExplanation here.\n\n### Code Highlights\n**App.tsx** (lines 2-10):\n```tsx\n// code from lines 2-10 here\n```\nExplanation of the code above.\n\n---\n\nNow, analyze these files:\n"""
        prompt += f"\nProficiency Level: {proficiency}\n"
        prompt += f"Depth: {depth}\n\n"
        for file in files:
            prompt += f"File: {file['path']}\n"
            prompt += f"Content:\n{file['content']}\n\n"
        return prompt
    
    def _get_system_prompt(self, proficiency: str) -> str:
        """Get the system prompt based on proficiency level."""
        base_prompt = """You are an expert code explainer. Your task is to generate a script for explaining code.\n        Follow these guidelines:\n        1. Break down the explanation into scenes (15-30 seconds each)\n        2. Each scene should focus on 1-2 concepts\n        3. Each scene must include exactly one code snippet, paired with a detailed explanation\n        4. The explanation for each code snippet should be detailed enough to take 15-30 seconds to consume\n        5. Do not mention or reference the word 'scene' or any script structure (e.g., 'In this scene', 'The next scene', etc.) in your explanations. Write as if you are naturally explaining the code to a learner.\n        6. Use analogies and examples where appropriate\n        7. Format the output in Markdown\n        8. Each scene must have a title and duration\n        9. Each code highlight must specify the file path and line numbers\n        """
        
        proficiency_prompts = {
            "beginner": "Focus on basic concepts, use simple analogies, and explain everything step by step. Aim for 3-5 scenes per function.",
            "intermediate": "Focus on why things work the way they do, with some technical details. Aim for 2-3 scenes per function.",
            "expert": "Focus on edge cases, performance implications, and advanced concepts. Aim for 1-2 scenes per function."
        }
        
        return f"{base_prompt}\n{proficiency_prompts.get(proficiency, proficiency_prompts['intermediate'])}"
    
    def _parse_response(self, response: str, files: List[Dict[str, str]]) -> Script:
        """Parse the LLM response into a Script object."""
        scenes = []
        current_scene = None
        code_highlight_pattern = re.compile(r"\*\*(.+?)\*\* \(lines (\d+)[-–](\d+)\):?")
        code_block_pattern = re.compile(r"```[a-zA-Z]*\n([\s\S]*?)```", re.MULTILINE)
        file_content_map = {f['path']: f['content'].splitlines() for f in files}
        lines = response.split('\n')
        i = 0
        while i < len(lines):
            line = lines[i].strip()
            # New scene
            if line.startswith('## '):
                if current_scene:
                    scenes.append(current_scene)
                title_duration = line[3:].split('(')
                title = title_duration[0].strip()
                duration = 20
                if len(title_duration) > 1:
                    try:
                        duration = int(title_duration[1].split('s')[0].strip())
                    except Exception:
                        pass
                current_scene = Scene(
                    title=title,
                    duration=duration,
                    content="",
                    code_highlights=[]
                )
                i += 1
                continue
            # Code highlight
            elif line.startswith('**'):
                match = code_highlight_pattern.match(line)
                if match and current_scene:
                    file_path = match.group(1).strip()
                    try:
                        start_line = int(match.group(2))
                        end_line = int(match.group(3))
                    except Exception:
                        i += 1
                        continue
                    # Look ahead for code block
                    code = ""
                    description = ""
                    j = i + 1
                    # Find code block
                    while j < len(lines):
                        code_line = lines[j].strip()
                        if code_line.startswith('```'):
                            code_block_lines = []
                            j += 1
                            while j < len(lines) and not lines[j].strip().startswith('```'):
                                code_block_lines.append(lines[j])
                                j += 1
                            code = '\n'.join(code_block_lines)
                            j += 1  # skip closing ```
                            break
                        elif code_line == '' or code_line.startswith('**') or code_line.startswith('##') or code_line.startswith('---'):
                            break
                        else:
                            j += 1
                    # If no code block, fallback to file content
                    if not code and file_path in file_content_map:
                        file_lines = file_content_map[file_path]
                        code = '\n'.join(file_lines[start_line-1:end_line])
                    # After code block, next non-empty line(s) is description
                    desc_lines = []
                    while j < len(lines):
                        desc_line = lines[j].strip()
                        if desc_line == '' or desc_line.startswith('**') or desc_line.startswith('##') or desc_line.startswith('---'):
                            break
                        desc_lines.append(desc_line)
                        j += 1
                    description = '\n'.join(desc_lines)
                    highlight = CodeHighlight(
                        file_path=file_path,
                        start_line=start_line,
                        end_line=end_line,
                        code=code,
                        description=description
                    )
                    current_scene.code_highlights.append(highlight)
                    i = j
                    continue
            # Description for code highlight (legacy fallback)
            elif current_scene and current_scene.code_highlights and not line.startswith(('##', '###', '---')):
                if current_scene.code_highlights[-1].description == "":
                    current_scene.code_highlights[-1].description = line
                else:
                    current_scene.code_highlights[-1].description += "\n" + line
            # Scene content
            elif current_scene and not line.startswith(('##', '###', '---')):
                if current_scene.content == "":
                    current_scene.content = line
                else:
                    current_scene.content += "\n" + line
            i += 1
        if current_scene:
            scenes.append(current_scene)
        return Script(scenes=scenes) 