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
  onAddBoardConfirm: (data: { columnId: string; title: string }) => void;
  onEditBoardConfirm: (data: { boardId: string; title: string }) => void;
  onBoardDrop: (boardId: string, newColumnId: string, newBoardId: string | undefined) => void;
  onBoardDeleteConfirm: (boardId: string) => void;
}> = ({
  columns: unorderedColumns,
  boards,
  onAddColumnConfirm,
  onEditColumnConfirm,
  onDeleteColumnConfirm,
  onColumnDrop: onColumnDropReal,
  onAddBoardConfirm,
  onEditBoardConfirm,
  onBoardDrop: onBoardDropReal,
  onBoardDeleteConfirm,
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
  const columnIdToBoards = useMemo(() => {
    const columnIdToBoards: Record<string, BoardModel[]> = {};
    for (const board of boards) {
      if (!(board.columnId in columnIdToBoards)) {
        columnIdToBoards[board.columnId] = [];
      }
      columnIdToBoards[board.columnId].push(board);
    }
    return columnIdToBoards;
  }, [boards]);

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

  // For Board Drag&Drop
  const [draggingBoardId, setDraggingBoardId] = useState<string | null>(null);

  // For Column Deletion
  // Closing the dialog takes a bit of time, so we need to use a separate state
  // for openness of the dialog instead of using !!projectToDelete.
  const [boardToDelete, setBoardToDelete] = useState<BoardModel | null>(null);
  const [boardDeleteDialogOpen, setBoardDeleteDialogOpen] = useState<boolean>(false);

  return (
    <div className="flex h-full">
      {columns.map((column, i) => (
        <ColumnDropArea
          key={column.id}
          noLeftMargin={!i}
          enabled={
            !!draggingColumnId &&
            !(draggingColumnId === column.id || draggingColumnId === columns[i - 1]?.id)
          }
          onDrop={() => onColumnDrop(column.id)}
        >
          <DraggableColumn
            column={column}
            boards={columnIdToBoards[column.id] ?? []}
            onEditConfirm={(data) => onEditColumnConfirm({ columnId: column.id, ...data })}
            onDeleteClick={() => {
              setColumnToDelete(column);
              setColumnDeleteDialogOpen(true);
            }}
            onDragStart={() => setDraggingColumnId(column.id)}
            onDragEnd={() => setDraggingColumnId(null)}
            draggingBoardId={draggingBoardId}
            onBoardDragStart={(boardId) => setDraggingBoardId(boardId)}
            onBoardDragEnd={() => setDraggingBoardId(null)}
            onBoardDrop={(newNextBoardId) => {
              if (!draggingBoardId) return;
              onBoardDropReal(draggingBoardId, column.id, newNextBoardId);
            }}
            onAddBoardConfirm={(data) => onAddBoardConfirm({ columnId: column.id, ...data })}
            onEditBoardConfirm={onEditBoardConfirm}
            onBoardDeleteClick={(board) => {
              setBoardToDelete(board);
              setBoardDeleteDialogOpen(true);
            }}
          />
        </ColumnDropArea>
      ))}
      <ColumnDropArea
        noLeftMargin={!columns.length}
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
      <DeleteDialog
        message={`Are you sure you want to delete board '${boardToDelete?.title}'?`}
        open={boardDeleteDialogOpen}
        onConfirm={() => {
          if (!boardToDelete) return;
          onBoardDeleteConfirm(boardToDelete.id);
          setBoardDeleteDialogOpen(false);
        }}
        onCancel={() => setBoardDeleteDialogOpen(false)}
      />
    </div>
  );
};

const ColumnDropArea: React.FC<
  Omit<DropAreaProps, "className" | "dashedAreaClassName"> & { noLeftMargin?: boolean }
> = ({ noLeftMargin, ...props }) => {
  return (
    <DropArea
      className={clsx("flex h-full", !noLeftMargin && "pl-4")}
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
