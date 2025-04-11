import type { ServiceImpl } from "@connectrpc/connect";

import type { KanbanService } from "@/gen/kanban/kanban_pb";
import { boardClient, columnClient, projectClient } from "@/services/internal-clients";

export const kanbanService: ServiceImpl<typeof KanbanService> = {
  // Project
  async createProject(req) {
    return await projectClient.createProject(req);
  },
  async getProject(req) {
    return await projectClient.getProject(req);
  },
  async listProjects() {
    return await projectClient.listProjects({});
  },
  async updateProject(req) {
    return await projectClient.updateProject(req);
  },
  async deleteProject(req) {
    return await projectClient.deleteProject(req);
  },

  // Column
  async createColumn(req) {
    return await columnClient.createColumn(req);
  },
  async listColumns(req) {
    return await columnClient.listColumns(req);
  },
  async reorderColumn(req) {
    return await columnClient.reorderColumn(req);
  },
  async updateColumn(req) {
    return await columnClient.updateColumn(req);
  },
  async deleteColumn(req) {
    return await columnClient.deleteColumn(req);
  },

  // Board
  async createBoard(req) {
    return await boardClient.createBoard(req);
  },
  async listBoards(req) {
    return await boardClient.listBoards(req);
  },
  async reorderBoard(req) {
    return await boardClient.reorderBoard(req);
  },
  async updateBoard(req) {
    return await boardClient.updateBoard(req);
  },
  async deleteBoard(req) {
    return await boardClient.deleteBoard(req);
  },
};
