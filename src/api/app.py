from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import code, script, test

app = FastAPI(
    title="VibeParse",
    description="AI-powered code explanation generator",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(code.router, prefix="/api", tags=["code"])
app.include_router(script.router, prefix="/api", tags=["script"])
app.include_router(test.router, prefix="/api", tags=["test"])

@app.get("/")
async def root():
    return {"message": "Welcome to VibeParse API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"} 