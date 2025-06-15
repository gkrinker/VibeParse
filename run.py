import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.info("Starting server...")
    try:
        uvicorn.run(
            "src.api.app:app",
            host="0.0.0.0",
            port=8080,
            reload=True,
            reload_dirs=["src"],  # Watch the entire src directory
            log_level="info"
        )
    except Exception as e:
        logger.error(f"Failed to start server: {e}")
        raise 