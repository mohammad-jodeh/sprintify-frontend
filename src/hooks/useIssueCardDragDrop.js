import { useState, useCallback } from "react";

/**
 * Custom hook for issue card drag and drop functionality using native HTML5 API
 * Optimized for smooth GPU-accelerated dragging
 */
export const useIssueCardDragDrop = (issue) => {
  const [isDragging, setIsDragging] = useState(false);

  const dragStartHandler = useCallback((e) => {
    setIsDragging(true);
    e.dataTransfer.setData("issueId", issue.id);
    e.dataTransfer.setData("sourceStatusId", issue.statusId);
    e.dataTransfer.effectAllowed = "move";
    // Browser will use default ghost image during drag
  }, [issue.id, issue.statusId]);

  const dragEndHandler = useCallback((e) => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    dragStartHandler,
    dragEndHandler,
  };
};
