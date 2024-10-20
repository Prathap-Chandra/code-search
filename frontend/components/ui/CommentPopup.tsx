import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
type SearchResult = {
  [filename: string]: Array<{ [lineRange: string]: string }>;
};
interface CommentPopupProps {
  onSubmit: (comment: string) => void;
  onClose: () => void;
  searchResults: SearchResult[];
  currentFile: string;
  currentLine: number;
}

export function CommentPopup({
  onSubmit,
  onClose,
  searchResults,
  currentFile,
  currentLine,
}: CommentPopupProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentResults, setCommentResults] = useState(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setCommentResults(null);

    try {
      const response = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: comment,
          current_context: searchResults,
          currentFile: currentFile,
          currentLine: currentLine,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCommentResults(data);
      onSubmit(comment);
      setComment("");
    } catch (e) {
      console.error("An error occurred while submitting the comment:", e);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bg-white border border-gray-300 p-4 rounded shadow-lg">
      <Input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Add your comment..."
        className="mb-2"
      />
      <div className="flex justify-end gap-2">
        <Button onClick={handleSubmit} disabled={!comment.trim()}>
          Submit
        </Button>
        <Button onClick={onClose} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  );
}
