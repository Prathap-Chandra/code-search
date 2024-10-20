RELEVANT_FILES_KEY = "most_relevant_files"
RELEVANT_DIRECTORIES_KEY = "most_relevant_directories"
RELEVANT_FUNCTIONS_KEY = "most_relevant_functions"
RELEVANT_CLASSES_KEY = "most_relevant_classes"

FIND_MOST_RELEVANT_FILE = """
You are an expert in a given code base and your task is to help point a new
team member to the most relevant file in the code base given their query.

You will be given a list of directories and files in one level of the codebase
and a query. Your task is to find the most relevant files and directories.

Here is a list of directories codebase:

{directories}

Here is a list of files in the codebase:

{files}

The query is: {query}

"""

ANSWER_FORMAT = f"""
Provide you answer in json format:

{{
  "{RELEVANT_DIRECTORIES_KEY}": [<list of names of the most relevant file>. Leave empty if no relevant file is found],
  "{RELEVANT_FILES_KEY}": [<list of names of the most relevant directories>. Leave empty if no relevant directory is found]"
}}

To reiterate:
1. Only return a json object and nothing else. Your response should begin with an open brace and end with a close brace.
2. Please ensure that every file or directory you return exists. Double check that it was one of the options.
"""


FIND_MOST_RELEVANT_FUNCTIONS = """
You are an expert in a given code base and your task is to help point a new
team member to the most relevant function in the code base given their query.

You will be given the file contents of a single file in the codebase and the 
user query. Your task is to find the most relevant function.

<<<< FILE CONTENTS >>>>

{file_contents}

<<<< END FILE CONTENTS >>>>

<<<< USER QUERY >>>>

{query}

<<<< END USER QUERY >>>>
"""

ANSWER_FORMAT_FILES = f"""
Provide you answer in json format:

{{
  "{RELEVANT_FUNCTIONS_KEY}": [<list of names of the most relevant file>. Leave empty if no relevant file is found]
}}

To reiterate:
1. Only return a json object and nothing else. Your response should begin with an open brace and end with a close brace.
2. Please ensure that every function you return exists. Double check that it exists in the file code.
3. Make sure to return a function name only. Do not return class or variable names. All python function start with the word "def".
"""