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
import WordPullUp from "@/components/ui/word-pull-up";
import ShimmerButton from "@/components/ui/shimmer-button";

type SearchResult = {
  [filename: string]: Array<{ [lineRange: string]: string }>;
};

interface CommentPopupProps {
  onSubmit: (comment: string, response: string) => void;
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
  const [commentResponse, setCommentResponse] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setCommentResponse(null);

    try {
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
      setCommentResponse(data.response);
    } catch (e) {
      console.error("An error occurred while submitting the comment:", e);
      setCommentResponse("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (commentResponse) {
      onSubmit(comment, commentResponse);
    }
    setComment("");
    setCommentResponse(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <WordPullUp words="Ask a Question" />
          </DialogTitle>
        </DialogHeader>
        {!commentResponse ? (
          <>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your question..."
              className="min-h-[100px]"
            />
            <DialogFooter>
              <Button onClick={handleClose} variant="outline">
                Cancel
              </Button>
              <ShimmerButton
                onClick={handleSubmit}
                disabled={!comment.trim() || isLoading}
                className="h-4/5"
              >
                {isLoading ? "Submitting..." : "Submit"}
              </ShimmerButton>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="mt-2">
              <h4 className="font-semibold">Your Question:</h4>
              <p className="border border-black p-4 rounded-md">{comment}</p>
              <h4 className="font-semibold mt-4">Answer:</h4>
              <p className="border border-black p-4 rounded-md">
                {commentResponse}
              </p>
            </div>
            <DialogFooter>
              <ShimmerButton onClick={handleClose}>Close</ShimmerButton>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
