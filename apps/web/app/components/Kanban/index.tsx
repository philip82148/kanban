import { useState } from "react";

import { Stage } from "./Stage";

export type KanbanStage = {
  uniqueNo: number;
  name: string;
  boards: KanbanBoard[];
};

export type KanbanBoard = {
  uniqueNo: number;
  content: string;
};

export const Kanban: React.FC<{
  stages: KanbanStage[];
  onAddBoardClick(stageNo: number): void;
  onBoardDrop(boardNo: number, newStageNo: number, newPrevBoardNo?: number): void;
}> = ({ stages, onAddBoardClick, onBoardDrop }) => {
  const [draggingBoardNo, setDraggingBoardNo] = useState<number | undefined>();

  return (
    <div className="flex h-[800px]">
      {stages.map((stage) => (
        <Stage
          key={stage.uniqueNo}
          name={stage.name}
          boards={stage.boards}
          draggingBoardNo={draggingBoardNo}
          onAddBoardClick={() => onAddBoardClick(stage.uniqueNo)}
          onBoardDragStart={(boardNo) => setDraggingBoardNo(boardNo)}
          onBoardDragEnd={() => setDraggingBoardNo(undefined)}
          onBoardDrop={(boardNo) => {
            if (!draggingBoardNo) return;
            onBoardDrop(draggingBoardNo, stage.uniqueNo, boardNo);
          }}
        />
      ))}
    </div>
  );
};
