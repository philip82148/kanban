import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";
import { Prisma, type Board as BoardRecord } from "@prisma/client";

import type {
  CreateBoardRequest,
  DeleteBoardRequest,
  BoardService,
  UpdateBoardRequest,
  ListBoardsRequest,
  ReorderBoardRequest,
} from "@/gen/kanban/model/board_pb";
import { prisma } from "@/prisma";

export const boardService: ServiceImpl<typeof BoardService> = {
  // Called from KanbanService
  async createBoard(req: CreateBoardRequest) {
    const lastBoard = await prisma.board.findFirst({
      where: { columnId: req.columnId, nextId: null },
    });
    const board = await prisma.board.create({
      data: { columnId: req.columnId, title: req.title },
    });
    if (lastBoard) {
      await prisma.board.update({
        data: { nextId: board.id },
        where: { id: lastBoard.id },
      });
    }
    return toBoardMessage(board);
  },
  async listBoards(req: ListBoardsRequest) {
    const boards = await prisma.board.findMany({ where: { column: { projectId: req.projectId } } });
    return { boards: boards.map(toBoardMessage) };
  },
  async reorderBoard(req: ReorderBoardRequest) {
    // Find the target.
    const target = await prisma.board.findUnique({ where: { id: req.id } });
    if (!target) {
      throw new ConnectError("The target board is not found.", Code.NotFound);
    }
    const { columnId: oldColumnId, nextId: oldNextId } = target;

    // Remove the target and bypass the previous and the next.
    await prisma.board.update({ data: { nextId: null }, where: { id: req.id } });
    await ignoreNotFoundError(async () => {
      await prisma.board.update({
        data: { nextId: oldNextId },
        where: { columnId: oldColumnId, nextId: req.id },
      });
    });

    // Insert the target.
    const newNextId = req.newNextId ?? null;
    await ignoreNotFoundError(async () => {
      // This actually updates one record.
      await prisma.board.updateMany({
        data: { nextId: req.id },
        where: { columnId: req.newColumnId, nextId: newNextId, id: { not: req.id } },
      });
    });
    await prisma.board.update({
      data: { columnId: req.newColumnId, nextId: newNextId },
      where: { id: req.id },
    });
    return {};
  },
  async updateBoard(req: UpdateBoardRequest) {
    const board = await prisma.board.update({
      data: { title: req.title },
      where: { id: req.id },
    });
    return toBoardMessage(board);
  },
  async deleteBoard(req: DeleteBoardRequest) {
    const prev = await ignoreNotFoundError(async () => {
      return await prisma.board.update({
        data: { nextId: null },
        where: { nextId: req.id },
      });
    });
    const target = await prisma.board.delete({ where: { id: req.id } });
    if (prev && target.nextId) {
      await prisma.board.update({ data: { nextId: target.nextId }, where: { id: prev.id } });
    }
    return {};
  },

  // Called only internally.
  async deleteBoardsByProject(req) {
    await prisma.board.deleteMany({ where: { column: { projectId: req.projectId } } });
    return {};
  },
  async deleteBoardsByColumn(req) {
    await prisma.board.deleteMany({ where: { columnId: req.columnId } });
    return {};
  },
};

const toBoardMessage = (record: BoardRecord) => {
  return {
    id: record.id,
    columnId: record.columnId,
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
