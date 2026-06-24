"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Workflow,
  Send,
  Bot,
  Activity,
  ShieldCheck,
  Clock,
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  Cpu,
  MessageSquare,
  Target,
  Search,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendA2ATaskThunk, fetchA2ATasks, fetchA2AStats } from "@/store/ai-slice";
import { getA2AAgentCard } from "@/lib/api/ai";
import { A2AAgentCard, A2ATaskSummary, A2ATask } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const SKILL_OPTIONS = [
  { id: "carbon-accounting", label: "Carbon Accounting", icon: Activity },
  { id: "brsr-compliance", label: "BRSR Compliance", icon: ShieldCheck },
  { id: "document-analysis", label: "Document Analysis", icon: Target },
  { id: "carbon-trading", label: "Carbon Trading", icon: Zap },
  { id: "strategy-advisory", label: "Strategy Advisory", icon: Sparkles },
];

const STATE_COLORS: Record<string, string> = {
  submitted: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  working: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  rejected: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  canceled: "bg-muted text-muted-foreground border-border",
  "input-required": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "auth-required": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  unknown: "bg-muted text-muted-foreground border-border",
};

export function A2APage() {
  const dispatch = useAppDispatch();
  const { a2aTasks, a2aStats, a2aActiveTask, a2aStatus } = useAppSelector((s) => s.ai);

  const [agentCard, setAgentCard] = useState<A2AAgentCard | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [query, setQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("carbon-accounting");
  const [sessionId, setSessionId] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; text: string; task?: A2ATask; timestamp: string }>>([]);
  const [inspectedTask, setInspectedTask] = useState<A2ATaskSummary | null>(null);
  const [filterState, setFilterState] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getA2AAgentCard().then(setAgentCard).catch(() => {});
    dispatch(fetchA2ATasks());
    dispatch(fetchA2AStats());
  }, [dispatch]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSend = async () => {
    if (!query.trim() || a2aStatus === "loading") return;
    const userMsg = query.trim();
    setQuery("");

    setChatHistory((prev) => [
      ...prev,
      { role: "user", text: userMsg, timestamp: new Date().toISOString() },
    ]);

    try {
      const result = await dispatch(
        sendA2ATaskThunk({ query: userMsg, session_id: sessionId || undefined, skill_id: selectedSkill })
      ).unwrap();

      const answerParts = result.artifacts?.[0]?.parts || result.status?.message?.parts || [];
      const answerText = answerParts.map((p: any) => p.text || "").join("") || "No response generated.";

      setChatHistory((prev) => [
        ...prev,
        { role: "agent", text: answerText, task: result, timestamp: new Date().toISOString() },
      ]);

      if (!sessionId && result.contextId) {
        setSessionId(result.contextId);
      }

      dispatch(fetchA2ATasks());
      dispatch(fetchA2AStats());
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: "agent", text: `Error: ${err}`, timestamp: new Date().toISOString() },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredTasks = a2aTasks.filter((t) => !filterState || t.state === filterState);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-foreground">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
            <Workflow className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">A2A Agent Protocol</h1>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30 font-bold px-2 py-0.5 text-[10px]">
                v{agentCard?.protocolVersion || "0.3.0"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Agent-to-Agent communication with full guardrail pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              dispatch(fetchA2ATasks());
              dispatch(fetchA2AStats());
              toast.success("A2A data refreshed.");
            }}
            className="border-border text-foreground hover:bg-muted font-medium h-9 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(
                JSON.stringify(agentCard, null, 2)
              );
              toast.success("Agent Card JSON copied to clipboard.");
            }}
            className="border-border text-foreground hover:bg-muted font-medium h-9 text-xs"
          >
            <Copy className="w-3.5 h-3.5 mr-2" />
            Copy Agent Card
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Tasks", value: a2aStats?.total_tasks ?? 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed", value: a2aStats?.completed_tasks ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Failed", value: a2aStats?.failed_tasks ?? 0, icon: XCircle, color: "text-destructive", bg: "bg-destructive/10" },
          { label: "Guardrail Blocked", value: a2aStats?.blocked_tasks ?? 0, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Avg Latency", value: `${Math.round(a2aStats?.avg_duration_ms ?? 0)}ms`, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="glass border-border shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-4">
        <TabsList className="w-full justify-start bg-muted border border-border p-1">
          <TabsTrigger value="chat" className="text-xs font-medium py-1.5 px-3">
            <MessageSquare className="w-3.5 h-3.5 mr-2" /> A2A Chat
          </TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs font-medium py-1.5 px-3">
            <Activity className="w-3.5 h-3.5 mr-2" /> Task History
          </TabsTrigger>
          <TabsTrigger value="agent-card" className="text-xs font-medium py-1.5 px-3">
            <Bot className="w-3.5 h-3.5 mr-2" /> Agent Card
          </TabsTrigger>
          <TabsTrigger value="skills" className="text-xs font-medium py-1.5 px-3">
            <Cpu className="w-3.5 h-3.5 mr-2" /> Skills
          </TabsTrigger>
        </TabsList>

        {/* A2A Chat Interface */}
        <TabsContent value="chat" className="outline-none">
          <Card className="glass border-border">
            <CardContent className="p-0">
              {/* Skill Selector */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <span className="text-xs font-semibold text-muted-foreground">Target Skill:</span>
                <div className="flex gap-2 flex-wrap">
                  {SKILL_OPTIONS.map((skill) => {
                    const Icon = skill.icon;
                    return (
                      <Button
                        key={skill.id}
                        size="sm"
                        variant={selectedSkill === skill.id ? "default" : "outline"}
                        onClick={() => setSelectedSkill(skill.id)}
                        className={cn(
                          "h-7 text-[10px] font-semibold gap-1.5",
                          selectedSkill === skill.id
                            ? "bg-foreground text-background"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {skill.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <Workflow className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-sm font-bold text-foreground mb-1">A2A Agent Communication</h3>
                    <p className="text-xs text-muted-foreground max-w-md">
                      Send tasks to the IndiCarbon AI Agent using the A2A protocol.
                      Full guardrail pipeline (PII masking, domain guard, injection defense) is active.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4 justify-center">
                      {["Calculate our Scope 1 emissions", "Generate BRSR report", "What carbon credits are available?"].map((prompt) => (
                        <Button
                          key={prompt}
                          variant="outline"
                          size="sm"
                          onClick={() => { setQuery(prompt); }}
                          className="text-[10px] h-7 border-border text-muted-foreground hover:text-foreground"
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                    {msg.role === "agent" && (
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-blue-500" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed",
                        msg.role === "user"
                          ? "bg-foreground text-background rounded-br-md"
                          : "bg-muted border border-border text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      {msg.task && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                          <Badge className={`text-[8px] font-bold ${STATE_COLORS[msg.task.status.state] || ""}`}>
                            {msg.task.status.state.toUpperCase()}
                          </Badge>
                          {msg.task.metadata?.durationMs && (
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {msg.task.metadata.durationMs}ms
                            </span>
                          )}
                          {msg.task.metadata?.guardrailAudit && (
                            <ShieldCheck className="w-3 h-3 text-emerald-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-xl bg-foreground/10 border border-border flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-foreground">You</span>
                      </div>
                    )}
                  </div>
                ))}

                {a2aStatus === "loading" && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    </div>
                    <div className="bg-muted border border-border rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-[10px] text-muted-foreground">Processing A2A task...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a task to the IndiCarbon A2A agent..."
                    className="flex-1 h-10 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                    disabled={a2aStatus === "loading"}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!query.trim() || a2aStatus === "loading"}
                    className="h-10 px-5 bg-foreground text-background hover:bg-foreground/90 font-semibold text-xs"
                  >
                    {a2aStatus === "loading" ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Task
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] text-muted-foreground">
                    4-layer guardrail pipeline active: PII masking, domain guard, injection defense, output validation
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task History */}
        <TabsContent value="tasks" className="outline-none">
          <Card className="glass border-border">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">A2A Task History</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Complete log of all A2A protocol tasks with guardrail audit trails.</CardDescription>
                </div>
                <Select value={filterState} onValueChange={(v) => setFilterState(v ?? "")}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All States</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="working">Working</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-xs font-semibold py-3 pl-4">Task ID</TableHead>
                    <TableHead className="text-xs font-semibold py-3">Skill</TableHead>
                    <TableHead className="text-xs font-semibold py-3">Query</TableHead>
                    <TableHead className="text-xs font-semibold py-3">State</TableHead>
                    <TableHead className="text-xs font-semibold py-3">Guardrail</TableHead>
                    <TableHead className="text-xs font-semibold py-3">Duration</TableHead>
                    <TableHead className="text-xs font-semibold py-3">Tokens</TableHead>
                    <TableHead className="text-xs font-semibold py-3 text-right pr-4">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/30">
                  {filteredTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                        No A2A tasks recorded yet. Send your first task from the Chat tab.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTasks.map((task) => (
                      <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell className="py-3 pl-4 text-xs text-muted-foreground font-mono">
                          {task.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className="text-[9px] font-semibold border-border capitalize">
                            {(task.skill_id || "general").replace(/-/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-foreground max-w-[200px] truncate">
                          {task.query}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge className={`text-[9px] font-bold uppercase ${STATE_COLORS[task.state] || ""}`}>
                            {task.state}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3">
                          {task.guardrail_blocked ? (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] font-bold">BLOCKED</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold">PASSED</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                          {task.duration_ms ? `${task.duration_ms}ms` : "—"}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-muted-foreground font-mono">
                          {task.token_usage || "—"}
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectedTask(task)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agent Card */}
        <TabsContent value="agent-card" className="outline-none">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">A2A Agent Card</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Public discovery endpoint at <code className="font-mono text-foreground">/.well-known/agent.json</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {agentCard ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Agent Name</span>
                        <p className="text-sm font-bold text-foreground">{agentCard.name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Description</span>
                        <p className="text-xs text-muted-foreground">{agentCard.description}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Provider</span>
                        <p className="text-xs text-foreground">{agentCard.provider.organization}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Protocol Version</span>
                        <Badge variant="outline" className="text-xs font-mono">{agentCard.protocolVersion}</Badge>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Authentication</span>
                        <Badge variant="outline" className="text-xs font-mono uppercase">{agentCard.securitySchemes?.bearer?.scheme ?? "bearer"}</Badge>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Capabilities</span>
                        <div className="flex gap-2 flex-wrap">
                          {agentCard.capabilities.streaming && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">Streaming</Badge>}
                          {agentCard.capabilities.stateTransitionHistory && <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[9px]">State History</Badge>}
                          <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 text-[9px]">Guardrails</Badge>
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px]">HITL</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-muted border border-border rounded-xl">
                    <pre className="text-[10px] font-mono text-muted-foreground overflow-x-auto max-h-48 overflow-y-auto">
                      {JSON.stringify(agentCard, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Loading agent card...</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills" className="outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agentCard?.skills.map((skill) => (
              <Card key={skill.id} className="glass border-border hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-blue-500" />
                    </div>
                    <CardTitle className="text-xs font-bold text-foreground">{skill.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-[11px] text-muted-foreground">{skill.description}</p>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Tags</span>
                    <div className="flex gap-1 flex-wrap">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="text-[8px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Examples</span>
                    <div className="space-y-1">
                      {skill.examples.map((ex, i) => (
                        <button
                          key={i}
                          onClick={() => { setQuery(ex); setSelectedSkill(skill.id); setActiveTab("chat"); }}
                          className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer block text-left"
                        >
                          → {ex}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Sheet */}
      <Sheet open={!!inspectedTask} onOpenChange={() => setInspectedTask(null)}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-sm font-bold">A2A Task Detail</SheetTitle>
            <SheetDescription className="text-xs font-mono text-muted-foreground">
              {inspectedTask?.id}
            </SheetDescription>
          </SheetHeader>
          {inspectedTask && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2">
                <Badge className={`text-[9px] font-bold uppercase ${STATE_COLORS[inspectedTask.state] || ""}`}>
                  {inspectedTask.state}
                </Badge>
                {inspectedTask.guardrail_blocked ? (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]">GUARDRAIL BLOCKED</Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">GUARDRAIL PASSED</Badge>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Query</span>
                <p className="text-xs text-foreground bg-muted p-3 rounded-lg border border-border">{inspectedTask.query}</p>
              </div>

              {inspectedTask.answer && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Response</span>
                  <p className="text-xs text-foreground bg-muted p-3 rounded-lg border border-border whitespace-pre-wrap">
                    {inspectedTask.answer}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Duration</span>
                  <p className="text-xs font-mono text-foreground">{inspectedTask.duration_ms}ms</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Tokens</span>
                  <p className="text-xs font-mono text-foreground">{inspectedTask.token_usage}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Skill</span>
                  <p className="text-xs text-foreground capitalize">{(inspectedTask.skill_id || "general").replace(/-/g, " ")}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Created</span>
                  <p className="text-xs text-muted-foreground">
                    {inspectedTask.created_at ? new Date(inspectedTask.created_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              {Object.keys(inspectedTask.guardrail_audit).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Guardrail Audit</span>
                  <pre className="text-[10px] font-mono text-muted-foreground bg-muted p-3 rounded-lg border border-border overflow-x-auto">
                    {JSON.stringify(inspectedTask.guardrail_audit, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
