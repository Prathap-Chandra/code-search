from retrieval.retrieve_repo import (
  get_repo_file_structure, 
  get_file_contents,  
  find_function_definition
)

from retrieval.prompts import (
  FIND_MOST_RELEVANT_FILE,
  ANSWER_FORMAT, 
  RELEVANT_FILES_KEY, 
  RELEVANT_DIRECTORIES_KEY,
  FIND_MOST_RELEVANT_FUNCTIONS,
  ANSWER_FORMAT_FILES,
  RELEVANT_FUNCTIONS_KEY
)
from retrieval.model_call import call_model, LLAMA_70B

import json
from dataclasses import dataclass

# Dummy test case:
REPO = "https://github.com/TheAlgorithms/Python"
QUERY = "I want to create a 2d point class and compute the distance between two points"

@dataclass
class FunctionDefinition:
  name: str
  line_start: int
  line_end: int
  code: str


@dataclass
class FileRecommendations:
  file_name: str
  functions: list[FunctionDefinition]

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

    sys_prompt = build_file_contents_search_sys_prompt(query, file_contents)
    response = call_model(LLAMA_70B, sys_prompt)
    parsed_response = json.loads(response)


    file_recommendations = FileRecommendations(file_name=file, functions=[])
    if RELEVANT_FUNCTIONS_KEY in parsed_response:
      print("Relevant functions found in file:", parsed_response[RELEVANT_FUNCTIONS_KEY])
      for function_name in parsed_response[RELEVANT_FUNCTIONS_KEY]:
        line_start, line_end, function_code = find_function_definition(file_contents.code, function_name)

        function_def = FunctionDefinition(name=function_name, 
          line_start=line_start, line_end=line_end, code=function_code)
        file_recommendations.functions.append(function_def)
    
    recommendations.files.append(file_recommendations)

  return recommendations

def display_recommendations(recommendations):
  for file_recommendations in recommendations.files:
    print(f"\nFile: {file_recommendations.file_name}")
    for function_def in file_recommendations.functions:
      print(f"Function: {function_def.name}")
      print(function_def.code)


def run_search(repo, query):
  files_to_use = search_for_relevant_files(repo, query)
  recommendations = search_for_relevant_functions(repo, query, files_to_use)
  return recommendations

if __name__ == "__main__":
  files_to_use = search_for_relevant_files(REPO, QUERY)
  print("Files to use:", files_to_use)

  recommendations = search_for_relevant_functions(REPO, QUERY, files_to_use)
  display_recommendations(recommendations)

