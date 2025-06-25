# Plan: Improved First Chapter/Scene Generation for Code Explanation App

## Goal
Enhance the first chapter/scene so that:
- For a **single file**: The first chapter gives a high-level summary of the file's purpose and role in the project, with repo context if possible.
- For a **directory**: The first chapter is a multi-scene repo-wide overview (Intro Chapter), breaking down the structure, file purposes, and relationships.

## 1. Detecting Single File vs Directory
- In the backend (`script_generator.py`), after fetching code from GitHub, check:
  - If `len(files) == 1`, treat as a single file.
  - If `len(files) > 1`, treat as a directory/multi-file submission.

## 2. Generating High-Level Summaries
### Single File
- Fetch the list of all files in the repo (using the GitHub API) for context.
- Prompt the LLM:
  > "Given the following list of files in this repository: [list], and the content of [filename] below, summarize the likely purpose and role of this file in the context of the overall project. If possible, infer how it might interact with or relate to other files."
- Use only the file's content and the repo file list for this prompt.

### Directory (Multi-Scene Intro Chapter)
- After scene generation, build a repo tree (list of all file paths, formatted as an indented tree or Markdown list).
- Collect which files/scenes were explained in detail.
- Prompt the LLM:
  > "Repository structure:
  > [repo tree]
  >
  > Files explained in detail:
  > - [file1]: [scene title(s)]
  > - [file2]: [scene title(s)]
  > ...
  >
  > Please provide a high-level overview of the project structure, broken down into 2–4 scenes. For each scene:
  > - Give it a title and a duration (in seconds, 15–30s).
  > - Focus each scene on a logical part of the repo (e.g., main entry point, UI components, utilities, configuration).
  > - For each file or group of files, briefly describe its likely purpose and how it fits into the project.
  > - If a file was not covered in detail, make an educated guess based on its name and location.
  > - Summarize how the files relate to each other and the overall architecture.
  >
  > Format your answer as a list of scenes, each with a title, duration, and content."
- Parse the LLM's response into multiple "Intro" scenes and insert them at the start of your script.

## 3. Injecting the Summary as the First Chapter/Scenes
- After generating the summary (from above), create one or more `Scene` objects:
  - `title`: e.g., "Overview of [FileName]" or "Project Structure Overview"
  - `duration`: 15-30 seconds (estimate)
  - `content`: The summary text from the LLM
  - `code_highlights`: [] (no code highlight for these scenes)
- Insert these scenes as the first items in the `scenes` list before any other scenes/chapters.

## 4. Making the Feature Modular and Safe
- Implement a config flag or environment variable (e.g., `ENABLE_INTRO_CHAPTER`) to toggle this feature on/off.
- If disabled, fall back to the current behavior (no multi-scene intro chapter).
- Log when the feature is enabled/disabled for debugging and cost tracking.
- Roll out incrementally and monitor LLM usage/costs.

## 5. Changes Needed
### Backend Logic
- In `script_generator.py`, after fetching files and generating scenes:
  - Detect single file vs directory.
  - If enabled, call the LLM with the appropriate prompt to generate the summary/intro scenes.
  - Create and insert the summary scenes at the start of the script.

### LLM Prompting
- Add new prompt templates for high-level file and repo summaries, including multi-scene formatting.
- Ensure the LLM is only given the necessary context for this summary (not the full scene prompt).

### Response Parsing
- Parse the LLM's response into multiple scenes if needed.
- No major changes needed otherwise, as the summary scenes can be inserted as `Scene` objects with no code highlights.

## 6. Implementation Steps
1. Update `script_generator.py` to detect single file vs directory after code fetch.
2. Add functions to generate high-level summaries using the LLM for each case, with multi-scene support for directories.
3. Add a config flag/env var to toggle the feature.
4. Create `Scene` objects for the summary/intro and insert them at the start of the scenes list.
5. Adjust tests and UI if needed to ensure the new intro scenes display as expected.
6. Monitor LLM usage and costs; disable if needed.

## 7. Optional Enhancements
- For directories, consider visualizing the file structure in the UI (tree or list).
- Allow the user to click on a file in the overview to jump to its explanation scene.

---
This plan ensures the first chapter/scene always provides valuable, multi-scene context, is modular and safe to enable/disable, and is actionable for implementation in the current codebase. 