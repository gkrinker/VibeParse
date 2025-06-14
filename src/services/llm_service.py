from typing import List, Dict, Optional
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI
from ..models.script import Script, Scene, CodeHighlight

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
        # Construct the prompt based on proficiency and depth
        prompt = self._construct_prompt(files, proficiency, depth)
        
        # Call OpenAI API
        response = await self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": self._get_system_prompt(proficiency)},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        # Parse the response into a Script object
        return self._parse_response(response.choices[0].message.content, files)
    
    def _construct_prompt(self, files: List[Dict[str, str]], proficiency: str, depth: str) -> str:
        """Construct the prompt for the LLM based on files and parameters."""
        prompt = f"""Please analyze the following code and generate an explanation script.
        Follow this exact format for each scene:

        ## Scene Title (duration in seconds)
        [Scene content here]

        ### Code Highlights
        **file_path.py** (lines X-Y):
        [Description of the highlighted code]

        ---

        For example:
        ## Main Function Overview (25s)
        This function handles the core logic of our application. It takes user input, processes it through several steps, and returns a formatted result.

        ### Code Highlights
        **main.py** (lines 10-15):
        The function signature and input validation logic ensure we only process valid data.

        ---

        Now, analyze these files:
        """
        
        prompt += f"\nProficiency Level: {proficiency}\n"
        prompt += f"Depth: {depth}\n\n"
        
        for file in files:
            prompt += f"File: {file['path']}\n"
            prompt += f"Content:\n{file['content']}\n\n"
            
        return prompt
    
    def _get_system_prompt(self, proficiency: str) -> str:
        """Get the system prompt based on proficiency level."""
        base_prompt = """You are an expert code explainer. Your task is to generate a script for explaining code.
        Follow these guidelines:
        1. Break down the explanation into scenes (15-30 seconds each)
        2. Each scene should focus on 1-2 concepts
        3. Include specific code highlights for each scene
        4. Use analogies and examples where appropriate
        5. Format the output in Markdown
        6. Each scene must have a title and duration
        7. Each code highlight must specify the file path and line numbers
        """
        
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
        
        for line in response.split('\n'):
            line = line.strip()
            
            # New scene
            if line.startswith('## '):
                if current_scene:
                    scenes.append(current_scene)
                
                # Parse title and duration
                title_duration = line[3:].split('(')
                title = title_duration[0].strip()
                duration = int(title_duration[1].split('s')[0]) if len(title_duration) > 1 else 20
                
                current_scene = Scene(
                    title=title,
                    duration=duration,
                    content="",
                    code_highlights=[]
                )
            
            # Code highlight
            elif line.startswith('**') and '**' in line[2:]:
                if current_scene:
                    # Parse file path and line numbers
                    parts = line[2:].split('**')
                    file_path = parts[0]
                    line_nums = parts[1].strip('()').split('-')
                    
                    highlight = CodeHighlight(
                        file_path=file_path,
                        start_line=int(line_nums[0]),
                        end_line=int(line_nums[1]),
                        description=""
                    )
                    current_scene.code_highlights.append(highlight)
            
            # Description for code highlight
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
        
        # Add the last scene
        if current_scene:
            scenes.append(current_scene)
        
        return Script(scenes=scenes) 