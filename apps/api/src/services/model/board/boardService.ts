import { Code, ConnectError, type ServiceImpl } from "@connectrpc/connect";
import type { Board as BoardRecord } from "@prisma/client";

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
    const board = await prisma.board.create({
      data: { columnId: req.columnId, title: req.title },
    });
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
    const { columnId: oldColumnId } = target;

    // Remove the target and bypass the previous and the next.
    await prisma.board.update({ data: { nextId: null }, where: { id: req.id } });
    await prisma.board.update({
      data: { nextId: target.nextId },
      where: { columnId: oldColumnId, nextId: req.id },
    });

    // Insert the target.
    await prisma.board.update({
      data: { nextId: req.id },
      where: { columnId: req.newColumnId, nextId: req.newNextId },
    });
    await prisma.board.update({
      data: { columnId: req.newColumnId, nextId: req.newNextId },
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
    await prisma.board.delete({ where: { id: req.id } });
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
