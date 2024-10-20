import requests
import json
import urllib.parse
import base64
import astroid
import sys

from dataclasses import dataclass

class_code = """
from __future__ import annotations

from typing import Generic, TypeVar

T = TypeVar("T")


class StackOverflowError(BaseException):
    pass


class StackUnderflowError(BaseException):
    pass


class Stack(Generic[T]):
    def __init__(self, limit: int = 10):
        self.stack: list[T] = []
        self.limit = limit

    def __bool__(self) -> bool:
        return bool(self.stack)

    def __str__(self) -> str:
        return str(self.stack)

    def peek(self) -> T:
        if not self.stack:
            raise StackUnderflowError
        return self.stack[-1]
"""


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
    print(target_type_obj)
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
    else:
        print("Function not found in module level.")
        
    return None

if __name__ == "__main__":
    x = find_code_snippet_definition(class_code, "Stack", "class")
    print(x)