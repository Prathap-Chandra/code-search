from flask import Flask, request, jsonify
from flask_cors import CORS

from retrieval.search import run_search

app = Flask(__name__)
# Configure CORS to allow requests from http://localhost:3000
CORS(app, resources={r"/search": {"origins": "http://localhost:3000"}})

@app.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    github_url = data.get('github_url')
    query = data.get('query')
    print(f"Received GitHub URL: {github_url}")
    print(f"Received Query: {query}")

    result = run_search(github_url, query)
    print(f"Result: {result}")

    response = {}
    for file_recommendations in result.files:
        response[file_recommendations.file_name] = []
        for function_def in file_recommendations.functions:
            response[file_recommendations.file_name].append({
                f"{function_def.line_start}:{function_def.line_end}": function_def.code
            })

    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=3001)
