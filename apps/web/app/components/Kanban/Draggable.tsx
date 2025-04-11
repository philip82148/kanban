import clsx from "clsx";
import type React from "react";
import { useState } from "react";

export const Draggable: React.FC<
  React.PropsWithChildren<{
    className: string;
    onDragStart: () => void;
    onDragEnd: () => void;
  }>
> = ({ className, onDragStart, onDragEnd, children }) => {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <div
      draggable
      className={clsx(className, isDragging && "opacity-50")}
      onDragStart={() => {
        onDragStart();
        setIsDragging(true);
      }}
      onDragEnd={() => {
        onDragEnd();
        setIsDragging(false);
      }}
    >
      {children}
    </div>
  );
};
