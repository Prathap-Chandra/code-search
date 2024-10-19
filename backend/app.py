from flask import Flask, request, jsonify
from flask_cors import CORS

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

    # Mock response data
    mock_response = {
        "file1.py": [
            {"10-15": "def search_function(query):\n    # Implementation of search\n    return results"}
        ],
        "file2.js": [
            {"20-25": "function processData(data) {\n  // Data processing logic\n  return processedData;\n}"}
        ]
    }

    return jsonify(mock_response)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=3001)
