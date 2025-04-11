import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";

import { KanbanService } from "@/gen/kanban/kanban_pb";

const transport = createConnectTransport({
  baseUrl: "http://localhost:8000",
  httpVersion: "2",
});

export const connectClient = createClient(KanbanService, transport);
