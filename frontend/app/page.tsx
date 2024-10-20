"use client";

import { useState, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommentPopup } from "@/components/ui/CommentPopup";
import { EditorView } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { lineNumbers } from "@codemirror/view";

type SearchResult = {
  [filename: string]: Array<{ [lineRange: string]: string }>;
};

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<{
    [key: string]: { [key: number]: string[] };
  }>({});
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentPosition, setCommentPosition] = useState({ top: 0, left: 0 });
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  const codeMirrorRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setSearchResults(null);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          github_url: githubUrl,
          query: question,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (e) {
      console.error("An error occurred during the search:", e);
      setError("An error occurred while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineClick = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement>,
      filename: string,
      startLine: number
    ) => {
      if (codeMirrorRef.current) {
        const rect = codeMirrorRef.current.getBoundingClientRect();
        const lineHeight = 20; // Adjust this value based on your CodeMirror line height
        const clickedLine =
          Math.floor((event.clientY - rect.top) / lineHeight) + startLine;

        setCommentPosition({
          top: event.clientY - rect.top,
          left: event.clientX - rect.left,
        });
        setShowCommentPopup(true);
        setCurrentFile(filename);
        setCurrentLine(clickedLine);
      }
    },
    []
  );

  const handleCommentSubmit = (comment: string) => {
    if (currentFile && currentLine !== null) {
      setComments((prevComments) => ({
        ...prevComments,
        [currentFile]: {
          ...prevComments[currentFile],
          [currentLine]: [
            ...(prevComments[currentFile]?.[currentLine] || []),
            comment,
          ],
        },
      }));
      setShowCommentPopup(false);
    }
  };

  const handleCommentClose = () => {
    setShowCommentPopup(false);
  };

  const getLanguageExtension = (filename: string) => {
    if (filename.endsWith(".js") || filename.endsWith(".ts")) {
      return javascript();
    } else if (filename.endsWith(".py")) {
      return python();
    }
    return javascript(); // default to JavaScript
  };

  const parseLineRange = (lineRange: string): [number, number] => {
    const [start, end] = lineRange.split(":").map(Number);
    return [start || 1, end || start || 1]; // Default to [1, 1] if parsing fails
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-3xl font-bold">Code Search Tool</h1>
      <main className="flex flex-col gap-4 w-full max-w-md">
        <Input
          type="text"
          placeholder="Enter GitHub Repository URL"
          className="w-full"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Enter your question (e.g., Where can I find code that does X?)"
          className="w-full"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </main>

      {isLoading && (
        <div className="mt-4 text-center">
          <p>Loading results...</p>
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {searchResults && (
        <div className="mt-8 w-full">
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          {Object.entries(searchResults).map(([filename, snippets]) => (
            <div key={filename} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{filename}</h3>
              {snippets.map((snippet, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-md mb-2">
                  {Object.entries(snippet).map(([lineRange, code]) => {
                    const [startLine, endLine] = parseLineRange(lineRange);
                    return (
                      <div key={lineRange}>
                        <p className="text-sm text-gray-600 mb-1">
                          Lines {lineRange}:
                        </p>
                        <div
                          ref={codeMirrorRef}
                          onClick={(event) =>
                            handleLineClick(event, filename, startLine)
                          }
                        >
                          <CodeMirror
                            value={code}
                            height="auto"
                            extensions={[
                              getLanguageExtension(filename),
                              lineNumbers({
                                formatNumber: (n) => String(n + startLine - 1),
                              }),
                            ]}
                            theme="dark"
                            editable={false}
                            basicSetup={{
                              lineNumbers: false,
                              foldGutter: false,
                              dropCursor: false,
                              allowMultipleSelections: false,
                              indentOnInput: false,
                            }}
                          />
                        </div>
                        {comments[filename] &&
                          Object.entries(comments[filename]).map(
                            ([lineNumber, lineComments]) => {
                              if (
                                Number(lineNumber) >= startLine &&
                                Number(lineNumber) <= endLine
                              ) {
                                return (
                                  <div key={lineNumber} className="mt-2">
                                    <p className="text-sm font-semibold">
                                      Line {lineNumber}:
                                    </p>
                                    {lineComments.map((comment, index) => (
                                      <p key={index} className="text-sm ml-4">
                                        {comment}
                                      </p>
                                    ))}
                                  </div>
                                );
                              }
                              return null;
                            }
                          )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {showCommentPopup && (
        <div
          style={{
            position: "absolute",
            top: commentPosition.top,
            left: commentPosition.left,
          }}
        >
          <CommentPopup
            onSubmit={handleCommentSubmit}
            onClose={handleCommentClose}
            searchResults={searchResults}
            currentFile={currentFile}
            currentLine={currentLine}
          />
        </div>
      )}
    </div>
  );
}
