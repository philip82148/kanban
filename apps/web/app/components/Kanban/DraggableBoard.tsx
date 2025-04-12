import clsx from "clsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEllipsisH } from "react-icons/fa";

import { Draggable } from "./Draggable";

import type { BoardModel } from "@/types/models";

export const DraggableBoard: React.FC<{
  board: BoardModel;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteClick: () => void;
}> = ({ board, onDragStart, onDragEnd, onEditConfirm, onDeleteClick }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ title: string }>({
    values: { title: board.title },
  });
  const closeEditMode = () => {
    setIsEditMode(false);
    reset();
  };
  return (
    <Draggable
      className={clsx(
        "grid grid-cols-[1fr_auto] items-center border border-solid border-zinc-300 bg-white rounded-lg gap-x-1.5 gap-y-0.5 min-h-14",
        isEditMode ? "px-2 py-1.5" : "px-1.5",
      )}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {isEditMode ? (
        <input
          {...register("title", { required: true })}
          className={clsx("input", !isEditMode && "hidden")}
          placeholder="Type Board Title"
        />
      ) : (
        <div className="text-base font-bold px-1.5">{board.title}</div>
      )}
      <BoardMenu onEditClick={() => setIsEditMode(true)} onDeleteClick={onDeleteClick} />
      {isEditMode && (
        <div className="flex justify-between gap-4 mb-1">
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
    </Draggable>
  );
};

const BoardMenu: React.FC<{ onEditClick: () => void; onDeleteClick: () => void }> = ({
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-square my-1">
        <FaEllipsisH />
      </div>
      <ul
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li>
          <button onClick={onEditClick}>Edit Title</button>
        </li>
        <li>
          <button onClick={onDeleteClick}>Delete</button>
        </li>
      </ul>
    </div>
  );
};
