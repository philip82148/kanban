import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { redirect, useLoaderData, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEllipsisH } from "react-icons/fa";

import { DeleteDialog } from "@/components/DeleteDialog";
import { Kanban } from "@/components/Kanban";
import { connectClient } from "@/connect/connectClient";
import type {
  CreateBoardRequest,
  DeleteBoardRequest,
  ReorderBoardRequest,
  UpdateBoardRequest,
} from "@/gen/kanban/model/board_pb";
import type {
  CreateColumnRequest,
  DeleteColumnRequest,
  ReorderColumnRequest,
  UpdateColumnRequest,
} from "@/gen/kanban/model/column_pb";
import type { DeleteProjectRequest, UpdateProjectRequest } from "@/gen/kanban/model/project_pb";
import type { ToPureMessage } from "@/types/ToPureMessage";
import type { ProjectModel } from "@/types/models";

export const meta: MetaFunction = () => {
  return [
    { title: "Projects | Kanban Board" },
    { name: "description", content: "This is the list of projects." },
  ];
};

type ActionData = {
  updateProject?: ToPureMessage<UpdateProjectRequest>;
  deleteProject?: ToPureMessage<DeleteProjectRequest>;
  createColumn?: ToPureMessage<CreateColumnRequest>;
  updateColumn?: ToPureMessage<UpdateColumnRequest>;
  deleteColumn?: ToPureMessage<DeleteColumnRequest>;
  reorderColumn?: ToPureMessage<ReorderColumnRequest>;
  createBoard?: ToPureMessage<CreateBoardRequest>;
  updateBoard?: ToPureMessage<UpdateBoardRequest>;
  deleteBoard?: ToPureMessage<DeleteBoardRequest>;
  reorderBoard?: ToPureMessage<ReorderBoardRequest>;
};

export const action: ActionFunction = async ({ request }) => {
  const data = (await request.json()) as ActionData;
  if (data.updateProject) {
    const req = data.updateProject;
    await connectClient.updateProject(req);
  } else if (data.deleteProject) {
    const req = data.deleteProject;
    await connectClient.deleteProject(req);
    return redirect("/");
  } else if (data.createColumn) {
    const req = data.createColumn;
    await connectClient.createColumn(req);
  } else if (data.updateColumn) {
    const req = data.updateColumn;
    await connectClient.updateColumn(req);
  } else if (data.deleteColumn) {
    const req = data.deleteColumn;
    await connectClient.deleteColumn(req);
  } else if (data.reorderColumn) {
    const req = data.reorderColumn;
    await connectClient.reorderColumn(req);
  } else if (data.createBoard) {
    const req = data.createBoard;
    await connectClient.createBoard(req);
  } else if (data.updateBoard) {
    const req = data.updateBoard;
    await connectClient.updateBoard(req);
  } else if (data.deleteBoard) {
    const req = data.deleteBoard;
    await connectClient.deleteBoard(req);
  } else if (data.reorderBoard) {
    const req = data.reorderBoard;
    await connectClient.reorderBoard(req);
  } else {
    throw new Response("Invalid request", { status: 400 });
  }
  return null;
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { projectId } = params;
  const [project, { columns }, { boards }] = await Promise.all([
    connectClient.getProject({ id: projectId }),
    connectClient.listColumns({ projectId }),
    connectClient.listBoards({ projectId }),
  ]);
  return { project, columns, boards };
};

export default function Project() {
  const { project, columns, boards } = useLoaderData<typeof loader>();
  const realSubmit = useSubmit();
  const submit = (data: ActionData) => {
    realSubmit(data, { method: "post", encType: "application/json" });
  };
  return (
    <div className="px-20 py-10 h-screen w-screen flex flex-col">
      <ProjectHeader
        project={project}
        onEditConfirm={(data) => submit({ updateProject: { id: project.id, title: data.title } })}
        onDeleteConfirm={() => submit({ deleteProject: { id: project.id } })}
      />
      <div className="flex-grow mt-4">
        <Kanban
          columns={columns}
          boards={boards}
          onColumnAddConfirm={(data) =>
            submit({ createColumn: { projectId: project.id, title: data.title } })
          }
          onColumnEditConfirm={(columnId, data) =>
            submit({ updateColumn: { id: columnId, title: data.title } })
          }
          onColumnDeleteConfirm={(columnId) => submit({ deleteColumn: { id: columnId } })}
          onColumnDrop={(columnId, newNextId) =>
            submit({ reorderColumn: { id: columnId, newNextId } })
          }
          onBoardAddConfirm={(columnId, data) => {
            submit({ createBoard: { columnId, title: data.title } });
          }}
          onBoardEditConfirm={(boardId, data) => {
            submit({ updateBoard: { id: boardId, title: data.title } });
          }}
          onBoardDeleteConfirm={(boardId) => submit({ deleteBoard: { id: boardId } })}
          onBoardDrop={(boardId, newColumnId, newNextBoardId) => {
            submit({ reorderBoard: { id: boardId, newColumnId, newNextId: newNextBoardId } });
          }}
        />
      </div>
    </div>
  );
}

const ProjectHeader: React.FC<{
  project: ProjectModel;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteConfirm: () => void;
}> = ({ project, onEditConfirm, onDeleteConfirm }) => {
  // For Project Edit
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ title: string }>({
    values: { title: project.title },
  });
  const closeEditMode = () => {
    setIsEditMode(false);
    reset();
  };

  // For Project Deletion
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

  return (
    <div className="flex items-center gap-6">
      {isEditMode ? (
        <div className="flex items-center gap-1 flex-grow">
          <input
            {...register("title", { required: true })}
            className={clsx("input text-xl flex-grow", !isEditMode && "hidden")}
            placeholder="Type Column Title"
          />
          <button
            className="btn btn-accent"
            onClick={handleSubmit((data) => {
              onEditConfirm(data);
              closeEditMode();
            })}
          >
            OK
          </button>
          <button className="btn" onClick={closeEditMode}>
            Cancel
          </button>
        </div>
      ) : (
        <h1 className="text-3xl font-bold flex-grow">{project.title}</h1>
      )}
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-square">
          <FaEllipsisH />
        </div>
        <ul
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li>
            <button onClick={() => setIsEditMode(true)}>Edit Project Title</button>
          </li>
          <li>
            <button onClick={() => setDeleteDialogOpen(true)}>Delete Project</button>
          </li>
        </ul>
      </div>
      <DeleteDialog
        message={`Are you sure you want to delete project '${project.title}'?`}
        open={deleteDialogOpen}
        onConfirm={() => {
          onDeleteConfirm();
          setDeleteDialogOpen(false);
        }}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
};
