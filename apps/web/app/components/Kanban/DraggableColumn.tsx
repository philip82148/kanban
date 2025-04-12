import clsx from "clsx";
import type React from "react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { FaEllipsisH, FaPlus } from "react-icons/fa";

import { Draggable } from "./Draggable";
import { DraggableBoard } from "./DraggableBoard";
import { DropArea, type DropAreaProps } from "./DropArea";
import { NewBoardForm } from "./NewBoardForm";

import type { BoardModel, ColumnModel } from "@/types/models";

export const DraggableColumn: React.FC<{
  column: ColumnModel;
  boards: BoardModel[];
  onDragStart: () => void;
  onDragEnd: () => void;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteClick: () => void;
  draggingBoardId: string | null;
  onBoardDrop: (newNextBoardId: string | undefined) => void;
  onBoardDragStart: (boardId: string) => void;
  onBoardDragEnd: () => void;
  onBoardAddConfirm: (data: { title: string }) => void;
  onBoardEditConfirm: (boardId: string, data: { title: string }) => void;
  onBoardDeleteClick: (board: BoardModel) => void;
}> = ({
  column,
  boards: unorderedBoards,
  onDragStart,
  onDragEnd,
  onEditConfirm,
  onDeleteClick,
  draggingBoardId,
  onBoardDragStart,
  onBoardDragEnd,
  onBoardDrop,
  onBoardAddConfirm,
  onBoardEditConfirm,
  onBoardDeleteClick,
}) => {
  const boards = useMemo(() => {
    let board = unorderedBoards.find((b) => b.nextId === undefined);
    const orderedBoards = [];
    while (board) {
      orderedBoards.unshift(board);
      board = unorderedBoards.find((b) => b.nextId === board?.id);
    }
    return orderedBoards;
  }, [unorderedBoards]);

  // For Board Creation
  const [newBoardFormOpen, setNewBoardFormOpen] = useState<boolean>(false);
  return (
    <Draggable
      className="flex flex-col border border-solid border-zinc-300 rounded-md bg-zinc-100 w-80"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <ColumnHeader
        column={column}
        onEditConfirm={onEditConfirm}
        onDeleteClick={onDeleteClick}
        onAddBoardClick={() => setNewBoardFormOpen(true)}
      />
      <div className="flex flex-col flex-grow">
        {boards.map((board, i) => (
          <BoardDropArea
            key={board.id}
            enabled={
              !!draggingBoardId &&
              !(draggingBoardId === board.id || draggingBoardId === boards[i - 1]?.id)
            }
            onDrop={() => onBoardDrop(board.id)}
          >
            <DraggableBoard
              board={board}
              onDragStart={() => onBoardDragStart(board.id)}
              onDragEnd={onBoardDragEnd}
              onDeleteClick={() => onBoardDeleteClick(board)}
              onEditConfirm={(data) => onBoardEditConfirm(board.id, data)}
            />
          </BoardDropArea>
        ))}
        <BoardDropArea
          enabled={!!draggingBoardId && draggingBoardId !== boards.at(-1)?.id}
          onDrop={() => onBoardDrop(undefined)}
          expand
        >
          {newBoardFormOpen && (
            <NewBoardForm
              onConfirm={(data) => {
                onBoardAddConfirm(data);
                setNewBoardFormOpen(false);
              }}
              onCancel={() => setNewBoardFormOpen(false)}
            />
          )}
        </BoardDropArea>
      </div>
    </Draggable>
  );
};

const BoardDropArea: React.FC<
  Omit<DropAreaProps, "className" | "dashedAreaClassName"> & { expand?: boolean }
> = ({ expand, ...props }) => {
  return (
    <DropArea
      className={clsx("px-2 pb-2", expand && "flex-grow")}
      dashedAreaClassName="border border-dashed border-zinc-300 h-14 mb-2"
      {...props}
    />
  );
};

const ColumnHeader: React.FC<{
  column: ColumnModel;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteClick: () => void;
  onAddBoardClick: () => void;
}> = ({ column, onEditConfirm, onDeleteClick, onAddBoardClick }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ title: string }>({
    values: { title: column.title },
  });
  const closeEditMode = () => {
    setIsEditMode(false);
    reset();
  };
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-1.5 gap-y-0.5 mx-2 py-1">
      {isEditMode ? (
        <input
          {...register("title", { required: true })}
          className={clsx("input text-xl flex-grow", !isEditMode && "hidden")}
          placeholder="Type Column Title"
        />
      ) : (
        <div className={clsx("font-bold text-xl px-3", isEditMode && "hidden")}>{column.title}</div>
      )}
      <div className="flex items-center gap-1">
        <button className="btn btn-ghost btn-square" onClick={onAddBoardClick}>
          <FaPlus />
        </button>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-square">
            <FaEllipsisH />
          </div>
          <ul
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={0}
            className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
          >
            <li>
              <button onClick={() => setIsEditMode(true)}>Edit Title</button>
            </li>
            <li>
              <button onClick={onDeleteClick}>Delete</button>
            </li>
          </ul>
        </div>
      </div>
      {isEditMode && (
        <div className="flex justify-between gap-4 py-1">
          <button className="btn flex-grow basis-0" onClick={closeEditMode}>
            Cancel
          </button>
          <button
            className="btn btn-accent flex-grow basis-0"
            onClick={handleSubmit((data) => {
              onEditConfirm(data);
              closeEditMode();
            })}
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};
