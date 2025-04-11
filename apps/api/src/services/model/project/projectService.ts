import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";

import type {
  CreateProjectRequest,
  DeleteProjectRequest,
  GetProjectRequest,
  ProjectService,
  UpdateProjectRequest,
} from "@/gen/kanban/model/project_pb";
import { prisma } from "@/prisma";

export const projectService: ServiceImpl<typeof ProjectService> = {
  // Called from KanbanService
  async createProject(req: CreateProjectRequest) {
    const project = await prisma.project.create({ data: { title: req.title } });
    return project;
  },
  async getProject(req: GetProjectRequest) {
    const project = await prisma.project.findUnique({ where: { id: req.id } });
    if (!project) {
      throw new ConnectError("Project not found", Code.NotFound);
    }
    return project;
  },
  async listProjects() {
    const projects = await prisma.project.findMany();
    return { projects };
  },
  async updateProject(req: UpdateProjectRequest) {
    const project = await prisma.project.update({
      data: { title: req.title },
      where: { id: req.id },
    });
    return project;
  },
  async deleteProject(req: DeleteProjectRequest) {
    await prisma.project.delete({ where: { id: req.id } });
    return {};
  },
};
