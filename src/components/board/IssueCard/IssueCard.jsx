import React, { useCallback, useMemo } from "react";
import { getIssueColor } from "./IssueTypeUtils";
import { useIssueCardDragDrop } from '../../../hooks/useIssueCardDragDrop';
import IssueCardHeader from "./IssueCardHeader";
import IssueCardTitle from './IssueCardTitle';
import IssueCardFooter from './IssueCardFooter';

const IssueCard = ({ issue, epics = [], onIssueClick }) => {
  const {
    isDragging,
    dragStartHandler,
    dragEndHandler,
  } = useIssueCardDragDrop(issue);
  
  const handleClick = useCallback(() => {
    if (onIssueClick) {
      onIssueClick(issue);
    }
  }, [onIssueClick, issue]);
  
  // Memoize classes to prevent recalculation on every render
  const cardClasses = useMemo(() => {
    const baseClass = `bg-white dark:bg-gradient-card rounded-xl p-3 border ${getIssueColor(issue)} border-l-4 shadow-sm cursor-grab active:cursor-grabbing`;
    const dragClass = isDragging
      ? "opacity-50 ring-2 ring-primary shadow-lg z-50"
      : "hover:shadow-md dark:hover:shadow-gray-900/30 hover:shadow-lg";
    return `${baseClass} ${dragClass} transition-all duration-150 will-change-transform mb-3`;
  }, [isDragging, issue]);
  
  return (
    <div
      className={cardClasses}
      onClick={handleClick}
      draggable="true"
      onDragStart={dragStartHandler}
      onDragEnd={dragEndHandler}
      style={{
        transform: isDragging ? 'scale(1.05) rotate(2deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 150ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 150ms ease-out',
      }}
    >
      <div className="flex flex-col space-y-2">
        <IssueCardHeader issue={issue} />
        <IssueCardTitle title={issue.title} />
        <IssueCardFooter issue={issue} epics={epics} />
      </div>
    </div>
  );
};

export default React.memo(IssueCard, (prev, next) => {
  return prev.issue.id === next.issue.id && 
         prev.epics === next.epics &&
         prev.onIssueClick === next.onIssueClick;
});

