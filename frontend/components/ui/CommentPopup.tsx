import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CommentPopupProps {
  onSubmit: (comment: string) => void;
  onClose: () => void;
}

export function CommentPopup({ onSubmit, onClose }: CommentPopupProps) {
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    onSubmit(comment);
    setComment("");
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
