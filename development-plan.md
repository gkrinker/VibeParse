# 🚀 VibeParse Development Plan

## 📋 Overview

This document outlines the development milestones for building VibeParse, an AI-powered code explanation generator. The plan is divided into two main phases:
1. Backend MVP (4-hour implementation)
2. Frontend MVP (Post-backend completion)

## 🎯 Backend MVP Milestones (4 Hours)

### Phase 1: Code Retrieval (1 hour)
**Goal**: Create a service that can fetch and parse code from GitHub URLs, supporting both single files and directories

**Deliverables**:
- [ ] GitHub API integration service
- [ ] File content retrieval endpoint
- [ ] Directory traversal and file aggregation
- [ ] Basic error handling for invalid URLs
- [ ] Simple response format for code content
- [ ] File type filtering (code files only)

**Testing Criteria**:
- Can successfully fetch code from public GitHub files
- Can successfully fetch and aggregate code from public GitHub directories
- Returns appropriate error messages for invalid URLs
- Response time < 2 seconds for single file retrieval
- Response time < 5 seconds for directory retrieval (up to 10 files)
- Properly filters out non-code files

**Example Usage**:
```bash
# Single file
curl -X POST http://localhost:8000/api/fetch-code \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/user/repo/blob/main/file.py"}'

# Directory
curl -X POST http://localhost:8000/api/fetch-code \
  -H "Content-Type: application/json" \
  -d '{
    "github_url": "https://github.com/user/repo/tree/main/src",
    "file_types": ["py", "js", "ts", "java"]
  }'
```

### Phase 2: Code Analysis & Explanation Generation (2.5 hours)
**Goal**: Generate bite-sized code explanations using LLM

**Deliverables**:
- [ ] OpenAI/Claude integration
- [ ] Basic prompt template system
- [ ] Explanation generation endpoint
- [ ] Structured response format for explanations
- [ ] Multi-file analysis and relationship mapping
- [ ] File dependency detection

**Testing Criteria**:
- Generates coherent explanations for simple code files
- Generates coherent explanations for multiple related files
- Handles different code languages
- Response time < 10 seconds for single file analysis
- Response time < 30 seconds for directory analysis (up to 10 files)

**Example Usage**:
```bash
curl -X POST http://localhost:8000/api/generate-explanation \
  -H "Content-Type: application/json" \
  -d '{
    "files": [
      {"path": "src/main.py", "content": "..."},
      {"path": "src/utils.py", "content": "..."}
    ],
    "proficiency": "beginner",
    "depth": "key-parts"
  }'
```

## 🎨 Frontend MVP Milestones

### Phase 1: Basic UI Setup (2 days)
**Goal**: Create a functional web interface for the backend

**Deliverables**:
- [ ] Project setup with React + Tailwind
- [ ] Basic layout and routing
- [ ] GitHub URL input form
- [ ] Proficiency and depth selection
- [ ] Basic error handling and loading states
- [ ] Display code snippets and explanations in a readable, bite-sized format

### Phase 2: Polish & UX (1 day)
**Goal**: Improve user experience and add final touches

**Deliverables**:
- [ ] Responsive design
- [ ] Loading animations
- [ ] Error messages and recovery
- [ ] Basic analytics tracking

## 🔄 Development Workflow

### Backend Development
1. Start with Phase 1 and ensure it's working end-to-end
2. Move to Phase 2 only after Phase 1 is stable
3. Add optimizations and improvements after basic functionality

### Frontend Development
1. Begin after backend MVP is complete
2. Start with basic form and API integration
3. Polish UI/UX last

## 📊 Success Metrics

### Backend MVP
- Response time < 2 seconds for single file retrieval
- Response time < 5 seconds for directory retrieval
- Explanation generation < 10 seconds for single file
- Explanation generation < 30 seconds for directory
- 99% uptime for core services

### Frontend MVP
- Page load time < 2 seconds
- Time to first explanation < 1 minute
- Mobile responsiveness score > 90
- Error recovery rate > 95%

## 🛠 Tech Stack

### Backend
- FastAPI (Python)
- OpenAI/Claude API
- Redis (for job queue)
- S3/Similar for storage (if needed)

### Frontend
- React
- Tailwind CSS
- Axios for API calls
- React Query for state management

## ⚠️ Risk Mitigation

1. **API Rate Limits**
   - Implement caching for GitHub API calls
   - Queue system for explanation generation

2. **Cost Control**
   - Token usage monitoring
   - Rate limiting per user
   - Caching for repeated requests

3. **Performance**
   - Async processing for long-running tasks
   - Progress tracking for explanation generation
   - Fallback options for failed generations 

## 🚦 Pre-Production Checklist (June 2024)
- Enforce a hard cap on input size (max files, max lines, or max tokens) for explanation generation requests.
- Implement per-file batching for LLM requests, keeping each batch under the token limit.
- If a single file is too large, handle gracefully: skip the file, inform the user, and suggest splitting or reducing scope. 