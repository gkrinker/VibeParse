# 🎭 Mock LLM Mode - Development Cost Reduction

## Overview

The Mock LLM Mode allows you to develop and test the VibeParse application without making actual LLM API calls, significantly reducing development costs and improving development speed.

## 🚀 Quick Start

### Enable Mock Mode

```bash
# Set the environment variable
export MOCK_LLM_MODE=true

# Or run commands with mock mode enabled
MOCK_LLM_MODE=true python your_script.py
```

### Test Mock Mode

```bash
# Run the simple test to verify mock mode works
python simple_mock_test.py

# With mock mode enabled
MOCK_LLM_MODE=true python simple_mock_test.py
```

## 🔧 How It Works

When `MOCK_LLM_MODE=true` is set:

1. **Script Generation**: Instead of making LLM API calls, the system loads the existing `test_output/src_script.md` file
2. **Test Endpoint**: The `/api/test-llm` endpoint returns a mock response
3. **Frontend Auto-Detection**: The UI automatically detects mock mode and adjusts accordingly
4. **Optional URL Field**: GitHub URL becomes optional when mock mode is active
5. **Same Interface**: All APIs maintain the same interface and return format
6. **Zero API Costs**: No OpenAI API calls are made

## 📁 Required Files

The mock mode requires the following file to exist:
- `test_output/src_script.md` - Contains the mock script data

This file should be a valid Markdown script with scenes, code highlights, and explanations.

## 🧪 Testing

### File Analysis Test

```bash
python simple_mock_test.py
```

This test:
- ✅ Verifies `src_script.md` exists
- ✅ Analyzes the script structure
- ✅ Shows scene count and titles
- ✅ Confirms mock mode is properly configured

### Frontend Testing

1. **Start the server with mock mode:**
   ```bash
   MOCK_LLM_MODE=true uvicorn src.api.app:app --reload
   ```

2. **Start the frontend:**
   ```bash
   cd src/frontend
   npm start
   ```

3. **Test the UI** - You'll see:
   - 🎭 Yellow "Mock Mode Active" banner
   - Optional GitHub URL field (no red asterisk)
   - "Generate Mock Script" button
   - Helpful placeholder text

### API Testing

1. **Test script generation with empty URL:**
   ```bash
   curl -X POST http://localhost:8000/api/generate-script \
     -H "Content-Type: application/json" \
     -d '{
       "github_url": "",
       "proficiency": "beginner",
       "depth": "key-parts"
     }'
   ```

2. **Test script generation with any URL:**
   ```bash
   curl -X POST http://localhost:8000/api/generate-script \
     -H "Content-Type: application/json" \
     -d '{
       "github_url": "https://github.com/example/test-repo",
       "proficiency": "beginner",
       "depth": "key-parts"
     }'
   ```

