import http from "http";

import type { ConnectRouter } from "@connectrpc/connect";
import { expressConnectMiddleware } from "@connectrpc/connect-express";
import express from "express";

import { ProjectService } from "~/gen/kanban/v1/project_pb";
import { projectService } from "~/services/project/projectService";

const routes = (router: ConnectRouter) => {
  return router.service(ProjectService, projectService);
};

const app = express();
app.use(expressConnectMiddleware({ routes }));
http.createServer(app).listen(8080);
