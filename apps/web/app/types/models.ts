import type { ToPureMessage } from "./ToPureMessage";

import type { Board } from "@/gen/kanban/model/board_pb";
import type { Column } from "@/gen/kanban/model/column_pb";
import type { Project } from "@/gen/kanban/model/project_pb";

export type ProjectModel = ToPureMessage<Project>;
export type ColumnModel = ToPureMessage<Column>;
export type BoardModel = ToPureMessage<Board>;
