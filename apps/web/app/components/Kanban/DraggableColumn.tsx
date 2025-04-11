import clsx from "clsx";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEllipsisH } from "react-icons/fa";

import { Draggable } from "./Draggable";

import type { ColumnModel } from "@/types/models";

export const DraggableColumn: React.FC<{
  column: ColumnModel;
  onDragStart: () => void;
  onDragEnd: () => void;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteClick: () => void;
}> = ({ column, onDragStart, onDragEnd, onEditConfirm, onDeleteClick }) => {
  return (
    <Draggable
      className="flex flex-col border border-solid border-zinc-300 rounded-md bg-zinc-100 w-80"
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <ColumnHeader column={column} onEditConfirm={onEditConfirm} onDeleteClick={onDeleteClick} />
      <div className="flex flex-col flex-grow"></div>
    </Draggable>
  );
};

const ColumnHeader: React.FC<{
  column: ColumnModel;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteClick: () => void;
}> = ({ column, onEditConfirm, onDeleteClick }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ title: string }>({
    values: { title: column.title },
  });
  const closeEditMode = () => {
    setIsEditMode(false);
    reset();
  };
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-1.5 gap-y-0.5 mx-2">
      {isEditMode ? (
        <input
          {...register("title", { required: true })}
          className={clsx("input font-bold text-xl flex-grow", !isEditMode && "hidden")}
        />
      ) : (
        <div className={clsx("font-bold text-xl px-3", isEditMode && "hidden")}>{column.title}</div>
      )}
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
            <button onClick={() => setIsEditMode(true)}>Edit Title</button>
          </li>
          <li>
            <button onClick={onDeleteClick}>Delete</button>
          </li>
        </ul>
      </div>
      {isEditMode && (
        <div className="flex justify-between gap-4">
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
