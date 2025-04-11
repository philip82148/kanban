import { useForm } from "react-hook-form";

export const NewColumnForm: React.FC<{
  onConfirm: (data: { title: string }) => void;
  onCancel: () => void;
}> = ({ onConfirm, onCancel }) => {
  const { register, handleSubmit } = useForm<{ title: string }>({ defaultValues: { title: "" } });
  return (
    <div className="flex flex-col justify-between bg-neutral-content w-80 py-2 px-2 mr-4">
      <input
        {...register("title", { required: true })}
        className="input"
        placeholder="Type Column Title"
      />
      <div className="flex justify-between gap-4">
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
