import http from "http";

import type { ConnectRouter } from "@connectrpc/connect";
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import express from "express";

import { BoardService } from "~/gen/kanban/v1/board_pb";
import { ColumnService } from "~/gen/kanban/v1/column_pb";
import { ProjectService } from "~/gen/kanban/v1/project_pb";
import { projectService, columnService, boardService } from "~/services";

const routes = (router: ConnectRouter) => {
  return router
    .service(ProjectService, projectService)
    .service(ColumnService, columnService)
    .service(BoardService, boardService);
};

const app = express();
app.use(expressConnectMiddleware({ routes }));
http.createServer(app).listen(8080);
