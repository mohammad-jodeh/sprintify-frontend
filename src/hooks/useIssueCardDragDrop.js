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
    // Use custom drag image for smooth visual feedback
    const dragImage = new Image();
    dragImage.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%2260%22%3E%3Crect fill=%22%233b82f6%22 width=%22200%22 height=%2260%22 rx=%228%22/%3E%3C/svg%3E';
    e.dataTransfer.setDragImage(dragImage, 100, 30);
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
