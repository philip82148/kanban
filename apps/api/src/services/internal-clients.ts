import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";

import { BoardService } from "@/gen/kanban/model/board_pb";
import { ColumnService } from "@/gen/kanban/model/column_pb";
import { ProjectService } from "@/gen/kanban/model/project_pb";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8000",
  httpVersion: "2",
});

export const projectClient = createClient(ProjectService, transport);
export const columnClient = createClient(ColumnService, transport);
export const boardClient = createClient(BoardService, transport);
