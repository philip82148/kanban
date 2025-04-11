import clsx from "clsx";
import { useMemo, useState } from "react";

import { DeleteDialog } from "../DeleteDialog";

import { DraggableColumn } from "./DraggableColumn";
import type { DropAreaProps } from "./DropArea";
import { DropArea } from "./DropArea";
import { NewColumnForm } from "./NewColumnForm";

import type { BoardModel, ColumnModel } from "@/types/models";

export const Kanban: React.FC<{
  columns: ColumnModel[];
  boards: BoardModel[];
  onAddColumnConfirm: (data: { title: string }) => void;
  onEditColumnConfirm: (data: { columnId: string; title: string }) => void;
  onDeleteColumnConfirm: (columnId: string) => void;
  onColumnDrop: (columnId: string, newColumnId: string | undefined) => void;
}> = ({
  columns: unorderedColumns,
  onAddColumnConfirm,
  onEditColumnConfirm,
  onDeleteColumnConfirm,
  onColumnDrop: onColumnDropReal,
}) => {
  const columns = useMemo(() => {
    let column = unorderedColumns.find((c) => c.nextId === undefined);
    const orderedColumns = [];
    while (column) {
      orderedColumns.unshift(column);
      column = unorderedColumns.find((c) => c.nextId === column?.id);
    }
    return orderedColumns;
  }, [unorderedColumns]);

  // For Column Creation
  const [newColumnFormOpen, setNewColumnFormOpen] = useState<boolean>(false);

  // For Column Deletion
  // Closing the dialog takes a bit of time, so we need to use a separate state
  // for openness of the dialog instead of using !!projectToDelete.
  const [columnToDelete, setColumnToDelete] = useState<ColumnModel | null>(null);
  const [columnDeleteDialogOpen, setColumnDeleteDialogOpen] = useState<boolean>(false);

  // For Column Drag&Drop
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const onColumnDrop = (newNextId: string | undefined) => {
    if (!draggingColumnId) return;
    onColumnDropReal(draggingColumnId, newNextId);
  };

  return (
    <div className="flex h-full">
      {columns.map((column, i) => (
        <ColumnDropArea
          key={column.id}
          isFirst={!i}
          enabled={
            !!draggingColumnId &&
            !(draggingColumnId === column.id || draggingColumnId === columns[i - 1]?.id)
          }
          onDrop={() => onColumnDrop(column.id)}
        >
          <DraggableColumn
            column={column}
            onEditConfirm={(data) => onEditColumnConfirm({ columnId: column.id, ...data })}
            onDeleteClick={() => {
              setColumnToDelete(column);
              setColumnDeleteDialogOpen(true);
            }}
            onDragStart={() => setDraggingColumnId(column.id)}
            onDragEnd={() => setDraggingColumnId(null)}
          />
        </ColumnDropArea>
      ))}
      <ColumnDropArea
        isFirst={!columns.length}
        enabled={!!draggingColumnId && draggingColumnId !== columns.at(-1)?.id}
        onDrop={() => onColumnDrop(undefined)}
      >
        {newColumnFormOpen && (
          <NewColumnForm
            onConfirm={(data) => {
              onAddColumnConfirm(data);
              setNewColumnFormOpen(false);
            }}
            onCancel={() => setNewColumnFormOpen(false)}
          />
        )}
        <AddColumnButton onClick={() => setNewColumnFormOpen(true)} />
      </ColumnDropArea>
      <DeleteDialog
        message={`Are you sure you want to delete column '${columnToDelete?.title}' and its boards?`}
        open={columnDeleteDialogOpen}
        onConfirm={() => {
          if (!columnToDelete) return;
          onDeleteColumnConfirm(columnToDelete.id);
          setColumnDeleteDialogOpen(false);
        }}
        onCancel={() => setColumnDeleteDialogOpen(false)}
      />
    </div>
  );
};

const ColumnDropArea: React.FC<
  Omit<DropAreaProps, "className" | "dashedAreaClassName"> & { isFirst?: boolean }
> = ({ isFirst, ...props }) => {
  return (
    <DropArea
      className={clsx("flex h-full", !isFirst && "pl-4")}
      dashedAreaClassName="border border-dashed border-zinc-300 rounded-md w-80 mr-4"
      {...props}
    />
  );
};

const AddColumnButton: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <button className="btn" onClick={onClick}>
      Add Column
    </button>
  );
};
