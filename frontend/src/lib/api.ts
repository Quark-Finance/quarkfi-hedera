const API_BASE = "http://localhost:3001";

export interface AgentChatResponse {
  content: string;
  toolCalls: {
    name: string;
    humanMessage?: string;
    raw?: unknown;
  }[];
  error?: string;
}

export interface AgentStatus {
  status: "online" | "error";
  tools?: number;
  toolNames?: string[];
  message?: string;
}

export async function sendMessage(
  message: string,
  threadId: string
): Promise<AgentChatResponse> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, threadId }),
  });

  return res.json();
}

export async function getAgentStatus(): Promise<AgentStatus> {
  const res = await fetch(`${API_BASE}/agent/status`);
  return res.json();
}
