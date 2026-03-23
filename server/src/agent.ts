import { Client, PrivateKey } from "@hashgraph/sdk";
import {
  HederaLangchainToolkit,
  AgentMode,
  ResponseParserService,
} from "hedera-agent-kit";
import { createAgent } from "langchain";
import { MemorySaver } from "@langchain/langgraph";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";

const SYSTEM_PROMPT = `You are Quark AI, an institutional-grade DeFi assistant powered by the Hedera network.

You have access to Hedera blockchain tools that allow you to:
- Query account balances and token holdings
- Transfer HBAR and HTS tokens
- Create and manage fungible and non-fungible tokens
- Interact with Hedera Consensus Service (topics and messages)
- Deploy and interact with smart contracts
- Query exchange rates and transaction records

Important context:
- The server operator account is used to execute transactions on the Hedera network.
- Users connect their own wallets via the frontend. When a user provides their wallet address, use it for balance queries and as the relevant account context.
- If a user asks about "my balance" or "my account" and a wallet address was provided, query THAT address — not the operator account.

Guidelines:
- Always confirm transaction details before executing transfers or state-changing operations.
- Format monetary values clearly with token symbols and USD equivalents when possible.
- When reporting balances, include all relevant token holdings.
- For errors, explain what went wrong and suggest corrective actions.
- Be concise and precise — this is an institutional platform.
- When asked about vault operations, explain that vault smart contract interactions are coming soon.`;

let agent: Awaited<ReturnType<typeof createAgent>> | null = null;
let toolkit: HederaLangchainToolkit | null = null;
let responseParser: ResponseParserService | null = null;

export async function getAgent() {
  if (agent) return { agent, toolkit: toolkit!, responseParser: responseParser! };

  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!accountId || !privateKey) {
    throw new Error("ACCOUNT_ID and PRIVATE_KEY environment variables are required");
  }
  if (!anthropicApiKey && !openaiApiKey) {
    throw new Error("Either ANTHROPIC_API_KEY or OPENAI_API_KEY must be set");
  }

  const client = Client.forTestnet().setOperator(
    accountId,
    PrivateKey.fromStringDer(privateKey)
  );

  toolkit = new HederaLangchainToolkit({
    client,
    configuration: {
      tools: [],
      plugins: [],
      context: {
        mode: AgentMode.AUTONOMOUS,
      },
    },
  });

  const llm = openaiApiKey
    ? new ChatOpenAI({
        model: "gpt-4o",
        apiKey: openaiApiKey,
      })
    : new ChatAnthropic({
        model: "claude-sonnet-4-5-20250929",
        apiKey: anthropicApiKey,
      });

  const llmProvider = openaiApiKey ? "OpenAI (gpt-4o)" : "Anthropic (claude-sonnet-4-5)";

  const tools = toolkit.getTools();
  responseParser = new ResponseParserService(tools);

  agent = await createAgent({
    model: llm,
    tools,
    systemPrompt: SYSTEM_PROMPT,
    checkpointer: new MemorySaver(),
  });

  console.log(`[AGENT] Initialized with ${tools.length} tools on Hedera testnet (LLM: ${llmProvider})`);

  return { agent, toolkit, responseParser };
}

export interface AgentResponse {
  content: string;
  toolCalls: {
    name: string;
    humanMessage?: string;
    raw?: unknown;
  }[];
}

export async function invokeAgent(
  message: string,
  threadId: string,
  walletAddress?: string
): Promise<AgentResponse> {
  const { agent, responseParser } = await getAgent();

  // Prepend wallet context so the agent knows which account the user is asking about
  const contextPrefix = walletAddress
    ? `[User's connected wallet: ${walletAddress}]\n\n`
    : "";

  const response = await agent.invoke(
    { messages: [{ role: "user", content: contextPrefix + message }] },
    { configurable: { thread_id: threadId } }
  );

  const lastMessage = response.messages[response.messages.length - 1];
  const content =
    typeof lastMessage.content === "string"
      ? lastMessage.content
      : JSON.stringify(lastMessage.content);

  const toolCalls: AgentResponse["toolCalls"] = [];
  try {
    const parsed = responseParser.parseNewToolMessages(response);
    for (const p of parsed) {
      toolCalls.push({
        name: p.toolName ?? "unknown",
        humanMessage: p.parsedData?.humanMessage,
        raw: p.parsedData?.raw,
      });
    }
  } catch {
    // parsing is optional, don't fail if it errors
  }

  return { content, toolCalls };
}
