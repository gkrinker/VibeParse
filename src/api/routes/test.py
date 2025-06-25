from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
import os
import asyncio
import logging
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

router = APIRouter()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def call_llm_with_retries(llm_call, *args, max_retries=3, base_delay=2, **kwargs):
    """
    Call an LLM function with retry logic for rate limiting and other transient errors.
    
    Args:
        llm_call: Async function to call
        *args: Arguments to pass to llm_call
        max_retries: Maximum number of retry attempts
        base_delay: Base delay in seconds for exponential backoff
        **kwargs: Keyword arguments to pass to llm_call
        
    Returns:
        Result from llm_call
        
    Raises:
        RuntimeError: If max retries exceeded
        Exception: Original exception if not a retryable error
    """
    for attempt in range(max_retries):
        try:
            logger.info(f"[Throttling] Making LLM call (attempt {attempt+1}/{max_retries})...")
            return await llm_call(*args, **kwargs)
        except Exception as e:
            # Check if this is a rate limit error (429)
            if hasattr(e, 'status_code') and e.status_code == 429:
                wait_time = base_delay * (2 ** attempt)
                logger.warning(f"[Throttling] 429 Too Many Requests. Retrying in {wait_time} seconds (attempt {attempt+1}/{max_retries})...")
                await asyncio.sleep(wait_time)
            # Check for other potentially retryable errors
            elif hasattr(e, 'status_code') and e.status_code >= 500:
                wait_time = base_delay * (2 ** attempt)
                logger.warning(f"[Throttling] Server error {e.status_code}. Retrying in {wait_time} seconds (attempt {attempt+1}/{max_retries})...")
                await asyncio.sleep(wait_time)
            elif "timeout" in str(e).lower() or "connection" in str(e).lower():
                wait_time = base_delay * (2 ** attempt)
                logger.warning(f"[Throttling] Connection/timeout error: {e}. Retrying in {wait_time} seconds (attempt {attempt+1}/{max_retries})...")
                await asyncio.sleep(wait_time)
            else:
                # Non-retryable error, re-raise immediately
                logger.error(f"[Throttling] Non-retryable error on attempt {attempt+1}: {e}")
                raise
    raise RuntimeError(f"Exceeded maximum retries ({max_retries}) for LLM call due to repeated errors.")

class TestRequest(BaseModel):
    prompt: str = "Explain what this code does in one sentence: def hello(): print('world')"

class LLMTestRequest(BaseModel):
    message: str = "Hello, this is a test message"

class LLMTestResponse(BaseModel):
    response: str
    model: str
    usage: Dict[str, Any]

class ConfigResponse(BaseModel):
    mock_llm_mode: bool
    environment: str

@router.get("/config", response_model=ConfigResponse)
async def get_config():
    """Get application configuration including mock mode status"""
    mock_mode = os.environ.get("MOCK_LLM_MODE", "false").lower() == "true"
    environment = os.environ.get("ENVIRONMENT", "development")
    
    logger.info(f"Config requested - Mock mode: {mock_mode}, Environment: {environment}")
    
    return ConfigResponse(
        mock_llm_mode=mock_mode,
        environment=environment
    )

@router.post("/test-llm", response_model=LLMTestResponse)
async def test_llm_endpoint(request: LLMTestRequest):
    """Test the LLM connection"""
    try:
        # Check if we're in mock mode
        MOCK_LLM_MODE = os.environ.get("MOCK_LLM_MODE", "false").lower() == "true"
        if MOCK_LLM_MODE:
            logger.info("Mock mode active - returning mock response")
            return {"response": "This is a mock response from the test endpoint. MOCK_LLM_MODE is enabled."}
        
        # Import here to avoid issues if OpenAI is not configured
        from ...services.llm_service import LLMService
        
        llm_service = LLMService()
        
        # Simple test prompt
        messages = [
            {"role": "user", "content": request.message}
        ]
        
        logger.info(f"Testing LLM with message: {request.message}")
        
        response = await llm_service.call_llm(
            messages=messages,
            max_tokens=100,
            temperature=0.7
        )
        
        logger.info("LLM test successful")
        
        return LLMTestResponse(
            response=response.content,
            model=response.model,
            usage=response.usage
        )
        
    except Exception as e:
        logger.error(f"LLM test failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM test failed: {str(e)}")

@router.post("/test-llm-simple")
async def test_llm(request: TestRequest):
    """
    Simple endpoint to test OpenAI connectivity with retry logic.
    """
    # Check if mock mode is enabled
    MOCK_LLM_MODE = os.environ.get("MOCK_LLM_MODE", "false").lower() == "true"
    if MOCK_LLM_MODE:
        logger.info("[MockLLM] MOCK MODE ENABLED: Returning mock response instead of making LLM call")
        return {"response": "This is a mock response from the test endpoint. MOCK_LLM_MODE is enabled."}
    
    try:
        async def llm_test_call():
            return await client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are a helpful code explainer."},
                    {"role": "user", "content": request.prompt}
                ],
                temperature=0.7
            )
        response = await call_llm_with_retries(llm_test_call)
        return {"response": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))