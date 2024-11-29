import type { MetaFunction } from "@remix-run/node";
import { useRef, useState } from "react";

import { Kanban, type KanbanStage } from "~/components/Kanban";

export const meta: MetaFunction = () => {
  return [{ title: "New Remix App" }, { name: "description", content: "Welcome to Remix!" }];
};

type DiffType = {
  addBoard?: { stageNo: number };
  reorder?: { boardNo: number; newStageNo: number; newPrevBoardNo?: number };
};

export default function Index() {
  const [stages, setStages] = useState<KanbanStage[]>(initialStages);
  const lastBoardNo = useRef<number>(3);

  const applyDiff = (diff: DiffType) => {
    setStages((oldStages) => {
      const newStages = structuredClone(oldStages);
      if (diff.addBoard) {
        const { stageNo } = diff.addBoard;
        const stage = newStages.find((s) => s.uniqueNo === stageNo);
        if (!stage) throw new Error("Stage not found");
        stage.boards.push({
          uniqueNo: ++lastBoardNo.current,
          content: `Task ${lastBoardNo.current}`,
        });
      } else if (diff.reorder) {
        const { boardNo, newStageNo, newPrevBoardNo } = diff.reorder;
        const stage = newStages.find((s) => s.boards.some((b) => b.uniqueNo === boardNo));
        const board = stage?.boards.find((b) => b.uniqueNo === boardNo);
        if (!(stage && board)) throw new Error("Board not found");
        stage.boards = stage.boards.filter((b) => b.uniqueNo !== boardNo);
        const newStage = newStages.find((s) => s.uniqueNo === newStageNo);
        if (!newStage) throw new Error("Stage not found");
        const index = newStage.boards.findIndex((b) => b.uniqueNo === newPrevBoardNo);
        newStage.boards.splice(index + 1, 0, board);
      }
      return newStages;
    });
  };

  const addBoard = (stageNo: number) => {
    applyDiff({ addBoard: { stageNo } });
  };

  const reorderBoard = (boardNo: number, newStageNo: number, newPrevBoardNo?: number) => {
    applyDiff({ reorder: { boardNo, newStageNo, newPrevBoardNo } });
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <Kanban stages={stages} onAddBoardClick={addBoard} onBoardDrop={reorderBoard} />
    </div>
  );
}

const initialStages: KanbanStage[] = [
  {
    uniqueNo: 1,
    name: "Backlog",
    boards: [
      { uniqueNo: 1, content: "Task 1" },
      { uniqueNo: 2, content: "Task 2" },
    ],
  },
  { uniqueNo: 2, name: "In Progress", boards: [{ uniqueNo: 3, content: "Task 3" }] },
  { uniqueNo: 3, name: "Done", boards: [] },
];
