from flask import Flask, request, jsonify
from flask_cors import CORS
import time

from retrieval.search import run_search, find_explanation

app = Flask(__name__)
# Configure CORS to allow requests from http://localhost:3000
CORS(app, resources={r"/search": {"origins": "http://localhost:3000"}, r"/comment": {"origins": "http://localhost:3000"}})

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    github_url = data.get('github_url')
    query = data.get('query')
    print(f"Received GitHub URL: {github_url}")
    print(f"Received Query: {query}")

    start = time.time()
    result = run_search(github_url, query)
    end = time.time()
    print(f"Search took {end - start} seconds to run.")

    response = {}
    for file_recommendations in result.files:
        response[file_recommendations.file_name] = []
        for function_def in file_recommendations.snippets:
            response[file_recommendations.file_name].append({
                f"{function_def.line_start}:{function_def.line_end}": function_def.code
            })

    return jsonify(response)

@app.route('/comment', methods=['POST'])
def comment():
    data = request.get_json()
    print("Received data:", data)
    query = data.get('query')
    current_context = data.get('current_context')
    current_file = data.get('current_file')
    current_line = data.get('current_line')
    print(f"Received Query: {query}")
    print(f"Received Current Context: {current_context}")
    print(f"Received Current File: {current_file}")
    print(f"Received Current Line: {current_line}")

    find_explanation_response = find_explanation(query, current_context, current_file, current_line)
    print(find_explanation_response)

    mock_response = {
        'response': find_explanation_response
    }

    return jsonify(mock_response)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=3002)

