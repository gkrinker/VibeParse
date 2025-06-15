from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from ..models.script import Script, Scene, CodeHighlight
import re

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
        """
        Generate a script for explaining the provided code files.
        
        Args:
            files: List of dicts containing file paths and content
            proficiency: User's proficiency level (beginner/intermediate/expert)
            depth: Explanation depth (line-by-line/chunk/key-parts)
            
        Returns:
            Script object containing scenes and code highlights
        """
        print(f"[LLM] Starting script generation for {len(files)} files (proficiency: {proficiency}, depth: {depth})...")
        try:
            prompt = self._construct_prompt(files, proficiency, depth)
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self._get_system_prompt(proficiency)},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            print(f"[LLM] Script generation completed for {len(files)} files.")
            return self._parse_response(response.choices[0].message.content, files)
        except Exception as e:
            print(f"[LLM] Error during script generation: {e}")
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