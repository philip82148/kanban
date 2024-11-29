import clsx from "clsx";
import { useRef, useState } from "react";

export const DropArea: React.FC<
  React.PropsWithChildren<{ expand?: boolean; disabled: boolean; onDrop(): void }>
> = ({ expand, disabled, onDrop, children }) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const visible = !disabled && isHovering;

  const timeout = useRef<NodeJS.Timeout | null>(null);

  return (
    <div
      className={clsx("flex flex-col px-2 py-2", expand && "flex-grow")}
      onDragEnter={() => {
        if (disabled) return;
        setIsHovering(true);
      }}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        if (timeout.current) clearTimeout(timeout.current);
        timeout.current = setTimeout(() => setIsHovering(false), 200);
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        onDrop();
        setIsHovering(false);
      }}
    >
      <div
        className="h-24 mb-4 rounded-md border border-dashed border-zinc-300 transition-all ease-out duration-75"
        style={{
          height: visible ? undefined : 0,
          borderWidth: visible ? undefined : 0,
          marginBottom: visible ? undefined : 0,
        }}
      />
      {children}
    </div>
  );
};
