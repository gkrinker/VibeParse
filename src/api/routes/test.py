from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TestRequest(BaseModel):
    prompt: str = "Explain what this code does in one sentence: def hello(): print('world')"

@router.post("/test-llm")
async def test_llm(request: TestRequest):
    """
    Simple endpoint to test OpenAI connectivity.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful code explainer."},
                {"role": "user", "content": request.prompt}
            ],
            temperature=0.7
        )
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 