"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SearchResult = {
  [filename: string]: Array<{ [lineRange: string]: string }>;
};

export default function Home() {
  const [githubUrl, setGithubUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Search Results</h2>
          {Object.entries(searchResults).map(([filename, snippets]) => (
            <div key={filename} className="mb-6">
              <h3 className="text-xl font-semibold mb-2">{filename}</h3>
              {snippets.map((snippet, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-md mb-2">
                  {Object.entries(snippet).map(([lineRange, code]) => (
                    <div key={lineRange}>
                      <p className="text-sm text-gray-600 mb-1">
                        Lines {lineRange}:
                      </p>
                      <pre className="bg-white p-2 rounded">{code}</pre>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
