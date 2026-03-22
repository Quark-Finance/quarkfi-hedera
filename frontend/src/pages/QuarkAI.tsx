import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "@/hooks/useWallet";
import { MOCK_SUGGESTIONS, type ChatMessage, type ToolCallInfo } from "@/data/chat";
import { sendMessage, getAgentStatus } from "@/lib/api";
import {
  Send,
  Wallet,
  Bot,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  WifiOff,
} from "lucide-react";

function ToolCallBadge({ toolCall }: { toolCall: ToolCallInfo }) {

  const statusConfig = {
    success: { icon: CheckCircle, className: "text-primary border-primary/40 bg-primary/10" },
    error: { icon: AlertCircle, className: "text-negative border-negative/40 bg-negative/10" },
    pending: { icon: Loader2, className: "text-warning border-warning/40 bg-warning/10" },
  };

  const config = statusConfig[toolCall.status];
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 border text-[9px] font-bold tracking-[0.5px] uppercase ${config.className}`}>
      <Icon className={`h-3 w-3 ${toolCall.status === "pending" ? "animate-spin" : ""}`} />
      <span>{toolCall.name}</span>
      {toolCall.result && (
        <>
          <span className="text-muted-foreground">—</span>
          <span>{toolCall.result}</span>
        </>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAgent = message.role === "agent";

  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div className={`shrink-0 w-7 h-7 flex items-center justify-center border border-border ${isAgent ? "bg-primary/10" : "bg-secondary"}`}>
        {isAgent ? (
          <Bot className="h-3.5 w-3.5 text-primary" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <div className={`max-w-[75%] space-y-2 ${isAgent ? "" : "text-right"}`}>
        <div className={`border border-border p-4 text-[13px] leading-relaxed ${isAgent ? "bg-card" : "bg-secondary"}`}>
          {message.content.split("\n").map((line, i) => {
            const formatted = line
              .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>')
              .replace(/`(.+?)`/g, '<code class="text-primary bg-primary/10 px-1">$1</code>');
            return (
              <p
                key={i}
                className={`${i > 0 && line ? "mt-1.5" : ""} ${!line ? "h-2" : ""}`}
                dangerouslySetInnerHTML={{ __html: formatted }}
              />
            );
          })}
        </div>
        {(message.toolCalls ?? (message.toolCall ? [message.toolCall] : [])).map((tc, i) => (
          <ToolCallBadge key={i} toolCall={tc} />
        ))}
        <p className="text-[9px] text-muted-foreground tracking-[0.5px] uppercase">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export function QuarkAI() {
  const { isConnected, address, connect } = useWallet();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentOnline, setAgentOnline] = useState<boolean | null>(null);
  const [toolCount, setToolCount] = useState(0);
  const [threadId] = useState(() => `thread-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    getAgentStatus()
      .then((status) => {
        setAgentOnline(status.status === "online");
        setToolCount(status.tools ?? 0);
      })
      .catch(() => setAgentOnline(false));
  }, []);

  const handleSend = useCallback(
    async (text?: string) => {
      const content = text ?? input.trim();
      if (!content || isTyping) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const result = await sendMessage(content, threadId, address);

        const toolCalls: ToolCallInfo[] = (result.toolCalls ?? []).map((tc) => ({
          name: tc.name,
          status: result.error ? "error" as const : "success" as const,
          result: tc.humanMessage,
        }));

        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}-agent`,
          role: "agent",
          content: result.content,
          timestamp: new Date().toISOString(),
          toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
        };

        setMessages((prev) => [...prev, agentMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          role: "agent",
          content:
            err instanceof Error && !err.message.includes("fetch")
              ? err.message
              : "Failed to reach the Quark AI server. Make sure the server is running on port 3001.",
          timestamp: new Date().toISOString(),
          toolCalls: [
            {
              name: "connection_error",
              status: "error",
              result: "server unreachable",
            },
          ],
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [input, isTyping, threadId, address]
  );

  if (!isConnected) {
    return (
      <div className="flex flex-col h-screen">
        {/* Header — same as connected state */}
        <div className="border-b border-border px-8 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-1">
                // QUARK AI AGENT
              </p>
              <h1 className="text-[18px] font-semibold font-display text-foreground">
                Hedera AI Assistant
              </h1>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-border text-[9px] font-bold tracking-[0.5px] uppercase text-muted-foreground">
              [LOCKED]
            </span>
          </div>
        </div>

        {/* Gate content */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="w-full max-w-sm">
            <div className="border border-border bg-card p-8 text-center">
              <div className="w-12 h-12 flex items-center justify-center border border-border bg-secondary mx-auto mb-5">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-3">
                // WALLET REQUIRED
              </p>
              <h2 className="text-[22px] font-bold font-display tracking-[-1px] text-foreground mb-2">
                Connect to use Quark AI
              </h2>
              <p className="text-[13px] text-muted-foreground mb-6 tracking-[0.3px]">
                Your wallet provides context for the agent to check balances, transfer tokens, and manage your positions.
              </p>

              {/* Capability hints */}
              <div className="space-y-2 mb-6 text-left">
                {[
                  "Check HBAR balance & token holdings",
                  "Transfer tokens & create assets",
                  "Analyze vault performance",
                ].map((cap) => (
                  <div key={cap} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-primary shrink-0" />
                    <span className="text-[11px] text-muted-foreground tracking-[0.3px]">{cap}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={connect}
                className="w-full text-[11px] font-bold tracking-[0.5px] uppercase"
              >
                CONNECT WALLET
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-border px-8 py-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.5px] text-primary uppercase mb-1">
              // QUARK AI AGENT
            </p>
            <h1 className="text-[18px] font-semibold font-display text-foreground">
              Hedera AI Assistant
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {toolCount > 0 && (
              <span className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase">
                {toolCount} TOOLS
              </span>
            )}
            {agentOnline === null ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-border text-[9px] font-bold tracking-[0.5px] uppercase text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                [CONNECTING]
              </span>
            ) : agentOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-primary/40 bg-primary/10 text-[9px] font-bold tracking-[0.5px] uppercase text-primary">
                <span className="w-1.5 h-1.5 bg-primary animate-pulse" />
                [ONLINE]
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-1 border border-negative/40 bg-negative/10 text-[9px] font-bold tracking-[0.5px] uppercase text-negative">
                <WifiOff className="h-3 w-3" />
                [OFFLINE]
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="h-8 w-8 text-primary mb-4" />
            <h2 className="text-[18px] font-semibold font-display text-foreground mb-2">
              Quark AI Agent
            </h2>
            <p className="text-[13px] text-muted-foreground max-w-md mb-2">
              Interact with Hedera through natural language. Check balances,
              transfer tokens, create assets, and more.
            </p>
            {!agentOnline && agentOnline !== null && (
              <p className="text-[11px] text-warning tracking-[0.5px] uppercase mt-2">
                // SERVER OFFLINE — START WITH: cd server && bun run dev
              </p>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 flex items-center justify-center border border-border bg-primary/10">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground tracking-[0.5px] uppercase">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                PROCESSING...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <div className="px-8 pb-3 shrink-0">
          <p className="text-[9px] font-bold tracking-[0.5px] text-muted-foreground uppercase mb-2">
            // SUGGESTED ACTIONS
          </p>
          <div className="flex flex-wrap gap-2">
            {MOCK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSend(suggestion)}
                className="px-3 py-1.5 border border-border bg-secondary text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors tracking-[0.5px]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-8 py-4 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-3"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ASK THE AGENT..."
            className="flex-1 text-[13px] tracking-[0.5px] placeholder:text-muted-foreground placeholder:uppercase"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="gap-2 text-[11px] font-bold tracking-[0.5px] uppercase"
          >
            <Send className="h-3.5 w-3.5" />
            SEND
          </Button>
        </form>
      </div>
    </div>
  );
}
