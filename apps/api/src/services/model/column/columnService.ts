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
import { boardClient } from "@/services/internal-clients";

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
    await ignoreNotFoundError(async () => {
      await prisma.column.update({
        data: { nextId: oldNextId },
        where: { nextId: req.id, projectId },
      });
    });

    // Insert the target.
    const newNextId = req.newNextId ?? null;
    await ignoreNotFoundError(async () => {
      // This actually updates one record.
      await prisma.column.updateMany({
        data: { nextId: req.id },
        where: { nextId: newNextId, projectId, id: { not: req.id } },
      });
    });
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
    await boardClient.deleteBoardsByColumn({ columnId: req.id });
    const prev = await ignoreNotFoundError(async () => {
      return await prisma.column.update({
        data: { nextId: null },
        where: { nextId: req.id },
      });
    });
    const target = await prisma.column.delete({ where: { id: req.id } });
    if (prev && target.nextId) {
      await prisma.column.update({ data: { nextId: target.nextId }, where: { id: prev.id } });
    }
    return {};
  },

  // Called only internally.
  async deleteColumnsByProject(req) {
    await boardClient.deleteBoardsByProject({ projectId: req.projectId });
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

const ignoreNotFoundError = async <T>(func: () => Promise<T>): Promise<T | undefined> => {
  try {
    return await func();
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return undefined;
    throw e;
  }
};
