export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: string;
  toolCall?: {
    name: string;
    status: "success" | "error" | "pending";
    result?: string;
  };
}

export const MOCK_SUGGESTIONS = [
  "What is my HBAR balance?",
  "Send 100 HBAR to 0.0.4821533",
  "What tokens do I hold?",
  "Create a new HTS fungible token",
  "What's the current HBAR exchange rate?",
  "Show my vault positions",
];

export const MOCK_CONVERSATION: ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    content: "What is my HBAR balance?",
    timestamp: "2026-03-15T10:30:00Z",
  },
  {
    id: "msg-2",
    role: "agent",
    content: "Your current HBAR balance is **245,320 HBAR** (~$68,689.60 USD at current rate of $0.28/HBAR).",
    timestamp: "2026-03-15T10:30:02Z",
    toolCall: {
      name: "hedera_get_account_balance",
      status: "success",
      result: "245320 HBAR",
    },
  },
  {
    id: "msg-3",
    role: "user",
    content: "What tokens do I hold on Hedera?",
    timestamp: "2026-03-15T10:31:00Z",
  },
  {
    id: "msg-4",
    role: "agent",
    content: "You hold the following tokens on your Hedera account (0.0.4515612):\n\n- **HBAR**: 245,320 ($68,689.60)\n- **USDC**: 12,500 ($12,500.00)\n- **HBARX**: 8,200 ($2,542.00)\n- **SAUCE**: 45,000 ($1,890.00)\n\nTotal portfolio value: **$85,621.60**",
    timestamp: "2026-03-15T10:31:03Z",
    toolCall: {
      name: "hedera_get_token_holdings",
      status: "success",
      result: "4 tokens found",
    },
  },
  {
    id: "msg-5",
    role: "user",
    content: "Send 100 HBAR to 0.0.4821533",
    timestamp: "2026-03-15T10:32:00Z",
  },
  {
    id: "msg-6",
    role: "agent",
    content: "Transfer completed successfully.\n\n**100 HBAR** sent to account **0.0.4821533**.\n\nTransaction ID: `0.0.4515612@1710498720.123456789`\nFee: 0.0001 HBAR\nRemaining balance: 245,219.9999 HBAR",
    timestamp: "2026-03-15T10:32:04Z",
    toolCall: {
      name: "hedera_transfer_hbar",
      status: "success",
      result: "100 HBAR transferred",
    },
  },
];
