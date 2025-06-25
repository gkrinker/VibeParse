#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.api.routes.script import parse_sample_script_md
import re

def test_parsing():
    print("Testing script parsing...")
    script = parse_sample_script_md('test_output/src_script.md')
    print(f'Total scenes: {len(script.scenes)}')
    
    print('\nLooking for scenes with proper line numbers:')
    for i, scene in enumerate(script.scenes):
        if scene.code_highlights:
            for j, highlight in enumerate(scene.code_highlights):
                if highlight.start_line > 0 or highlight.end_line > 0:
                    print(f'Scene {i}: {scene.title}')
                    print(f'  Highlight {j}: {highlight.file_path} (lines {highlight.start_line}-{highlight.end_line})')
                    break
    
    print('\nChecking markdown file for line number format:')
    with open('test_output/src_script.md', 'r') as f:
        lines = f.readlines()
    
    for i, line in enumerate(lines):
        if '**' in line and '(lines' in line:
            print(f'Line {i+1}: {line.strip()}')
            # Test regex
            m = re.match(r'\*\*(.+?)\*\* \(lines (\d+)-(\d+)\):', line)
            if m:
                print(f'  Regex match: file={m.group(1)}, start={m.group(2)}, end={m.group(3)}')
            else:
                print(f'  No regex match')

if __name__ == "__main__":
    test_parsing() 