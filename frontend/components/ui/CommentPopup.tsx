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
      <DialogContent className="sm:max-w-[60vw] sm:max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <WordPullUp words="Ask a Question" />
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-scroll">
          {!commentResponse ? (
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your question..."
              className="min-h-[100px] w-full"
            />
          ) : (
            <div className="mt-2 space-y-4">
              <div>
                <h4 className="font-semibold">Your Question:</h4>
                <p className="border border-gray-300 p-4 rounded-md bg-gray-50">
                  {comment}
                </p>
              </div>
              <div>
                <h4 className="font-semibold">Answer:</h4>
                <div className="border border-gray-300 rounded-md bg-white">
                  <div className="max-h-[40vh] overflow-y-scroll  p-4">
                    {commentResponse}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="mt-4 sticky bottom-0 bg-white p-4 border-t">
          {!commentResponse ? (
            <>
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
            </>
          ) : (
            <ShimmerButton onClick={handleClose}>Close</ShimmerButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
