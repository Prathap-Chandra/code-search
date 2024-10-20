"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommentPopup } from "@/components/ui/CommentPopup";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { lineNumbers } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import Globe from "@/components/ui/globe";
import { NeonGradientCard } from "@/components/ui/neon-gradient-card";
import WordPullUp from "@/components/ui/word-pull-up";
import ShimmerButton from "@/components/ui/shimmer-button";
import RetroGrid from "@/components/ui/retro-grid";
import BlurIn from "@/components/ui/blur-in";

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
    [key: string]: { [key: number]: { comment: string; response: string }[] };
  }>({});
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<number | null>(null);

  useEffect(() => {
    console.log("Comments updated:", comments);
  }, [comments]);
  console.log("comments", comments);
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
    (filename: string, lineNumber: number) => {
      setCurrentFile(filename);
      setCurrentLine(lineNumber);
      setShowCommentPopup(true);
    },
    []
  );

  const handleCommentSubmit = useCallback(
    (comment: string, response: string) => {
      if (currentFile && currentLine !== null) {
        setComments((prevComments) => {
          const fileComments = prevComments[currentFile] || {};
          const lineComments = fileComments[currentLine] || [];
          console.log(
            "Updating comments:",
            currentFile,
            currentLine,
            comment,
            response
          );
          return {
            ...prevComments,
            [currentFile]: {
              ...fileComments,
              [currentLine]: [...lineComments, { comment, response }],
            },
          };
        });
      }
    },
    [currentFile, currentLine]
  );

  const handleCommentClose = useCallback(() => {
    setShowCommentPopup(false);
    setCurrentFile(null);
    setCurrentLine(null);
  }, []);

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

  const handleCodeMirrorClick = useCallback(
    (
      view: EditorView,
      event: MouseEvent,
      startLine: number,
      filename: string
    ) => {
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos) {
        const line = view.state.doc.lineAt(pos);
        handleLineClick(filename, startLine + line.number - 1);
      }
    },
    [handleLineClick]
  );

  useEffect(() => {
    console.log("Current file updated:", currentFile);
  }, [currentFile]);

  useEffect(() => {
    console.log("Current line updated:", currentLine);
  }, [currentLine]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <RetroGrid />
      <WordPullUp words="Code Search Tool" />
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
        <ShimmerButton onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </ShimmerButton>
      </main>

      {isLoading && (
        <div className="mt-4 text-center">
          <div className="relative flex size-full max-w-lg items-center justify-center overflow-hidden rounded-lg border bg-background px-40 pb-40 pt-8 md:pb-60 md:shadow-xl">
            <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-5xl font-semibold leading-none text-transparent dark:from-white dark:to-slate-900/10">
              Searching...
            </span>
            <Globe className="top-28" />
            <div className="pointer-events-none absolute inset-0 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))]" />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-red-500">
          <p>{error}</p>
        </div>
      )}

      {searchResults && (
        <div className="mt-8 w-full">
          {/* <h2 className="text-2xl font-bold mb-4">Search Results</h2> */}
          <BlurIn word="Search Results"></BlurIn>
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
                        <div>
                          <CodeMirror
                            value={code}
                            height="auto"
                            extensions={[
                              getLanguageExtension(filename),
                              lineNumbers({
                                formatNumber: (n) => String(n + startLine - 1),
                              }),
                              EditorView.domEventHandlers({
                                click: (event, view) => {
                                  handleCodeMirrorClick(
                                    view,
                                    event as MouseEvent,
                                    startLine,
                                    filename
                                  );
                                },
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
                      </div>
                    );
                  })}
                </div>
              ))}
              {/* Render comments for this file */}
              {comments[filename] && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold">
                    Questions & Answers:
                  </h4>
                  {Object.entries(comments[filename]).map(
                    ([lineNumber, lineComments]) => (
                      <div
                        key={lineNumber}
                        className="mt-2 bg-gray-200 p-2 rounded"
                      >
                        <p className="text-sm font-semibold">
                          Line {lineNumber}:
                        </p>
                        {lineComments.map(({ comment, response }, index) => (
                          <div key={index} className="text-sm ml-4 mt-1">
                            <p>
                              <strong>Q:</strong> {comment}
                            </p>
                            <p>
                              <strong>A:</strong> {response}
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <CommentPopup
        onSubmit={handleCommentSubmit}
        onClose={handleCommentClose}
        searchResults={searchResults}
        currentFile={currentFile}
        currentLine={currentLine}
        isOpen={showCommentPopup}
      />
    </div>
  );
}
