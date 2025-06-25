#!/usr/bin/env python3
"""
Simple test for Mock LLM Mode functionality.

This script directly tests the mock mode by simulating the environment
and checking if the src_script.md file can be loaded and parsed.
"""

import os
import sys
from pathlib import Path

def test_mock_mode():
    """Test the mock LLM mode functionality."""
    
    print("🧪 VibeParse Mock LLM Mode Test")
    print("=" * 40)
    print()
    
    # Check if mock mode is enabled
    mock_mode = os.environ.get("MOCK_LLM_MODE", "false").lower() == "true"
    print(f"🔧 Mock LLM Mode: {'ENABLED' if mock_mode else 'DISABLED'}")
    
    if not mock_mode:
        print("💡 To enable mock mode, set: export MOCK_LLM_MODE=true")
        print("   This will use the existing src_script.md file instead of making LLM calls.")
        print()
    
    # Check if src_script.md exists
    script_path = Path("test_output/src_script.md")
    if not script_path.exists():
        print("❌ Error: test_output/src_script.md not found!")
        print("   Please ensure the file exists for mock mode to work.")
        return False
    
    print(f"✅ Found existing script: {script_path}")
    print(f"   File size: {script_path.stat().st_size} bytes")
    print()
    
    # Read and analyze the script file
    try:
        with open(script_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        print(f"✅ Successfully read script file ({len(content)} characters)")
        
        # Count scenes (simple heuristic: count "## Scene" occurrences)
        scene_count = content.count("## Scene")
        chapter_count = content.count("## Chapter")
        skip_count = content.count("## Skipped Files")
        
        print(f"📊 Script Analysis:")
        print(f"   - Scenes found: {scene_count}")
        print(f"   - Chapters found: {chapter_count}")
        print(f"   - Skipped files section: {'Yes' if skip_count > 0 else 'No'}")
        
        # Show first few scene titles
        lines = content.split('\n')
        scene_titles = []
        for line in lines:
            if line.startswith('## Scene'):
                title = line.replace('## ', '').strip()
                scene_titles.append(title)
                if len(scene_titles) >= 5:  # Show first 5 scenes
                    break
        
        print(f"\n📋 First {len(scene_titles)} scene titles:")
        for i, title in enumerate(scene_titles, 1):
            print(f"   {i}. {title}")
        
        print()
        print("🎉 Mock mode file analysis completed successfully!")
        print()
        print("💡 To test the full mock mode:")
        print("   1. Set MOCK_LLM_MODE=true")
        print("   2. Run the FastAPI server")
        print("   3. Make a request to /api/generate-script")
        print("   4. It will use this file instead of making LLM calls")
        
        return True
        
    except Exception as e:
        print(f"❌ Error reading script file: {e}")
        return False

if __name__ == "__main__":
    success = test_mock_mode()
    
    if success:
        print()
        print("✅ File analysis passed!")
        print()
        print("🚀 Next steps:")
        print("   - Set MOCK_LLM_MODE=true in your environment")
        print("   - Start the FastAPI server: uvicorn src.api.app:app --reload")
        print("   - Test with: curl -X POST http://localhost:8000/api/generate-script \\")
        print("     -H 'Content-Type: application/json' \\")
        print("     -d '{\"github_url\": \"https://github.com/example/test\"}'")
    else:
        print()
        print("❌ File analysis failed!")
        sys.exit(1) 