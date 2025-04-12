import { useForm } from "react-hook-form";

export const NewBoardForm: React.FC<{
  onConfirm: (data: { title: string }) => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  const { register, handleSubmit } = useForm<{ title: string }>({ defaultValues: { title: "" } });
  return (
    <div className="flex flex-col border border-solid border-zinc-300 bg-white rounded-lg gap-0.5 px-2 py-1.5">
      <div className="flex items-center h-12">
        <input
          {...register("title", { required: true })}
          className="input"
          placeholder="Type Board Title"
        />
      </div>
      <div className="flex justify-between gap-4 mb-1">
        <button className="btn flex-grow basis-0" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-accent flex-grow basis-0" onClick={handleSubmit(onConfirm)}>
          OK
        </button>
      </div>
    </div>
  );
};
