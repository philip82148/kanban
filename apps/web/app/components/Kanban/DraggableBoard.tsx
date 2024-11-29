import { useState } from "react";

export const DraggableBoard: React.FC<{
  content: string;
  onDragStart(): void;
  onDragEnd(): void;
}> = ({ content, onDragStart, onDragEnd }) => {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      draggable
      className="border border-solid border-zinc-300 rounded-lg h-24 p-4 cursor-move"
      style={{ opacity: isDragging ? 0.5 : undefined }}
      onDragStart={() => {
        onDragStart();
        setIsDragging(true);
      }}
      onDragEnd={() => {
        onDragEnd();
        setIsDragging(false);
      }}
    >
      <div className="text-base font-bold">{content}</div>
    </div>
  );
};
