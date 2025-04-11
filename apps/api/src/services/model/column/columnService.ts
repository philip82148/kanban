import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";
import { Prisma, type Column as ColumnRecord } from "@prisma/client";

import type {
  CreateColumnRequest,
  DeleteColumnRequest,
  ColumnService,
  UpdateColumnRequest,
  ListColumnsRequest,
  ReorderColumnRequest,
} from "@/gen/kanban/model/column_pb";
import { prisma } from "@/prisma";

export const columnService: ServiceImpl<typeof ColumnService> = {
  // Called from KanbanService
  async createColumn(req: CreateColumnRequest) {
    const lastColumn = await prisma.column.findFirst({
      where: { projectId: req.projectId, nextId: null },
    });
    const column = await prisma.column.create({
      data: { projectId: req.projectId, title: req.title },
    });
    if (lastColumn) {
      await prisma.column.update({
        data: { nextId: column.id },
        where: { id: lastColumn.id },
      });
    }
    return toColumnMessage(column);
  },
  async listColumns(req: ListColumnsRequest) {
    const columns = await prisma.column.findMany({ where: { projectId: req.projectId } });
    return { columns: columns.map(toColumnMessage) };
  },
  async reorderColumn(req: ReorderColumnRequest) {
    // Find the target.
    const target = await prisma.column.findUnique({ where: { id: req.id } });
    if (!target) {
      throw new ConnectError("The target column is not found.", Code.NotFound);
    }
    const { projectId, nextId: oldNextId } = target;

    // Remove the target and bypass the previous and the next.
    await prisma.column.update({ data: { nextId: null }, where: { id: req.id } });
    try {
      await prisma.column.update({
        data: { nextId: oldNextId },
        where: { nextId: req.id, projectId },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
        throw e;
      }
    }

    // Insert the target.
    const newNextId = req.newNextId ?? null;
    try {
      await prisma.column.updateMany({
        data: { nextId: req.id },
        where: { nextId: newNextId, projectId, id: { not: req.id } },
      });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025")) {
        throw e;
      }
    }
    await prisma.column.update({ data: { nextId: newNextId }, where: { id: req.id } });
    return {};
  },
  async updateColumn(req: UpdateColumnRequest) {
    const column = await prisma.column.update({
      data: { title: req.title },
      where: { id: req.id },
    });
    return toColumnMessage(column);
  },
  async deleteColumn(req: DeleteColumnRequest) {
    await prisma.column.delete({ where: { id: req.id } });
    return {};
  },

  // Called only internally.
  async deleteColumnsByProject(req) {
    await prisma.column.deleteMany({ where: { projectId: req.projectId } });
    return {};
  },
};

const toColumnMessage = (record: ColumnRecord) => {
  return {
    id: record.id,
    projectId: record.projectId,
    title: record.title,
    nextId: record.nextId ?? undefined,
  };
};
