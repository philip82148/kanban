import http from "http";

import type { ConnectRouter } from "@connectrpc/connect";
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import express from "express";

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

const app = express();
app.use(expressConnectMiddleware({ routes }));
http.createServer(app).listen(8080);
