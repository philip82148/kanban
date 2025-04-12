import type { ActionFunction, MetaFunction } from "@remix-run/node";
import { Link, redirect, useLoaderData, useSubmit } from "@remix-run/react";
import clsx from "clsx";
import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEllipsisH } from "react-icons/fa";

import { DeleteDialog } from "@/components/DeleteDialog";
import { connectClient } from "@/connect/connectClient";
import type {
  CreateProjectRequest,
  DeleteProjectRequest,
  UpdateProjectRequest,
} from "@/gen/kanban/model/project_pb";
import type { ToPureMessage } from "@/types/ToPureMessage";
import type { ProjectModel } from "@/types/models";

export const meta: MetaFunction = () => {
  return [
    { title: "Projects | Kanban Board" },
    { name: "description", content: "This is the list of projects." },
  ];
};

type ActionData = {
  createProject?: ToPureMessage<CreateProjectRequest>;
  updateProject?: ToPureMessage<UpdateProjectRequest>;
  deleteProject?: ToPureMessage<DeleteProjectRequest>;
};

export const action: ActionFunction = async ({ request }) => {
  const data = (await request.json()) as ActionData;
  if (data.createProject) {
    const req = data.createProject;
    const project = await connectClient.createProject(req);
    return redirect(`/${project.id}`);
  } else if (data.updateProject) {
    const req = data.updateProject;
    await connectClient.updateProject(req);
  } else if (data.deleteProject) {
    const req = data.deleteProject;
    await connectClient.deleteProject(req);
  } else {
    throw new Response("Invalid request", { status: 400 });
  }
  return null;
};

export const loader = async () => {
  const { projects } = await connectClient.listProjects({});
  return { projects };
};

export default function Index() {
  const { projects } = useLoaderData<typeof loader>();
  const realSubmit = useSubmit();
  const submit = (data: ActionData) => {
    realSubmit(data, { method: "post", encType: "application/json" });
  };

  // Project Delete
  // Closing the dialog takes a bit of time, so we need to use a separate state
  // for openness of the dialog instead of using !!projectToDelete.
  const [projectToDelete, setProjectToDelete] = useState<ProjectModel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  return (
    <div className="container py-10 mx-auto">
      <div className="flex items-end justify-between mb-4">
        <h1 className="font-bold text-4xl">Projects</h1>
        <NewButton
          onClick={() => {
            submit({
              createProject: {
                title: `New Project${projects.length ? ` (${projects.length + 1})` : ""}`,
              },
            });
          }}
        />
      </div>
      <ul className="list bg-base-100 rounded-box shadow-md">
        {projects.map((project) => (
          <ProjectColumn
            key={project.id}
            project={project}
            onEditConfirm={(data) =>
              submit({ updateProject: { id: project.id, title: data.title } })
            }
            onDeleteClick={() => {
              setIsDialogOpen(true);
              setProjectToDelete(project);
            }}
          />
        ))}
      </ul>
      <DeleteDialog
        message={`Are you sure you want to delete project '${projectToDelete?.title}'?`}
        open={isDialogOpen}
        onConfirm={() => {
          if (!projectToDelete) return;
          submit({ deleteProject: { id: projectToDelete.id } });
          setIsDialogOpen(false);
        }}
        onCancel={() => setIsDialogOpen(false)}
      />
    </div>
  );
}

const NewButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button className="btn" onClick={onClick}>
      New
    </button>
  );
};

const ProjectColumn: React.FC<{
  project: ProjectModel;
  onEditConfirm: (data: { title: string }) => void;
  onDeleteClick: () => void;
}> = ({ project, onEditConfirm, onDeleteClick }) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const { register, handleSubmit, reset } = useForm<{ title: string }>({
    values: { title: project.title },
  });
  const closeEditMode = () => {
    setIsEditMode(false);
    reset();
  };
  return (
    <li className="list-row btn-ghost">
      {isEditMode ? (
        <div className="flex items-center gap-1">
          <input
            {...register("title", { required: true })}
            className={clsx("input text-xl", !isEditMode && "hidden")}
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
        <Link className="flex items-center list-col-grow" to={`/${project.id}`}>
          <div className="font-bold text-2xl">{project.title}</div>
        </Link>
      )}
      <div />
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="btn btn-ghost m-1">
          <FaEllipsisH />
        </div>
        <ul
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          <li>
            <button onClick={() => setIsEditMode(true)}>Edit Title</button>
          </li>
          <li>
            <button onClick={onDeleteClick}>Delete</button>
          </li>
        </ul>
      </div>
    </li>
  );
};
