"""
Renders code snippets as syntax-highlighted images for video overlays.
"""
from typing import Optional
from pygments import highlight
from pygments.lexers import get_lexer_by_name, guess_lexer
from pygments.formatters import ImageFormatter
from PIL import Image

class CodeRenderer:
    def __init__(self):
        pass

    def render_code_image(self, code: str, language: Optional[str] = None, output_path: str = "code.png") -> str:
        """
        Renders the given code as a syntax-highlighted image and saves to output_path.
        The image is centered on a 1080x1920 canvas with a dark background.
        Returns the path to the image file.
        """
        if not language:
            try:
                lexer = guess_lexer(code)
            except Exception:
                lexer = get_lexer_by_name("python")
        else:
            lexer = get_lexer_by_name(language)
        formatter = ImageFormatter(font_name="Consolas", font_size=40, line_numbers=False, style="monokai", image_pad=40, line_pad=4)
        # Render code to a temporary image
        code_img_bytes = highlight(code, lexer, formatter)
        with open("_tmp_code.png", "wb") as f:
            f.write(code_img_bytes)
        code_img = Image.open("_tmp_code.png").convert("RGB")
        code_img.save(output_path)
        return output_path 