import requests
import json
import urllib.parse
import base64
import astroid
import sys

from dataclasses import dataclass

@dataclass
class FolderContents: 
    directories: list
    files: list

@dataclass
class FileContents:
    name: str
    code: str

def get_repo_contents(repo_url, folder_path=None):
    # Extract owner and repo name from the URL
    parts = repo_url.rstrip('/').split('/')
    owner, repo = parts[-2], parts[-1]

    # GitHub API endpoint
    api_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    
    # If a folder is specified, add it to the API URL
    if folder_path:
        api_url += f"/{urllib.parse.quote(folder_path)}"

    # Make a GET request to the GitHub API
    response = requests.get(api_url)

    # Check if the request was successful
    if response.status_code == 200:
        # Parse the JSON response
        return json.loads(response.text)
    else:
        print(f"Error: Unable to fetch repository contents. Status code: {response.status_code}")
        print(f"Folder path: {folder_path}")
        print(response.text)
    
    return None


def get_repo_file_structure(repo_url, path=None):
    contents = get_repo_contents(repo_url, path)
    if contents is None:
      return None
            
    folder_contents = FolderContents(directories=[], files=[])
    if isinstance(contents, list):
        for item in contents:
            if item['type'] == 'dir':
                folder_contents.directories.append(item['name'])
            else:
                folder_contents.files.append(item['name'])
    else:
        if contents['type'] == 'dir':
            folder_contents.directories.append(contents['name'])
        else:
            folder_contents.files.append(contents['name'])

    return folder_contents

def get_file_contents(repo_url, path):
    contents = get_repo_contents(repo_url, path)
    if not contents:
      return None
    if isinstance(contents, list):
      return None
    return FileContents(name=contents['name'], 
                        code=base64.b64decode(contents['content']).decode('utf-8'))
    

def get_function_with_comments(code_str, function_node):
    """
    Extract the function source code, including comments, from the original code string.
    """
    if function_node is None:
        return "Function not found."
    
    # Get the start and end line numbers of the function
    start_line = function_node.lineno - 1  # lineno is 1-based, so adjust to 0-based index
    end_line = function_node.end_lineno  # end_lineno is already 1-based
    
    # Split the original code string by lines
    code_lines = code_str.splitlines()
    
    # Extract the relevant lines (including comments)
    function_lines = code_lines[start_line:end_line]
    
    return (start_line, end_line, "\n".join(function_lines))


def find_function_in_class_or_module(node, function_name, target_type="function"):
    """
    Recursively search through classes and modules to find a function by its name.
    """
    target_type_obj = astroid.FunctionDef if target_type == "function" else astroid.ClassDef

    # If it's a target type definition at the module or class level
    if isinstance(node, target_type_obj) and node.name == function_name:
        return node
    
    # If it's a class, look inside the class body
    if isinstance(node, astroid.ClassDef):
        for class_node in node.body:
            result = find_function_in_class_or_module(class_node, function_name, target_type)
            if result:
                return result
    
    # If it's a module, look at the top level
    if isinstance(node, astroid.Module):
        for module_node in node.body:
            result = find_function_in_class_or_module(module_node, function_name, target_type)
            if result:
                return result
    
    return None

def find_code_snippet_definition(code_str, function_name, target_type="function"):
    # Parse the code string into an AST (Abstract Syntax Tree)
    tree = astroid.parse(code_str)
    
    # Start by looking through the module level
    node = find_function_in_class_or_module(tree, function_name, target_type)
    if node:
        return get_function_with_comments(code_str, node)
    
    return None