import clsx from "clsx";
import { useCallback, useRef, useState } from "react";

export type DropAreaProps = React.PropsWithChildren<{
  className: string;
  dashedAreaClassName: string;
  expand?: boolean;
  enabled: boolean;
  onDrop(): void;
}>;

export const DropArea: React.FC<DropAreaProps> = ({
  className,
  dashedAreaClassName,
  enabled,
  onDrop,
  children,
}) => {
  const { isDropping, startDropping, stopDropping } = useIsDropping();
  const showDashedArea = enabled && isDropping;
  return (
    <div
      className={className}
      onDragEnter={() => {
        if (!enabled) return;
        startDropping();
      }}
      onDragOver={(e) => {
        if (!enabled) return;
        e.preventDefault();
        startDropping();
      }}
      onDrop={() => {
        if (!enabled) return;
        onDrop();
        stopDropping();
      }}
    >
      <div className={clsx(showDashedArea && dashedAreaClassName)} />
      {children}
    </div>
  );
};

const useIsDropping = () => {
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const startDropping = useCallback(() => {
    setIsDropping(true);
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(() => setIsDropping(false), 200);
  }, []);
  const stopDropping = useCallback(() => {
    setIsDropping(false);
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, []);
  return { isDropping, startDropping, stopDropping };
};
