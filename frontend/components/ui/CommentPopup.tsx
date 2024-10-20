import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type SearchResult = {
  [filename: string]: Array<{ [lineRange: string]: string }>;
};

interface CommentPopupProps {
  onSubmit: (comment: string) => void;
  onClose: () => void;
  searchResults: SearchResult | null;
  currentFile: string | null;
  currentLine: number | null;
  isOpen: boolean;
}

export function CommentPopup({
  onSubmit,
  onClose,
  searchResults,
  currentFile,
  currentLine,
  isOpen,
}: CommentPopupProps) {
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentResults, setCommentResults] = useState(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setCommentResults(null);

    try {
      console.log("Sending data:", {
        query: comment,
        current_context: searchResults,
        current_file: currentFile,
        current_line: currentLine,
      });

      const response = await fetch("/api/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: comment,
          current_context: searchResults,
          current_file: currentFile,
          current_line: currentLine,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      setCommentResults(data);
      onSubmit(comment);
      setComment("");
      onClose();
    } catch (e) {
      console.error("An error occurred while submitting the comment:", e);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Comment</DialogTitle>
        </DialogHeader>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add your comment..."
          className="min-h-[100px]"
        />
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!comment.trim() || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
