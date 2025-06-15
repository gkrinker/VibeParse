"""
Handles ElevenLabs TTS API integration for generating narration audio from text.
"""
import os
import requests

class ElevenLabsTTSService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("ELEVENLABS_API_KEY")
        self.base_url = "https://api.elevenlabs.io/v1"
        self.voice = "EkK5I93UQWFDigLMpZcX"  # Updated to your provided voice ID

    def text_to_speech(self, text: str, voice: str = None, output_path: str = "output.mp3") -> str:
        """
        Converts text to speech using ElevenLabs API and saves to output_path.
        Returns the path to the audio file.
        """
        voice = voice or self.voice
        url = f"{self.base_url}/text-to-speech/{voice}"
        headers = {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }
        payload = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
        }
        response = requests.post(url, headers=headers, json=payload)
        if response.status_code != 200:
            raise Exception(f"ElevenLabs TTS failed: {response.status_code} {response.text}")
        with open(output_path, "wb") as f:
            f.write(response.content)
        return output_path 