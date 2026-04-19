import React, { useRef, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import Column from "./Column/Column";
import CreateColumnModal from "./CreateColumnModal";
import { useAutoScroll } from "../../hooks/useAutoScroll";
import { useColumnReorder } from "../../hooks/useColumnReorder";
import { useBoardStore } from "../../store/boardStore";

const BoardContent = ({
  board,
  isAnimated,
  canConfigureBoard,
  canCreateTask,
  issues = [], // Add issues prop
  onMoveIssue, // Add onMoveIssue prop
  epics = [], // Add epics prop
  onIssueClick, // Add onIssueClick prop
  onIssueCreated, // Add handler functions
  onColumnCreated,
  onColumnUpdated,
  onColumnDeleted,
  filters,
  activeSprints,
}) => {
  const boardContentRef = useRef(null);
  const { reorderColumns } = useBoardStore();
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);

  // Column reordering functionality
  const handleColumnReorder = async (newColumnOrder) => {
    if (board.project?.id) {
      try {
        await reorderColumns(board.project.id, newColumnOrder);
      } catch (error) {
        console.error('Failed to reorder columns:', error);
        // Could add toast notification here
      }
    }
  };

  const {
    handleDragStart: handleColumnDragStart,
    handleDragOver: handleColumnDragOver,
    handleDragLeave: handleColumnDragLeave,
    handleDrop: handleColumnDrop,
    handleDragEnd: handleColumnDragEnd,
    getDragStyles: getColumnDragStyles,
  } = useColumnReorder(board.columns, handleColumnReorder);

  const {
    containerRef: autoScrollRef,
    handleDragOver: autoScrollDragOver,
    handleDragLeave: autoScrollDragLeave,
    handleDrop: autoScrollDrop,
  } = useAutoScroll({
    horizontalScroll: true,
    verticalScroll: false,
    scrollSpeed: 15,
    edgeSize: 80,
  });

  // Combine refs for the scroll container
  const setRefs = useCallback((node) => {
    boardContentRef.current = node;
    autoScrollRef.current = node;
  }, []);

  return (
    <div
      onDragOver={autoScrollDragOver}
      onDragLeave={autoScrollDragLeave}
      onDrop={autoScrollDrop}
      className={`transition-all duration-1000 delay-300 ${
        isAnimated ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } horizontal-scroll-active overflow-x-auto overflow-visible flex-1`}
    >
      <div className="flex space-x-8 min-w-max p-8 ">
        {" "}        {board.columns.map((column, index) => (
          <div
            key={column.id}
            className={`transition-all duration-700 ${
              isAnimated
                ? "translate-y-0 opacity-100"
                : "translate-y-20 opacity-0"
            }${getColumnDragStyles(index)}`}
            style={{ transitionDelay: `${index * 150}ms` }}
            draggable={canConfigureBoard}
            onDragStart={(e) => handleColumnDragStart(e, column, index)}
            onDragOver={(e) => handleColumnDragOver(e, index)}
            onDragLeave={handleColumnDragLeave}
            onDrop={(e) => handleColumnDrop(e, index)}
            onDragEnd={handleColumnDragEnd}
          >
            {" "}            <Column
              column={column}
              index={index}
              canCreateTask={canCreateTask}
              issues={issues}
              onMoveIssue={onMoveIssue}
              epics={epics}
              onIssueClick={onIssueClick}
              onIssueCreated={onIssueCreated}
              onColumnUpdated={onColumnUpdated}
              onColumnDeleted={onColumnDeleted}
              filters={filters}
              activeSprints={activeSprints}
              projectId={board.project?.id}
            />
          </div>
        ))}
        {canConfigureBoard && (
          <>
            <button
              onClick={() => setIsCreateColumnModalOpen(true)}
              className="flex flex-col items-center justify-center w-80 min-h-[600px] p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/20 dark:hover:to-blue-800/20 transition-all duration-300 group cursor-pointer"
              title="Create a new column"
            >
              <Plus size={40} className="text-gray-400 group-hover:text-blue-500 transition-colors mb-3" />
              <span className="text-base font-semibold text-gray-600 dark:text-gray-300 text-center">
                Add Column
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Click to create a new column
              </span>
            </button>

            <CreateColumnModal
              open={isCreateColumnModalOpen}
              onClose={() => setIsCreateColumnModalOpen(false)}
              onColumnCreated={() => {
                // Refresh board data - can be handled by parent component
                onColumnCreated?.();
              }}
              projectId={board.project?.id}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default BoardContent;
