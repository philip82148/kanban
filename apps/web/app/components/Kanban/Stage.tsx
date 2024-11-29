import { BiPlus } from "react-icons/bi";

import { DraggableBoard } from "./DraggableBoard";
import { DropArea } from "./DropArea";

import type { KanbanBoard } from ".";

export const Stage: React.FC<{
  name: string;
  boards: KanbanBoard[];
  draggingBoardNo?: number;
  onAddBoardClick(): void;
  onBoardDragStart(boardNo: number): void;
  onBoardDragEnd(): void;
  onBoardDrop(prevBoardNo?: number): void;
}> = ({
  name,
  boards,
  draggingBoardNo,
  onAddBoardClick,
  onBoardDragStart,
  onBoardDragEnd,
  onBoardDrop,
}) => {
  return (
    <div className="flex flex-col border border-solid border-zinc-300 rounded-md bg-zinc-100 mx-2 w-[300px]">
      <div className="flex justify-between items-center">
        <div className="text-lg font-semibold pl-3">{name}</div>
        <button className="btn" onClick={onAddBoardClick}>
          <BiPlus />
        </button>
      </div>
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
