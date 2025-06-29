from typing import List, Dict, Optional
from github import Github
from github.ContentFile import ContentFile
from github.Repository import Repository
import os
from dotenv import load_dotenv
import requests

load_dotenv()

class GitHubService:
    def __init__(self):
        self.github = Github(os.getenv("GITHUB_TOKEN"))
    
    def _parse_github_url(self, url: str) -> tuple[str, str, str, str]:
        """Parse GitHub URL into owner, repo, branch, and path components."""
        # Remove https://github.com/ prefix
        path = url.replace("https://github.com/", "")
        # Split into components
        parts = path.split("/")
        owner = parts[0]
        repo = parts[1]
        # 'blob' or 'tree' is at index 2, branch is at index 3
        branch = parts[3] if len(parts) > 3 else "main"
        file_path = "/".join(parts[4:]) if len(parts) > 4 else ""
        return owner, repo, branch, file_path

    async def get_file_content(self, url: str) -> Dict:
        """Fetch content of a single file from GitHub."""
        try:
            print(f"[GitHub] Fetching file: {url}")
            owner, repo, branch, file_path = self._parse_github_url(url)
            repository: Repository = self.github.get_repo(f"{owner}/{repo}")
            content: ContentFile = repository.get_contents(file_path, ref=branch)
            print(f"[GitHub] Successfully fetched file: {file_path}")
            return {
                "path": file_path,
                "content": content.decoded_content.decode("utf-8"),
                "type": "file"
            }
        except Exception as e:
            print(f"[GitHub] Error fetching file {url}: {e}")
            raise Exception(f"Error fetching file content: {str(e)}")

    async def get_directory_content(self, url: str, file_types: Optional[List[str]] = None) -> List[Dict]:
        """Fetch content of all files in a directory from GitHub."""
        try:
            print(f"[GitHub] Fetching directory: {url}")
            owner, repo, branch, dir_path = self._parse_github_url(url)
            repository: Repository = self.github.get_repo(f"{owner}/{repo}")
            contents = repository.get_contents(dir_path, ref=branch)
            
            files = []
            for content in contents:
                if content.type == "file":
                    # Check file extension if file_types is specified
                    if file_types:
                        ext = content.name.split(".")[-1]
                        if ext not in file_types:
                            continue
                    print(f"[GitHub] Fetching file in directory: {content.path}")
                    files.append({
                        "path": content.path,
                        "content": content.decoded_content.decode("utf-8"),
                        "type": "file"
                    })
                elif content.type == "dir":
                    # Recursively get contents of subdirectory
                    subdir_url = f"https://github.com/{owner}/{repo}/tree/{branch}/{content.path}"
                    print(f"[GitHub] Recursively fetching subdirectory: {subdir_url}")
                    subdir_files = await self.get_directory_content(subdir_url, file_types)
                    files.extend(subdir_files)
            
            print(f"[GitHub] Successfully fetched directory: {dir_path} ({len(files)} files)")
            return files
        except Exception as e:
            print(f"[GitHub] Error fetching directory {url}: {e}")
            raise Exception(f"Error fetching directory content: {str(e)}")

    async def fetch_code(self, url: str, file_types: Optional[List[str]] = None) -> List[Dict]:
        """
        Fetch code from a GitHub file or directory URL.
        Returns a list of file dicts (with 'path', 'content', 'type').
        """
        if "/blob/" in url:
            # Single file
            file = await self.get_file_content(url)
            return [file]
        elif "/tree/" in url:
            # Directory
            return await self.get_directory_content(url, file_types)
        else:
            raise Exception("Invalid GitHub URL: must contain /blob/ or /tree/")

    def get_repo_tree(self, url: str) -> List[str]:
        """Fetch the full repo tree (all file paths) using the GitHub API."""
        owner, repo, branch, _ = self._parse_github_url(url)
        api_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        headers = {"Authorization": f"token {os.getenv('GITHUB_TOKEN')}"}
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        tree = response.json().get('tree', [])
        file_paths = [item['path'] for item in tree if item['type'] == 'blob']
        return file_paths 