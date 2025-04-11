import clsx from "clsx";
import { useEffect, useRef } from "react";

export const DeleteDialog: React.FC<{
  message: string;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, message, onConfirm, onCancel }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [open]);
  return (
    <dialog ref={dialogRef} className={clsx("modal")}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{message}</h3>
        <div className="modal-action">
          <button className="btn flex-grow basis-0" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn flex-grow basis-0" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
};
