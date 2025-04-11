import http2 from "node:http2";

import type { ConnectRouter } from "@connectrpc/connect";
import { connectNodeAdapter } from "@connectrpc/connect-node";

import { KanbanService } from "@/gen/kanban/kanban_pb";
import { BoardService } from "@/gen/kanban/model/board_pb";
import { ColumnService } from "@/gen/kanban/model/column_pb";
import { ProjectService } from "@/gen/kanban/model/project_pb";
import { projectService, columnService, boardService, kanbanService } from "@/services";

const routes = (router: ConnectRouter) => {
  return router
    .service(ProjectService, projectService)
    .service(ColumnService, columnService)
    .service(BoardService, boardService)
    .service(KanbanService, kanbanService);
};

http2.createServer(connectNodeAdapter({ routes })).listen(8000);