3. **Test LLM endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/test-llm \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test"}'
   ```

## 💡 Development Workflow

### For Frontend Development

1. **Enable mock mode:**
   ```bash
   export MOCK_LLM_MODE=true
   ```

2. **Start the backend:**
   ```bash
   uvicorn src.api.app:app --reload
   ```

3. **Start the frontend:**
   ```bash
   cd src/frontend
   npm start
   ```

4. **Test the UI** - All API calls will use mock data
   - ✅ No need to enter GitHub URLs
   - ✅ Instant responses
   - ✅ Clear mock mode indicators

### For Backend Development

1. **Enable mock mode:**
   ```bash
   export MOCK_LLM_MODE=true
   ```

2. **Run tests:**
   ```bash
   python simple_mock_test.py
   ```

3. **Test API endpoints** - No API costs incurred
   - ✅ Empty URLs work fine
   - ✅ Any URL works (ignored in mock mode)
   - ✅ Same response format

### For Production

1. **Disable mock mode:**
   ```bash
   export MOCK_LLM_MODE=false
   # or unset the variable
   unset MOCK_LLM_MODE
   ```

2. **Ensure OpenAI API key is set:**
   ```bash
   export OPENAI_API_KEY=your_api_key_here
   ```

## 🔄 Switching Between Modes

### Development Mode (Mock)
```bash
export MOCK_LLM_MODE=true
# Fast, free, uses test data
# URL field is optional
# Clear visual indicators
```

### Production Mode (Real LLM)
```bash
export MOCK_LLM_MODE=false
# Real API calls, costs money
# URL field is required
# No mock indicators
```

## 📊 Benefits

### Cost Reduction
- ✅ **Zero API costs** during development
- ✅ **Unlimited testing** without rate limits
- ✅ **No API key required** for development

### Development Speed
- ✅ **Instant responses** (no network calls)
- ✅ **Consistent test data** for UI development
- ✅ **No rate limiting** during development

### User Experience
- ✅ **Optional URL field** in mock mode
- ✅ **Auto-detection** of mock mode
- ✅ **Visual indicators** for mock mode
- ✅ **Smart validation** (URL required only in real mode)

### Testing
- ✅ **Predictable responses** for automated tests
- ✅ **Offline development** capability
- ✅ **Easy debugging** with known data

## 🛠️ Implementation Details

### Environment Variable
- **Name**: `MOCK_LLM_MODE`
- **Values**: `true` (enabled) / `false` (disabled)
- **Default**: `false`

### Affected Components
- `src/services/script_generator.py` - Main script generation
- `src/api/routes/test.py` - Test endpoint
- `src/frontend/src/components/IndexPage.tsx` - Frontend form
- All LLM-dependent functionality

### Data Source
- **File**: `test_output/src_script.md`
- **Format**: Markdown with scenes and code highlights
- **Parser**: Uses existing `parse_sample_script_md` function

### Frontend Features
- **Auto-detection**: Checks `/api/test-llm` endpoint for mock mode
- **Visual indicators**: Yellow banner when mock mode is active
- **Smart validation**: URL required only in real mode
- **Loading states**: Spinner while checking configuration
- **Helpful placeholders**: Context-aware input hints

## 🚨 Troubleshooting

### Mock Mode Not Working

1. **Check environment variable:**
   ```bash
   echo $MOCK_LLM_MODE
   ```

2. **Verify file exists:**
   ```bash
   ls -la test_output/src_script.md
   ```

3. **Run the test:**
   ```bash
   python simple_mock_test.py
   ```

### Frontend Not Detecting Mock Mode

1. **Check backend is running:**
   ```bash
   curl -X POST http://localhost:8000/api/test-llm \
     -H "Content-Type: application/json" \
     -d '{"prompt": "test"}'
   ```

2. **Check browser console** for any errors

3. **Verify environment variable** is set before starting backend

### Import Errors

If you encounter import errors when testing:

1. **Use the simple test:**
   ```bash
   python simple_mock_test.py
   ```

2. **Test via API instead:**
   ```bash
   MOCK_LLM_MODE=true uvicorn src.api.app:app --reload
   ```

## 📝 Example Output

When mock mode is enabled, you'll see logs like:

```
[MockLLM] MOCK MODE ENABLED: Using existing src_script.md instead of making LLM calls
[MockLLM] Loading existing script from test_output/src_script.md for URL: mock-repository
[MockLLM] Successfully loaded script file (21122 characters)
[MockLLM] Successfully parsed script with 16 scenes
```

And in the frontend:
- 🎭 Yellow "Mock Mode Active" banner
- Optional GitHub URL field
- "Generate Mock Script" button

## 🎯 Best Practices

1. **Always use mock mode for development**
2. **Test with real API before production**
3. **Keep `src_script.md` up to date with good test data**
4. **Use environment variables in deployment scripts**
5. **Document mock mode usage in team workflows**
6. **Take advantage of optional URL field in mock mode**

---

**Happy development without API costs! 🎉** 