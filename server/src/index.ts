import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { invokeAgent, getAgent } from "./agent";

const app = new Hono();

app.use("/*", cors({ origin: "http://localhost:5173" }));

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Initialize agent eagerly
app.get("/agent/status", async (c) => {
  try {
    const { toolkit } = await getAgent();
    const tools = toolkit.getTools();
    return c.json({
      status: "online",
      tools: tools.length,
      toolNames: tools.map((t: { name: string }) => t.name),
    });
  } catch (err) {
    return c.json(
      { status: "error", message: String(err) },
      500
    );
  }
});

// Chat endpoint
app.post("/agent/chat", async (c) => {
  const body = await c.req.json<{
    message: string;
    threadId: string;
    walletAddress?: string;
  }>();

  if (!body.message?.trim()) {
    return c.json({ error: "message is required" }, 400);
  }

  const threadId = body.threadId || "default";

  try {
    const result = await invokeAgent(body.message, threadId, body.walletAddress);
    return c.json(result);
  } catch (err) {
    console.error("[AGENT ERROR]", err);
    return c.json(
      {
        content: "An error occurred while processing your request.",
        toolCalls: [],
        error: String(err),
      },
      500
    );
  }
});

const port = 3001;
console.log(`[SERVER] Starting on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
