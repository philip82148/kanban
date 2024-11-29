import { DraggableBoard } from "./DraggableBoard";
import { DropArea } from "./DropArea";

import type { KanbanBoard } from ".";

export const Stage: React.FC<{
  name: string;
  boards: KanbanBoard[];
  draggingBoardNo?: number;
  onBoardDragStart(boardNo: number): void;
  onBoardDragEnd(): void;
  onBoardDrop(prevBoardNo?: number): void;
}> = ({ name, boards, draggingBoardNo, onBoardDragStart, onBoardDragEnd, onBoardDrop }) => {
  return (
    <div className="flex flex-col border border-solid border-zinc-300 rounded-md bg-zinc-100 mx-2 w-[300px]">
      <div className="text-lg font-semibold px-2 py-1">{name}</div>
      <div className="flex flex-col flex-grow">
        {boards.map((board, i) => (
          <DropArea
            key={board.uniqueNo}
            disabled={
              draggingBoardNo === board.uniqueNo || draggingBoardNo === boards[i - 1]?.uniqueNo
            }
            onDrop={() => onBoardDrop(boards[i - 1]?.uniqueNo)}
          >
            <DraggableBoard
              content={board.content}
              onDragStart={() => onBoardDragStart(board.uniqueNo)}
              onDragEnd={() => onBoardDragEnd()}
            />
          </DropArea>
        ))}
        <DropArea
          expand
          disabled={draggingBoardNo === boards[boards.length - 1]?.uniqueNo}
          onDrop={() => onBoardDrop(boards[boards.length - 1]?.uniqueNo)}
        />
      </div>
    </div>
  );
};
