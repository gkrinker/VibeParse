"""
Composes video from code images and narration audio.
"""
from typing import List, Tuple, Optional
from moviepy.editor import ImageClip, AudioFileClip, CompositeVideoClip
from moviepy.video.fx.Resize import Resize

class VideoComposer:
    def __init__(self):
        pass

    def compose_video(self, image_path: str, audio_path: str, output_path: str = "scene.mp4", target_size: Optional[Tuple[int, int]] = None) -> str:
        """
        Combines the code image and narration audio into a video file.
        Optionally resizes to target_size (width, height).
        Returns the path to the video file.
        """
        audio = AudioFileClip(audio_path)
        image = ImageClip(image_path, duration=audio.duration)
        if target_size:
            image = image.with_effects([Resize(new_size=target_size)])
        video = CompositeVideoClip([image])
        video.audio = audio
        video.write_videofile(output_path, fps=24, codec="libx264", audio_codec="aac")
        return output_path 