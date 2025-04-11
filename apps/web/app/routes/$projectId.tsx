import type { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/react";
import { useLoaderData, useSubmit } from "@remix-run/react";

import { Kanban } from "@/components/Kanban";
import { connectClient } from "@/connect/connectClient";
import type {
  CreateColumnRequest,
  DeleteColumnRequest,
  ReorderColumnRequest,
  UpdateColumnRequest,
} from "@/gen/kanban/model/column_pb";
import type { ToPureMessage } from "@/types/ToPureMessage";

export const meta: MetaFunction = () => {
  return [
    { title: "Projects | Kanban Board" },
    { name: "description", content: "This is the list of projects." },
  ];
};

type ActionData = {
  createColumn?: ToPureMessage<CreateColumnRequest>;
  updateColumn?: ToPureMessage<UpdateColumnRequest>;
  deleteColumn?: ToPureMessage<DeleteColumnRequest>;
  reorderColumn?: ToPureMessage<ReorderColumnRequest>;
};

export const action: ActionFunction = async ({ request }) => {
  const data = (await request.json()) as ActionData;
  if (data.createColumn) {
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
      <h1 className="text-3xl font-bold">{project.title}</h1>
      <div className="flex-grow mt-4">
        <Kanban
          columns={columns}
          boards={boards}
          onAddColumnConfirm={(data) =>
            submit({ createColumn: { projectId: project.id, title: data.title } })
          }
          onEditColumnConfirm={(data) =>
            submit({ updateColumn: { id: data.columnId, title: data.title } })
          }
          onDeleteColumnConfirm={(columnId) => submit({ deleteColumn: { id: columnId } })}
          onColumnDrop={(columnId, newNextId) =>
            submit({ reorderColumn: { id: columnId, newNextId } })
          }
        />
      </div>
    </div>
  );
}
