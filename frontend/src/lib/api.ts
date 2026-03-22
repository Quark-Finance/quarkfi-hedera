const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3001";

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
  threadId: string,
  walletAddress?: string | null
): Promise<AgentChatResponse> {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      threadId,
      ...(walletAddress ? { walletAddress } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Server error (${res.status})`);
  }

  return res.json();
}

export async function getAgentStatus(): Promise<AgentStatus> {
  const res = await fetch(`${API_BASE}/agent/status`);

  if (!res.ok) {
    throw new Error(`Server error (${res.status})`);
  }

  return res.json();
}
