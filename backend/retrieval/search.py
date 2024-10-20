from retrieval.retrieve_repo import (
  get_repo_file_structure, 
  get_file_contents,  
  find_code_snippet_definition
)

from retrieval.prompts import (
  FIND_MOST_RELEVANT_FILE,
  ANSWER_FORMAT, 
  RELEVANT_FILES_KEY, 
  RELEVANT_DIRECTORIES_KEY,
  FIND_MOST_RELEVANT_FUNCTIONS,
  ANSWER_FORMAT_FILES,
  RELEVANT_FUNCTIONS_KEY,
  RELEVANT_CLASSES_KEY
)
from retrieval.model_call import call_model, LLAMA_70B

import json
from dataclasses import dataclass
from urllib.parse import urlparse


# Dummy test case:
REPO = "https://github.com/TheAlgorithms/Python"
QUERY = "I want to create a 2d point class and compute the distance between two points"

@dataclass
class CodeSnippetDefinition:
  name: str
  line_start: int
  line_end: int
  code: str


@dataclass
class FileRecommendations:
  file_name: str
  snippets: list[CodeSnippetDefinition]

@dataclass
class Recommendations:
  files: list[FileRecommendations]

# -----------  FOLDER SEARCH ---------------
def build_folder_structure_search_sys_prompt(query, folder_contents):
  directories_str = "\n".join(folder_contents.directories)
  files_str = "\n".join(folder_contents.files)

  return FIND_MOST_RELEVANT_FILE.format(
    directories=directories_str,
    files=files_str,
    query=query
  ) + "\n" + ANSWER_FORMAT


def search_for_relevant_files(repo, query):
  files_to_use = []

  directories_to_search = [None]
  while directories_to_search:
    print("Searching directories:", directories_to_search)
    directory = directories_to_search.pop(0)
    contents = get_repo_file_structure(repo, directory)

    # Call model and get response
    sys_prompt = build_folder_structure_search_sys_prompt(query, contents)
    response = call_model(LLAMA_70B, sys_prompt)
    print(response)

    parsed_response =json.loads(response)

    if RELEVANT_DIRECTORIES_KEY in parsed_response:
      for sub_dir in parsed_response[RELEVANT_DIRECTORIES_KEY]:
        if directory:
          directories_to_search.append(directory + "/" + sub_dir)
        else:
          directories_to_search.append(sub_dir)

    if RELEVANT_FILES_KEY in parsed_response:
      for file in parsed_response[RELEVANT_FILES_KEY]:
        if directory:
          files_to_use.append(directory + "/" + file)
        else:
          files_to_use.append(file)

  return files_to_use

# -----------  FILE SEARCH ---------------

def build_file_contents_search_sys_prompt(query, file_contents):
  return FIND_MOST_RELEVANT_FUNCTIONS.format(
    file_contents=file_contents.code,
    query=query
  ) + "\n" + ANSWER_FORMAT_FILES

def search_for_relevant_functions(repo, query, files_to_use):
  recommendations = Recommendations([])

  for file in files_to_use:
    file_contents = get_file_contents(repo, file)
    if not file_contents:
      continue

    sys_prompt = build_file_contents_search_sys_prompt(query, file_contents)
    response = call_model(LLAMA_70B, sys_prompt)
    parsed_response = json.loads(response)


    file_recommendations = FileRecommendations(file_name=file, snippets=[])
    if RELEVANT_FUNCTIONS_KEY in parsed_response:
      print(f"Relevant functions found in file: {file}:", parsed_response[RELEVANT_FUNCTIONS_KEY])
      for function_name in parsed_response[RELEVANT_FUNCTIONS_KEY]:
        func_def = find_code_snippet_definition(file_contents.code, function_name, "function")
        if not func_def:
          continue

        line_start, line_end, function_code = func_def
        
        function_def = CodeSnippetDefinition(name=function_name, 
          line_start=line_start, line_end=line_end, code=function_code)
        file_recommendations.snippets.append(function_def)

    if RELEVANT_CLASSES_KEY in parsed_response:
      print(f"Relevant classes found in file: {file}:", parsed_response[RELEVANT_CLASSES_KEY])
      for class_name in parsed_response[RELEVANT_CLASSES_KEY]:
        class_def = find_code_snippet_definition(file_contents.code, class_name, "class")
        if not class_def:
          continue

        line_start, line_end, class_code = class_def
        
        class_def = CodeSnippetDefinition(name=class_name, 
          line_start=line_start, line_end=line_end, code=class_code)
        file_recommendations.snippets.append(class_def)
    
    if file_recommendations.snippets: 
      recommendations.files.append(file_recommendations)

  return recommendations

def display_recommendations(recommendations):
  for file_recommendations in recommendations.files:
    print(f"\nFile: {file_recommendations.file_name}")
    for function_def in file_recommendations.functions:
      print(f"Function: {function_def.name}")
      print(function_def.code)

def extract_github_base_url(github_url):
    # Parse the URL
    parsed_url = urlparse(github_url)
    
    # Split the path into components
    path_parts = parsed_url.path.strip('/').split('/')
    
    # Extract the base URL (scheme + netloc + username + repo name)
    if len(path_parts) >= 2:
        base_url = f"{parsed_url.scheme}://{parsed_url.netloc}/{path_parts[0]}/{path_parts[1]}"
    else:
        raise ValueError("Invalid GitHub URL")
    
    return base_url

def run_search(repo, query):
  base_url = extract_github_base_url(repo)
  print("Base URL:", base_url)
  files_to_use = search_for_relevant_files(base_url, query)
  print("Files to use:", files_to_use)
  recommendations = search_for_relevant_functions(base_url, query, files_to_use)
  return recommendations

if __name__ == "__main__":
  files_to_use = search_for_relevant_files(REPO, QUERY)
  print("Files to use:", files_to_use)

  recommendations = search_for_relevant_functions(REPO, QUERY, files_to_use)
  display_recommendations(recommendations)

