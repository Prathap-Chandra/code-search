RELEVANT_FILES_KEY = "most_relevant_files"
RELEVANT_DIRECTORIES_KEY = "most_relevant_directories"
RELEVANT_FUNCTIONS_KEY = "most_relevant_functions"
RELEVANT_CLASSES_KEY = "most_relevant_classes"
EXPLANATION_KEY = "explanation"

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
  "{RELEVANT_DIRECTORIES_KEY}": [<list of names of the most relevant file. Return up to 3. Leave empty if no relevant file is found.>],
  "{RELEVANT_FILES_KEY}": [<list of names of the most relevant directories. Return up to 3. Leave empty if no relevant directory is found.>]"
}}

To reiterate:
1. Only return a json object and nothing else. Your response should begin with an open brace and end with a close brace.
2. Please ensure that every file or directory you return exists. Double check that it was one of the options.
3. In general, if you feel like a directory could be relevant, you should return it. Consider both precision and recall.
"""


FIND_MOST_RELEVANT_FUNCTIONS = """
You are an expert in a given code base and your task is to help point a new
team member to the most relevant functions/classes in the code base given their query.

You will be given the file contents of a single file in the codebase and the 
user query. Your task is to find the most relevant functions/classes.

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
  "{RELEVANT_FUNCTIONS_KEY}": [<list of function names relevant to the user's query. Leave empty if no relevant functions are found.>]
  "{RELEVANT_CLASSES_KEY}": [<list of class names relevant to the user's query. Leave empty if no relevant classes are found.>]
}}

To reiterate:
1. Only return a json object and nothing else. Your response should begin with an open brace and end with a close brace.
2. Please ensure that every function or class you return exists. Double check that it exists in the file code.
3. Only return functions or classes that are highly relevant to the user's query. You want to optimize for precision. Return nothing if
   if the function/class will not address the user's query.
"""


PROVIDE_EXPLANATION = """
You are an expert in a given code base and your task is to help a new team
member to understand the codebase better.

You will be given the overall code snippet that the team member is referring to,
the exact line that the team member is referring to, and the user query.

<<<< CODE SNIPPET >>>>

{code_snippet}

<<<< END CODE SNIPPET >>>>

<<<< LINE USER IS POINTING TO >>>>

{line}

<<<< END LINE USER IS POINTING TO >>>>

<<<< USER QUERY >>>>

{query}

<<<< END USER QUERY >>>>
"""

ANSWER_EXPLANATION = f"""
Provide your answer as if you are directly talking to the new team member.
No need for any greeting or introduction. Just give an answer.

To reiterate:
1. Give your answer directly. No greeting, introduction, or prefix.
2. Please provide the best answer you can given the context.
3. Be concise. Short and simple is better.
"""
