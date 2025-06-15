"""
Orchestrates the process of converting a script scene into a video.
"""
from ..models.script import Scene
from .tts_service import ElevenLabsTTSService
from .code_render import CodeRenderer
from .video_composer import VideoComposer
import os
from typing import List, Tuple
from moviepy import AudioFileClip, ImageClip, CompositeVideoClip, concatenate_videoclips
from PIL import Image

class SceneToVideo:
    def __init__(self):
        self.tts = ElevenLabsTTSService()
        self.code_renderer = CodeRenderer()
        self.video_composer = VideoComposer()

    def _generate_audio_for_text(self, text: str, output_path: str) -> AudioFileClip:
        # Always generate TTS if file does not exist
        if not os.path.exists(output_path):
            self.tts.text_to_speech(text, output_path=output_path)
        return AudioFileClip(output_path)

    def _center_and_scale_code_on_canvas(self, code_img_path: str, output_path: str) -> str:
        code_img = Image.open(code_img_path)
        # Scale down if too wide
        if code_img.width > 1080:
            scale = 1080 / code_img.width
            new_w = 1080
            new_h = int(code_img.height * scale)
            code_img = code_img.resize((new_w, new_h), Image.LANCZOS)
        canvas = Image.new("RGB", (1080, 1920), (40, 40, 40))
        x = (1080 - code_img.width) // 2
        y = (1920 - code_img.height) // 2
        canvas.paste(code_img, (x, y))
        canvas.save(output_path)
        return output_path

    def scene_to_video(self, scene: Scene, output_path: str = "scene.mp4") -> str:
        """
        Converts a Scene object into a video file.
        Returns the path to the video file.
        """
        print(f"[Video] Starting video generation for scene: {scene.title}")
        
        # Base directory for temporary files
        base_dir = os.path.dirname(output_path)
        temp_dir = os.path.join(base_dir, "temp")
        os.makedirs(temp_dir, exist_ok=True)

        # List to store all video clips
        video_clips = []
        
        # --- Intro segment: play scene.content narration with first code snippet ---
        if scene.code_highlights:
            intro_audio_path = os.path.join(temp_dir, "intro.mp3")
            intro_audio = self._generate_audio_for_text(scene.content, intro_audio_path)
            code_img_path = os.path.join(temp_dir, f"code_0.png")
            self.code_renderer.render_code_image(scene.code_highlights[0].code, None, code_img_path)
            code_canvas_path = os.path.join(temp_dir, f"code_canvas_intro.png")
            self._center_and_scale_code_on_canvas(code_img_path, code_canvas_path)
            code_image = ImageClip(code_canvas_path).with_duration(intro_audio.duration)
            intro_clip = CompositeVideoClip([code_image]).with_audio(intro_audio)
            video_clips.append(intro_clip)

        # --- For each code highlight, play description narration with code snippet ---
        for i, highlight in enumerate(scene.code_highlights):
            desc_audio_path = os.path.join(temp_dir, f"desc_{i}.mp3")
            desc_audio = self._generate_audio_for_text(highlight.description, desc_audio_path)
            code_img_path = os.path.join(temp_dir, f"code_{i}.png")
            self.code_renderer.render_code_image(highlight.code, None, code_img_path)
            code_canvas_path = os.path.join(temp_dir, f"code_canvas_{i}.png")
            self._center_and_scale_code_on_canvas(code_img_path, code_canvas_path)
            code_image = ImageClip(code_canvas_path).with_duration(desc_audio.duration)
            code_clip = CompositeVideoClip([code_image]).with_audio(desc_audio)
            video_clips.append(code_clip)

        # 3. Concatenate all clips
        if not video_clips:
            print("[Video] No video segments to concatenate. Exiting.")
            return None
        final_clip = concatenate_videoclips(video_clips)
        
        # 4. Write the final video
        print(f"[Video] Writing final video...")
        final_clip.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac")
        
        # 5. Clean up temporary files
        for file in os.listdir(temp_dir):
            os.remove(os.path.join(temp_dir, file))
        os.rmdir(temp_dir)
        
        print(f"[Video] Video saved to {output_path}")
        return output_path 