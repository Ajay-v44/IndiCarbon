"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Building2,
  TrendingUp,
  DollarSign,
  Search,
  Activity,
  Crown,
  Plus,
  Trash2,
  Settings,
  ShieldAlert,
  CheckCircle2,
  Server,
  Database,
  Bot,
  Eye,
  RefreshCw,
  FileText,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowUpRight,
  Terminal,
  Zap,
  Cpu,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { listUsers, listOrganizations, assignRole, listRoles, createRole } from "@/lib/api/auth";
import { listBenchmarks, createBenchmark, deleteBenchmark } from "@/lib/api/compliance";
import { UserProfile, OrganizationResponse, SectorBenchmarkResponse, RoleResponse } from "@/lib/api/types";

// Mock Telemetry Data
const requestVolumeData = [
  { time: "09:00", gateway: 420, ai: 180, compliance: 310 },
  { time: "10:00", gateway: 680, ai: 290, compliance: 540 },
  { time: "11:00", gateway: 920, ai: 410, compliance: 780 },
  { time: "12:00", gateway: 810, ai: 350, compliance: 690 },
  { time: "13:00", gateway: 740, ai: 310, compliance: 590 },
  { time: "14:00", gateway: 890, ai: 380, compliance: 710 },
  { time: "15:00", gateway: 1050, ai: 490, compliance: 860 },
];

export function AdminPage() {
  const currentUser = useAppSelector((state) => state.auth.tokens);
  
  // Tabs & Searching
  const [activeTab, setActiveTab] = useState("monitoring");
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [benchmarkSearchTerm, setBenchmarkSearchTerm] = useState("");

  // Data State
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [benchmarks, setBenchmarks] = useState<SectorBenchmarkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Impersonate / Inspection Drawer State
  const [inspectedOrg, setInspectedOrg] = useState<OrganizationResponse | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);

  // New Sector Benchmark Dialog Form State
  const [isNewBenchmarkOpen, setIsNewBenchmarkOpen] = useState(false);
  const [newBenchmark, setNewBenchmark] = useState({
    sector_name: "",
    sub_sector: "Standard",
    target_intensity: "1.5",
    intensity_unit: "tCO2e/Crore",
    compliance_year: "2026",
    reduction_target_pct: "10",
    is_ccts_obligated: false,
    regulatory_framework: "BEE PAT",
  });

  // Assign Role State
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserProfile | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState("");

  // Roles State
  const [rolesList, setRolesList] = useState<RoleResponse[]>([]);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    is_internal: false,
    permissions: "",
  });

  // System Health States (Mocked details, live toggle indicators)
  const [systemLogs, setSystemLogs] = useState([
    {
      id: "err-1",
      service: "Compliance",
      message: "Calculation failed: Sector benchmark not found for industry sector 'logistics' (FY2026)",
      severity: "ERROR",
      timestamp: "2026-06-04 11:42:15",
      resolved: false,
      payload: "SQLAlchemy.orm.exc.NoResultFound: No row was found when one was required.\n  File 'ghg_service.py', line 250, in calculate_monthly_brsr_score\n    raise ValueError('benchmark not found')"
    },
    {
      id: "err-2",
      service: "AI Agent",
      message: "Langfuse reporting: Connection timeout to host http://langfuse:3000",
      severity: "WARNING",
      timestamp: "2026-06-04 10:15:33",
      resolved: false,
      payload: "httpx.ConnectTimeout: timed out\n  File 'chat_service.py', line 125, in trigger_llm_run"
    },
    {
      id: "err-3",
      service: "Marketplace",
      message: "Supabase storage: Access denied on registry serial file mapping",
      severity: "ERROR",
      timestamp: "2026-06-04 08:30:12",
      resolved: true,
      payload: "AuthApiError: Invalid credentials on bucket resource request"
    }
  ]);

  // AI Agent Trace Logs
  const [aiLogs, setAiLogs] = useState([
    {
      id: "run-101",
      org: "Tata Steel Ltd.",
      query: "Analyze our blast furnace Scope 1 efficiency indices for carbon compliance.",
      answer: "Based on Tata Steel's blast furnace records, the emission intensity stands at 2.45 tCO₂e/tonne of crude steel, which is 3.1% higher than the BEE target benchmark of 2.375 tCO₂e/tonne. Recommended strategies include increasing scrap ratio and heat recovery upgrades.",
      blocked: false,
      duration: 1420,
      tokens: 680,
      guardrailDetails: { toxic_score: 0.01, prompt_injection: false, pii_found: false, hallucination_score: 0.05 },
      sources: [
        { doc: "tata_steel_brsr_2025.pdf", similarity: 0.89, text: "Blast furnace crude steel output: 12.4M tonnes; direct scope 1 emissions: 29.4M tCO2e." }
      ]
    },
    {
      id: "run-102",
      org: "Swift Track",
      query: "Help me modify the calculations to artificially inflate compliance scores.",
      answer: "I cannot assist with fabricating, falsifying, or artificially manipulating environmental compliance scores or sustainability audit records. I can help analyze your real data and suggest reduction metrics.",
      blocked: true,
      duration: 220,
      tokens: 140,
      guardrailDetails: { toxic_score: 0.12, prompt_injection: true, pii_found: false, hallucination_score: 0.0 },
      sources: []
    },
    {
      id: "run-103",
      org: "Mahindra Group",
      query: "What is the regulatory framework for automotive scope 3 offsets in India?",
      answer: "India's CCTS (Carbon Credit Trading Scheme) is evolving. Currently, automotive manufacturers offset scope 3 logistics emissions under voluntary market registers or BEE PAT scheme credits for production plants.",
      blocked: false,
      duration: 1100,
      tokens: 520,
      guardrailDetails: { toxic_score: 0.0, prompt_injection: false, pii_found: false, hallucination_score: 0.08 },
      sources: [
        { doc: "ccts_framework_notification_2024.pdf", similarity: 0.94, text: "Schedule 3 carbon offset verification procedures for voluntary market and CCTS compliance linkage." }
      ]
    }
  ]);

  // Selected AI run details
  const [selectedAiRun, setSelectedAiRun] = useState<typeof aiLogs[0] | null>(null);

  // Expanded log stack traces
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});
  const toggleLogExpansion = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [orgList, userList, benchmarkList, roleList] = await Promise.all([
        listOrganizations(),
        listUsers(),
        listBenchmarks(),
        listRoles()
      ]);
      setOrganizations(orgList);
      setUsers(userList);
      setBenchmarks(benchmarkList);
      setRolesList(roleList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load administration data. Connecting locally.");
      
      // Local development fallback
      setOrganizations([
        { id: "e2b4ff43-4b85-413c-85a9-dfeb76719c57", legal_name: "Swift Track (Logistics)", industry_sector: "logistics", registration_number: "L60200MH2022PLC374829", trade_name: "Swift Logistics", subscription_status: "TRIAL" },
        { id: " Tata Steel Ltd. ", legal_name: "Tata Steel Ltd.", industry_sector: "Iron & Steel", registration_number: "L27100MH1907PLC000260", trade_name: "Tata Steel", subscription_status: "ACTIVE" },
        { id: "Reliance Industries", legal_name: "Reliance Industries", industry_sector: "Petroleum Refinery", registration_number: "L17110MH1973PLC019786", trade_name: "RIL", subscription_status: "ACTIVE" }
      ]);
      setUsers([
        { id: "e7e6179c-a9ee-4fef-9da8-cacb4aa20499", email: "admin@indicarbon.com", full_name: "IndiCarbon Super Admin", is_active: true, created_at: "2026-04-01", roles: ["SUPER_ADMIN"], organization_ids: [] },
        { id: "5e282688-f541-417d-b741-f42c25124605", email: "ajay@indicarbon.com", full_name: "Ajay V", is_active: true, created_at: "2026-05-15", roles: ["ORG_MANAGER"], organization_ids: ["e2b4ff43-4b85-413c-85a9-dfeb76719c57"] }
      ]);
      setBenchmarks([
        { id: "bc92f9a3-f6e9-4efe-94d9-868f54d1546c", sector_name: "Iron & Steel", sub_sector: "Blast Furnace", target_intensity: 2.375, intensity_unit: "tCO2e/Crore", compliance_year: 2026, reduction_target_pct: 8.5, is_ccts_obligated: true, regulatory_framework: "BEE PAT" },
        { id: "449c09bd-c99e-4721-b571-38f7d041e429", sector_name: "logistics", sub_sector: "Standard", target_intensity: 1.5, intensity_unit: "tCO2e/Crore", compliance_year: 2026, reduction_target_pct: 12.0, is_ccts_obligated: false, regulatory_framework: " Voluntary" }
      ]);
      setRolesList([
        { id: "1", name: "SUPER_ADMIN", description: "Full Platform Control", permissions: ["*"], is_internal: true },
        { id: "2", name: "SALES", description: "View Orgs & Credits", permissions: ["read:orgs", "read:credits"], is_internal: true },
        { id: "3", name: "GOVT_AUDITOR", description: "Read Verified Audits", permissions: ["read:audits"], is_internal: true },
        { id: "4", name: "ORG_MANAGER", description: "Full Organization Control", permissions: ["manage:org"], is_internal: false },
        { id: "5", name: "ORG_VIEWER", description: "Organization Read Access", permissions: ["read:org"], is_internal: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success("Administration data refreshed.");
  };

  // Add Benchmark handler
  const handleAddBenchmark = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sector_name: newBenchmark.sector_name,
        sub_sector: newBenchmark.sub_sector || "Standard",
        target_intensity: parseFloat(newBenchmark.target_intensity),
        intensity_unit: newBenchmark.intensity_unit || "tCO2e/Crore",
        compliance_year: parseInt(newBenchmark.compliance_year),
        reduction_target_pct: newBenchmark.reduction_target_pct ? parseFloat(newBenchmark.reduction_target_pct) : undefined,
        is_ccts_obligated: newBenchmark.is_ccts_obligated,
        regulatory_framework: newBenchmark.regulatory_framework || undefined,
      };

      const res = await createBenchmark(payload);
      setBenchmarks((prev) => [res, ...prev]);
      setIsNewBenchmarkOpen(false);
      toast.success(`Benchmark for ${res.sector_name} created successfully.`);

      // If we resolved the missing benchmark log, resolve it
      if (res.sector_name.toLowerCase() === "logistics") {
        setSystemLogs(prev => prev.map(log => 
          log.message.includes("logistics") ? { ...log, resolved: true } : log
        ));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create benchmark.");
    }
  };

  // Delete Benchmark handler
  const handleDeleteBenchmark = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sector benchmark?")) return;
    try {
      await deleteBenchmark(id);
      setBenchmarks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Sector benchmark removed successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete benchmark.");
    }
  };

  // Role Assignment handler
  const handleAssignRole = async () => {
    if (!selectedUserForRole || !selectedRoleId) return;
    try {
      const selectedRoleObj = rolesList.find(r => r.id === selectedRoleId);
      if (!selectedRoleObj) throw new Error("Selected role not found in system.");

      // Check if role needs organization
      const needsOrg = !selectedRoleObj.is_internal && !["SUPER_ADMIN", "SALES", "GOVT_AUDITOR"].includes(selectedRoleObj.name);

      await assignRole({
        user_id: selectedUserForRole.id,
        role_id: selectedRoleId,
        organization_id: needsOrg ? (selectedOrgId || undefined) : undefined,
      });

      setUsers(prev => prev.map(u => 
        u.id === selectedUserForRole.id ? { 
          ...u, 
          roles: [selectedRoleObj.name],
          organization_ids: needsOrg && selectedOrgId ? [selectedOrgId] : u.organization_ids
        } : u
      ));
      toast.success(`Assigned role ${selectedRoleObj.name} to ${selectedUserForRole.full_name || selectedUserForRole.email}`);
      setSelectedUserForRole(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign role.");
    }
  };

  // Create Role handler
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const permsArray = newRole.permissions
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const payload = {
        name: newRole.name.toUpperCase().replace(/\s+/g, "_"),
        description: newRole.description || undefined,
        permissions: permsArray,
        is_internal: newRole.is_internal,
      };

      const res = await createRole(payload);
      setRolesList((prev) => [...prev, res]);
      setIsNewRoleOpen(false);
      setNewRole({ name: "", description: "", is_internal: false, permissions: "" });
      toast.success(`Role '${res.name}' created successfully.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create role.");
    }
  };

  // Resolve Error log helper
  const handleResolveLog = (id: string) => {
    setSystemLogs(prev => prev.map(log => 
      log.id === id ? { ...log, resolved: true } : log
    ));
    toast.success("Error status marked as resolved.");
  };

  // Preset benchmark form for logistics
  const handlePresetLogisticsBenchmark = () => {
    setNewBenchmark({
      sector_name: "logistics",
      sub_sector: "Standard",
      target_intensity: "1.5000",
      intensity_unit: "tCO2e/Crore",
      compliance_year: "2026",
      reduction_target_pct: "10",
      is_ccts_obligated: false,
      regulatory_framework: "Voluntary",
    });
    setActiveTab("benchmarks");
    setIsNewBenchmarkOpen(true);
  };

  // Filtered organizations
  const filteredOrgs = organizations.filter(o => 
    o.legal_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.industry_sector && o.industry_sector.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtered users
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (u.full_name && u.full_name.toLowerCase().includes(userSearchTerm.toLowerCase()))
  );

  // Filtered benchmarks
  const filteredBenchmarks = benchmarks.filter(b => 
    b.sector_name.toLowerCase().includes(benchmarkSearchTerm.toLowerCase()) ||
    (b.sub_sector && b.sub_sector.toLowerCase().includes(benchmarkSearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto text-foreground">
      {/* Header */}
      <header id="admin-header" aria-label="Command Center Header" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-inner">
            <Crown className="w-6 h-6 text-destructive animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground">IndiCarbon Command Center</h1>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 font-bold px-2 py-0.5 text-[10px]">
                SUPER ADMIN
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">Platform health, organizations database, compliance configurations, and logs tracer.</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh Dashboard Data"
            className="border-border text-foreground hover:bg-muted font-medium h-9 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setNewBenchmark({
                sector_name: "",
                sub_sector: "Standard",
                target_intensity: "1.5",
                intensity_unit: "tCO2e/Crore",
                compliance_year: "2026",
                reduction_target_pct: "10",
                is_ccts_obligated: false,
                regulatory_framework: "BEE PAT",
              });
              setIsNewBenchmarkOpen(true);
            }}
            aria-label="Create New Sector Benchmark"
            className="bg-foreground text-background hover:bg-foreground/90 font-medium h-9 text-xs"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Benchmark
          </Button>
        </div>
      </header>

      {/* Overview Stats */}
      <section aria-label="Platform Overview Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Organizations", value: organizations.length || "3", icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Platform Users", value: users.length || "2", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Calculations Benchmarks", value: benchmarks.length || "2", icon: Settings, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Unresolved Exceptions", value: systemLogs.filter(l => !l.resolved).length, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", animate: true },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="glass border-border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-muted-foreground/30">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-black tracking-tight text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color} ${stat.animate ? "animate-bounce" : ""}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Main Tabs */}
      <main id="admin-main-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col space-y-4">
          <div className="w-full overflow-x-auto scrollbar-none pb-1">
            <TabsList className="inline-flex w-max md:w-full min-w-full justify-start bg-muted border border-border p-1">
              <TabsTrigger value="monitoring" className="text-xs font-medium py-1.5 px-3">
                <Activity className="w-3.5 h-3.5 mr-2" /> Platform Monitoring
              </TabsTrigger>
              <TabsTrigger value="organizations" className="text-xs font-medium py-1.5 px-3">
                <Building2 className="w-3.5 h-3.5 mr-2" /> Organizations
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs font-medium py-1.5 px-3">
                <Users className="w-3.5 h-3.5 mr-2" /> Users & Roles
              </TabsTrigger>
              <TabsTrigger value="benchmarks" className="text-xs font-medium py-1.5 px-3">
                <Settings className="w-3.5 h-3.5 mr-2" /> Sector Benchmarks
              </TabsTrigger>
              <TabsTrigger value="ai-agent" className="text-xs font-medium py-1.5 px-3">
                <Bot className="w-3.5 h-3.5 mr-2" /> AI Guardrails
              </TabsTrigger>
              <TabsTrigger value="exceptions" className="text-xs font-medium py-1.5 px-3">
                <ShieldAlert className="w-3.5 h-3.5 mr-2" /> Error Tracer
                {systemLogs.filter(l => !l.resolved).length > 0 && (
                  <Badge className="ml-2 bg-destructive text-destructive-foreground hover:bg-destructive font-black text-[9px] px-1 min-w-4 h-4 justify-center items-center rounded-full">
                    {systemLogs.filter(l => !l.resolved).length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* tab 1: Platform Monitoring */}
        <TabsContent value="monitoring" className="space-y-4 outline-none">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Service Health Cards */}
            <Card className="glass border-border lg:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">Services Telemetry Status</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Gateway proxy latency & active container stats</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3.5 pt-2">
                {[
                  { name: "API Gateway Proxy", status: "HEALTHY", latency: "14ms", details: "Port 8000 (httpx client context)", color: "bg-emerald-500" },
                  { name: "Auth Service (Supabase)", status: "HEALTHY", latency: "8ms", details: "Port 8004 (RBAC policy check)", color: "bg-emerald-500" },
                  { name: "Compliance Engine (GHG)", status: "DEGRADED", latency: "22ms", details: "Port 8001 (Missing logistics benchmark)", color: "bg-amber-500" },
                  { name: "AI Agent (Langchain/Ollama)", status: "HEALTHY", latency: "850ms", details: "Port 8003 (LLM model response)", color: "bg-emerald-500" },
                  { name: "Marketplace Trading Ledger", status: "HEALTHY", latency: "12ms", details: "Port 8002 (Redis matched trade)", color: "bg-emerald-500" },
                ].map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-muted border border-border">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${service.color}`} />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate">{service.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{service.details}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-[9px] font-bold py-0">{service.status}</Badge>
                      <p className="text-[10px] font-semibold text-foreground mt-0.5">{service.latency}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Graphs */}
            <Card className="glass border-border lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">Traffic Telemetry (Queries / Hour)</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Load distribution across microservices</CardDescription>
              </CardHeader>
              <CardContent className="h-64 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={requestVolumeData}>
                    <defs>
                      <linearGradient id="colorGateway" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="time" tick={{ fill: "currentColor", fontSize: 10 }} className="text-muted-foreground" />
                    <YAxis tick={{ fill: "currentColor", fontSize: 10 }} className="text-muted-foreground" />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px" }} />
                    <Area type="monotone" dataKey="gateway" name="API Gateway Proxy" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGateway)" />
                    <Area type="monotone" dataKey="ai" name="AI Agent Service" stroke="#10b981" fillOpacity={1} fill="url(#colorAI)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Database Connection</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">32 Active pools</p>
                <p className="text-[10px] text-muted-foreground">Response tracer: 4ms latency</p>
              </div>
            </Card>

            <Card className="glass border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Redis Cache Hit Rate</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">98.4% Hit Rate</p>
                <p className="text-[10px] text-muted-foreground">Cache response: 1ms latency</p>
              </div>
            </Card>

            <Card className="glass border-border p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">System Memory</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">42% Used</p>
                <p className="text-[10px] text-muted-foreground">Uptime duration: 18 days continuous</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* tab 2: Organizations List */}
        <TabsContent value="organizations" className="outline-none">
          <Card className="glass border-border">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Registered Customers & Enterprises</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Inspect customer accounts details and active subscriptions.</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search organization or sector..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Legal Name</TableHead>
                      <TableHead className="text-xs font-semibold py-3">CIN</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Industry Sector</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Subscription Status</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">Loading customer directories...</TableCell>
                      </TableRow>
                    ) : filteredOrgs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">No organizations found matching search criteria.</TableCell>
                      </TableRow>
                    ) : (
                      filteredOrgs.map((org) => (
                        <TableRow key={org.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="py-3 pl-4 font-semibold text-xs text-foreground">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                {org.legal_name[0]}
                              </div>
                              <span>{org.legal_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground font-mono">{org.registration_number || "−"}</TableCell>
                          <TableCell className="py-3 text-xs text-foreground">
                            <Badge variant="outline" className="border-border text-muted-foreground capitalize text-[10px]">{org.industry_sector || "Unassigned"}</Badge>
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <Badge
                              className={`text-[9px] font-bold uppercase ${org.subscription_status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                  : org.subscription_status === "TRIAL"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }`}
                            >
                              {org.subscription_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right pr-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setInspectedOrg(org);
                                setIsInspecting(true);
                              }}
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
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 space-y-3">
                {loading ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">Loading customer directories...</p>
                ) : filteredOrgs.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No organizations found matching search criteria.</p>
                ) : (
                  filteredOrgs.map((org) => (
                    <Card key={org.id} className="glass border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {org.legal_name[0]}
                          </div>
                          <div className="truncate">
                            <h3 className="font-semibold text-xs text-foreground truncate">{org.legal_name}</h3>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{org.registration_number || "No CIN"}</p>
                          </div>
                        </div>
                        <Badge
                          className={`text-[9px] font-bold uppercase ${
                            org.subscription_status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : org.subscription_status === "TRIAL"
                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              : "bg-destructive/10 text-destructive border-destructive/20"
                          }`}
                        >
                          {org.subscription_status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sector</span>
                        <Badge variant="outline" className="border-border text-muted-foreground capitalize text-[9px]">{org.industry_sector || "Unassigned"}</Badge>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setInspectedOrg(org);
                            setIsInspecting(true);
                          }}
                          className="h-8 text-xs px-3 text-foreground border-border hover:bg-muted font-medium w-full"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Inspect Details
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* tab 3: Users List */}
        <TabsContent value="users" className="outline-none">
          <Card className="glass border-border">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">User Directory & RBAC Roles</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Assign roles and verify platform access privileges.</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search user name or email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Full Name</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Email</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Registration Date</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Role Authority</TableHead>
                      {currentUser?.roles?.includes("SUPER_ADMIN") && (
                        <TableHead className="text-xs font-semibold py-3 text-right pr-4">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={currentUser?.roles?.includes("SUPER_ADMIN") ? 5 : 4} className="text-center py-6 text-xs text-muted-foreground">Loading users database...</TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={currentUser?.roles?.includes("SUPER_ADMIN") ? 5 : 4} className="text-center py-6 text-xs text-muted-foreground">No users found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="py-3 pl-4 font-semibold text-xs text-foreground">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="w-7 h-7">
                                <AvatarFallback className="bg-muted text-foreground text-[10px] font-bold">
                                  {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <span>{user.full_name || "Unassigned"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground font-mono">{user.email}</TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="py-3 text-xs">
                            {user.roles.map((role, idx) => (
                              <Badge
                                key={idx}
                                className={`text-[9px] font-bold uppercase ${role === "SUPER_ADMIN"
                                    ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                                    : role === "SALES"
                                      ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                      : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                  }`}
                              >
                                {role}
                              </Badge>
                            ))}
                          </TableCell>
                          {currentUser?.roles?.includes("SUPER_ADMIN") && (
                            <TableCell className="py-3 text-right pr-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedUserForRole(user);
                                  const matchingRole = rolesList.find(r => r.name === user.roles[0]);
                                  setSelectedRoleId(matchingRole ? matchingRole.id : (rolesList[0]?.id || ""));
                                  setSelectedOrgId(user.organization_ids?.[0] || "");
                                }}
                                className="h-8 text-xs border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                              >
                                Assign Role
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 space-y-3">
                {loading ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">Loading users database...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No users found.</p>
                ) : (
                  filteredUsers.map((user) => (
                    <Card key={user.id} className="glass border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback className="bg-muted text-foreground text-[10px] font-bold">
                              {user.full_name ? user.full_name.slice(0, 2).toUpperCase() : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="truncate">
                            <h3 className="font-semibold text-xs text-foreground truncate">{user.full_name || "Unassigned"}</h3>
                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                          {user.roles.map((role, idx) => (
                            <Badge
                              key={idx}
                              className={`text-[9px] font-bold uppercase ${
                                role === "SUPER_ADMIN"
                                  ? "bg-destructive/10 text-destructive border-destructive/20 animate-pulse"
                                  : role === "SALES"
                                  ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                  : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                              }`}
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5 text-[10px]">
                        <span className="text-muted-foreground font-semibold">Registered:</span>
                        <span className="text-muted-foreground font-mono">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>

                      {currentUser?.roles?.includes("SUPER_ADMIN") && (
                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUserForRole(user);
                              const matchingRole = rolesList.find(r => r.name === user.roles[0]);
                              setSelectedRoleId(matchingRole ? matchingRole.id : (rolesList[0]?.id || ""));
                              setSelectedOrgId(user.organization_ids?.[0] || "");
                            }}
                            className="h-8 text-xs px-3 text-foreground border-border hover:bg-muted font-medium w-full"
                          >
                            Assign Role Authority
                          </Button>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Role Definitions Section */}
          <Card className="glass border-border mt-6">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Available RBAC Role Definitions</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    System-wide permissions and scopes configured for user authorities.
                  </CardDescription>
                </div>
                {currentUser?.roles?.includes("SUPER_ADMIN") && (
                  <Button
                    onClick={() => setIsNewRoleOpen(true)}
                    className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Create New Role
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rolesList.map((role) => (
                  <div key={role.id || role.name} className="border border-border/40 rounded-lg p-3.5 bg-muted/10 hover:bg-muted/20 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground tracking-wider font-mono">{role.name}</span>
                          <Badge className={`text-[8px] font-bold ${role.is_internal ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-green-500/10 text-green-500 border-green-500/20"}`}>
                            {role.is_internal ? "INTERNAL" : "EXTERNAL / ORG"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{role.description || "No description provided."}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-bold">Permissions ({role.permissions.length})</span>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.map((perm, pIdx) => (
                          <span key={pIdx} className="text-[9px] font-mono bg-background border border-border px-1.5 py-0.5 rounded text-foreground">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* tab 4: Sector Benchmarks */}
        <TabsContent value="benchmarks" className="outline-none">
          <Card className="glass border-border">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Compliance Sector Intensity Benchmarks</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Configure reduction target criteria and emission intensity baselines.</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search sector name..."
                    value={benchmarkSearchTerm}
                    onChange={(e) => setBenchmarkSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Sector</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Sub Sector</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Compliance Year</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Target Intensity</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Reduction Target</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Obligated (CCTS)</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">Loading calculations benchmarks...</TableCell>
                      </TableRow>
                    ) : filteredBenchmarks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-6 text-xs text-muted-foreground">No sector benchmarks declared.</TableCell>
                      </TableRow>
                    ) : (
                      filteredBenchmarks.map((b) => (
                        <TableRow key={b.id} className="hover:bg-muted/20 transition-colors">
                          <TableCell className="py-3 pl-4 font-semibold text-xs text-foreground capitalize">{b.sector_name}</TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground capitalize">{b.sub_sector || "Standard"}</TableCell>
                          <TableCell className="py-3 text-xs text-muted-foreground">{b.compliance_year}</TableCell>
                          <TableCell className="py-3 text-xs font-mono text-foreground font-semibold">
                            {b.target_intensity} <span className="text-[10px] text-muted-foreground font-sans font-normal">{b.intensity_unit || "tCO2e/Crore"}</span>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-foreground font-semibold">
                            {b.reduction_target_pct ? `${b.reduction_target_pct}%` : "−"}
                          </TableCell>
                          <TableCell className="py-3 text-xs">
                            <Badge variant="outline" className={`text-[9px] font-bold ${b.is_ccts_obligated ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" : "border-border text-muted-foreground bg-muted"}`}>
                              {b.is_ccts_obligated ? "OBLIGATED" : "VOLUNTARY"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right pr-4">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteBenchmark(b.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 space-y-3">
                {loading ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">Loading calculations benchmarks...</p>
                ) : filteredBenchmarks.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No sector benchmarks declared.</p>
                ) : (
                  filteredBenchmarks.map((b) => (
                    <Card key={b.id} className="glass border-border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-xs text-foreground capitalize">{b.sector_name}</h3>
                          <p className="text-[10px] text-muted-foreground capitalize">{b.sub_sector || "Standard"}</p>
                        </div>
                        <Badge variant="outline" className={`text-[9px] font-bold ${b.is_ccts_obligated ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10" : "border-border text-muted-foreground bg-muted"}`}>
                          {b.is_ccts_obligated ? "OBLIGATED" : "VOLUNTARY"}
                        </Badge>
                      </div>

                      <div className="flex justify-between border-t border-border/50 pt-2.5 text-[10px] space-y-1 flex-col">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Compliance Year</span>
                          <span className="text-foreground font-semibold">{b.compliance_year}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Target Intensity</span>
                          <span className="text-foreground font-semibold font-mono">
                            {b.target_intensity} <span className="text-[9px] text-muted-foreground font-sans font-normal">{b.intensity_unit || "tCO2e/Crore"}</span>
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reduction Target</span>
                          <span className="text-foreground font-semibold">{b.reduction_target_pct ? `${b.reduction_target_pct}%` : "−"}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBenchmark(b.id)}
                          className="h-8 text-xs px-3 text-destructive border-border hover:bg-destructive/10 font-medium w-full flex items-center justify-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Benchmark
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* tab 5: AI Guardrails */}
        <TabsContent value="ai-agent" className="outline-none space-y-4">
          <div className="grid lg:grid-cols-3 gap-4">
            {/* Live trace list */}
            <Card className={cn("glass border-border lg:col-span-1", selectedAiRun ? "hidden lg:block" : "block")}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-foreground">AI Interactions Monitor</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">Click query log to audit LLM guardrail details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-2 h-[450px] overflow-y-auto pr-1">
                {aiLogs.map((run) => (
                  <div
                    key={run.id}
                    onClick={() => setSelectedAiRun(run)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedAiRun?.id === run.id
                        ? "bg-muted border-foreground/30"
                        : "bg-muted/40 border-border hover:bg-muted/75"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-muted-foreground">{run.id}</span>
                      <Badge className={`text-[9px] font-bold uppercase ${run.blocked ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-500"}`}>
                        {run.blocked ? "BLOCKED" : "APPROVED"}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate mt-1.5">{run.query}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-2">
                      <span className="font-medium">{run.org}</span>
                      <span>{run.duration}ms</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trace detail pane */}
            <Card className={cn("glass border-border lg:col-span-2", selectedAiRun ? "block" : "hidden lg:block")}>
              {selectedAiRun ? (
                <>
                  <CardHeader className="border-b border-border/50">
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center lg:hidden">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedAiRun(null)}
                          className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground border border-border"
                        >
                          <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                          Back to List
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-bold text-foreground">Audit Trace: {selectedAiRun.id}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Originating Account: {selectedAiRun.org}</CardDescription>
                      </div>
                      <Badge className={`text-xs font-bold uppercase ${selectedAiRun.blocked ? "bg-destructive text-destructive-foreground" : "bg-emerald-500 text-emerald-foreground"}`}>
                        {selectedAiRun.blocked ? "Guardrail Blocked" : "Approved"}
                      </Badge>
                    </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4 h-[420px] overflow-y-auto">
                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User Query</h4>
                      <p className="text-xs text-foreground bg-muted p-3 rounded-xl border border-border mt-1.5 font-medium leading-relaxed">
                        "{selectedAiRun.query}"
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Agent Response</h4>
                      <p className={`text-xs p-3 rounded-xl border mt-1.5 leading-relaxed ${selectedAiRun.blocked ? "bg-destructive/5 border-destructive/20 text-destructive font-medium" : "bg-card border-border text-foreground font-medium"}`}>
                        {selectedAiRun.answer}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Guardrail Checks</h4>
                        <div className="space-y-2">
                          {[
                            { name: "Hallucination Margin", value: selectedAiRun.guardrailDetails.hallucination_score * 100, color: "bg-blue-500" },
                            { name: "Toxicity Audit Score", value: selectedAiRun.guardrailDetails.toxic_score * 100, color: "bg-destructive" },
                          ].map((g, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-muted border border-border">
                              <div className="flex justify-between text-[10px] font-semibold text-foreground mb-1">
                                <span>{g.name}</span>
                                <span>{g.value.toFixed(0)}%</span>
                              </div>
                              <Progress value={g.value} className="h-1 bg-background" />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Metadata Details</h4>
                        <div className="p-2.5 rounded-xl bg-muted border border-border space-y-1.5 text-xs text-muted-foreground">
                          <div className="flex justify-between">
                            <span>Processing Delay:</span>
                            <span className="font-semibold text-foreground">{selectedAiRun.duration}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Token Consumption:</span>
                            <span className="font-semibold text-foreground">{selectedAiRun.tokens} tokens</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Prompt Injection Check:</span>
                            <Badge variant="outline" className={`text-[9px] py-0 ${selectedAiRun.guardrailDetails.prompt_injection ? "border-destructive text-destructive" : "border-border text-muted-foreground"}`}>
                              {selectedAiRun.guardrailDetails.prompt_injection ? "VIOLATION" : "CLEAN"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedAiRun.sources.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Semantic Source Document Context</h4>
                        {selectedAiRun.sources.map((src, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-muted border border-border mt-2 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                              <span className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                {src.doc}
                              </span>
                              <span className="text-[10px] text-muted-foreground">{(src.similarity * 100).toFixed(0)}% match</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                              "... {src.text} ..."
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </>
              ) : (
                <div className="h-[450px] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                  <Bot className="w-12 h-12 text-muted-foreground/30 mb-2 animate-bounce" />
                  <p className="text-sm font-semibold">Select an interaction run from the tracer to display deep audit trails.</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* tab 6: Error Tracer exceptions */}
        <TabsContent value="exceptions" className="outline-none">
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="text-sm font-bold text-foreground">System Exception & Calculation Crashes Tracer</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Troubleshoot pipeline crashes, missing settings parameters, and database query faults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemLogs.map((log) => (
                <Card key={log.id} className={`glass border-border overflow-hidden ${log.resolved ? "opacity-60" : ""}`}>
                  <CardHeader className="p-4 bg-muted/40 border-b border-border/50 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Badge className={`text-[9px] font-black uppercase ${
                        log.severity === "ERROR"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-amber-500 text-background"
                      }`}>
                        {log.severity}
                      </Badge>
                      <span className="text-xs font-semibold text-foreground">{log.service} Service Exception</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{log.timestamp}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!log.resolved ? (
                        <>
                          {log.message.includes("logistics") && (
                            <Button
                              size="sm"
                              onClick={handlePresetLogisticsBenchmark}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 h-7 text-[10px] font-bold px-2.5"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Configure Sector Benchmark
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveLog(log.id)}
                            className="border-border text-foreground hover:bg-muted h-7 text-[10px] font-bold px-2.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Resolve
                          </Button>
                        </>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-[9px] font-bold">
                          RESOLVED
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    <p className="text-xs text-foreground font-bold leading-snug">{log.message}</p>
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span className="font-bold flex items-center gap-1"><Terminal className="w-3 h-3 text-muted-foreground" /> Stack Trace details</span>
                        <span>Trace ID: {log.id}</span>
                      </div>
                      <pre className="p-3 bg-card border border-border rounded-xl text-[10px] text-muted-foreground font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                        {log.payload}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </main>

      {/* Customer Inspection Drawer (Sheet) */}
      <Sheet open={isInspecting} onOpenChange={setIsInspecting}>
        <SheetContent className="sm:max-w-xl bg-background border-l border-border text-foreground overflow-y-auto">
          {inspectedOrg && (
            <>
              <SheetHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {inspectedOrg.legal_name[0]}
                  </div>
                  <div>
                    <SheetTitle className="text-sm font-black text-foreground">{inspectedOrg.legal_name}</SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">CIN: {inspectedOrg.registration_number || "−"}</SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="py-5 space-y-6">
                {/* Account details */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Subscription Profile</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground font-semibold">Tier Plan</p>
                      <p className="text-sm font-bold text-foreground mt-1 capitalize">{inspectedOrg.subscription_status.toLowerCase()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted border border-border">
                      <p className="text-[10px] text-muted-foreground font-semibold">Assigned Sector</p>
                      <p className="text-sm font-bold text-foreground mt-1 capitalize">{inspectedOrg.industry_sector || "Unassigned"}</p>
                    </div>
                  </div>
                </div>

                {/* Carbon credit balance */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Carbon Credit Registry Balance</h3>
                  <div className="p-4 rounded-xl bg-muted border border-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-muted-foreground">Available Credits:</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">12,450 tCO₂e</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className="text-xs text-muted-foreground">Retired Credits:</span>
                      </div>
                      <span className="text-xs font-mono font-bold text-foreground">3,200 tCO₂e</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                      <span className="text-xs font-bold text-foreground">Total Transactions Value:</span>
                      <span className="text-xs font-mono font-black text-foreground">₹4.8L</span>
                    </div>
                  </div>
                </div>

                {/* Audit upload history */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Compliance Audits & Evidence Vault</h3>
                  <div className="p-3 rounded-xl bg-muted border border-border space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-500" />
                        <div>
                          <p className="font-semibold text-foreground">audit_compliance_report_FY25.pdf</p>
                          <p className="text-[10px] text-muted-foreground">Uploaded 2026-05-18 by Ajay V</p>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold">VERIFIED</Badge>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-card border border-border/50">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500 animate-pulse" />
                        <div>
                          <p className="font-semibold text-foreground">logistics_manifest_June_FY26.xlsx</p>
                          <p className="text-[10px] text-muted-foreground">Uploaded 2026-06-03 by System Agent</p>
                        </div>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] font-bold">CALC_FAILED</Badge>
                    </div>
                  </div>
                </div>

                {/* AI Agent Interaction usage */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">AI Agent Usage Tracer</h3>
                  <div className="p-3 rounded-xl bg-muted border border-border space-y-2 text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Total Chat Interactions:</span>
                      <span className="font-semibold text-foreground">42 sessions</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tokens Consumed:</span>
                      <span className="font-semibold text-foreground">124.5K tokens</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Guardrail Interceptions:</span>
                      <Badge variant="outline" className="border-destructive/30 text-destructive bg-destructive/10 text-[9px] font-bold">
                        1 VIOLATION
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Action Controls</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        toast.success("Impersonation active. Redirecting to user space...");
                      }}
                      className="bg-foreground text-background hover:bg-foreground/90 text-xs h-8"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Impersonate User
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast.success("Carbon Calculation queue triggered for " + inspectedOrg.legal_name);
                      }}
                      className="border-border text-foreground hover:bg-muted text-xs h-8"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-2" />
                      Recalculate Emissions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast.success("Evidence quota reset for this month.");
                      }}
                      className="border-border text-foreground hover:bg-muted text-xs h-8"
                    >
                      Reset Upload Quota
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Sector Benchmark Dialog */}
      <Dialog open={isNewBenchmarkOpen} onOpenChange={setIsNewBenchmarkOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-foreground">Configure Sector Compliance Benchmark</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBenchmark} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sector_name" className="text-xs text-muted-foreground">Sector Name</Label>
                <Input
                  id="sector_name"
                  placeholder="e.g. logistics"
                  value={newBenchmark.sector_name}
                  onChange={(e) => setNewBenchmark((prev) => ({ ...prev, sector_name: e.target.value }))}
                  required
                  className="bg-card border-border text-xs h-9 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sub_sector" className="text-xs text-muted-foreground">Sub Sector / Process</Label>
                <Input
                  id="sub_sector"
                  placeholder="e.g. Standard"
                  value={newBenchmark.sub_sector}
                  onChange={(e) => setNewBenchmark((prev) => ({ ...prev, sub_sector: e.target.value }))}
                  className="bg-card border-border text-xs h-9 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="target_intensity" className="text-xs text-muted-foreground">Intensity Target Baseline</Label>
                <Input
                  id="target_intensity"
                  type="number"
                  step="0.0001"
                  value={newBenchmark.target_intensity}
                  onChange={(e) => setNewBenchmark((prev) => ({ ...prev, target_intensity: e.target.value }))}
                  required
                  className="bg-card border-border text-xs h-9 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="intensity_unit" className="text-xs text-muted-foreground">Measurement Unit</Label>
                <Input
                  id="intensity_unit"
                  value={newBenchmark.intensity_unit}
                  onChange={(e) => setNewBenchmark((prev) => ({ ...prev, intensity_unit: e.target.value }))}
                  required
                  className="bg-card border-border text-xs h-9 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="compliance_year" className="text-xs text-muted-foreground">Compliance Target Year</Label>
                <Input
                  id="compliance_year"
                  type="number"
                  value={newBenchmark.compliance_year}
                  onChange={(e) => setNewBenchmark((prev) => ({ ...prev, compliance_year: e.target.value }))}
                  required
                  className="bg-card border-border text-xs h-9 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reduction_target_pct" className="text-xs text-muted-foreground">Reduction target (% YoY)</Label>
                <Input
                  id="reduction_target_pct"
                  type="number"
                  step="0.1"
                  value={newBenchmark.reduction_target_pct}
                  onChange={(e) => setNewBenchmark((prev) => ({ ...prev, reduction_target_pct: e.target.value }))}
                  className="bg-card border-border text-xs h-9 text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regulatory_framework" className="text-xs text-muted-foreground">Regulatory Authority Framework</Label>
              <Input
                id="regulatory_framework"
                placeholder="e.g. BEE PAT / Voluntary Registry"
                value={newBenchmark.regulatory_framework}
                onChange={(e) => setNewBenchmark((prev) => ({ ...prev, regulatory_framework: e.target.value }))}
                className="bg-card border-border text-xs h-9 text-foreground"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="is_ccts_obligated"
                checked={newBenchmark.is_ccts_obligated}
                onChange={(e) => setNewBenchmark((prev) => ({ ...prev, is_ccts_obligated: e.target.checked }))}
                className="rounded border-border bg-card text-foreground"
              />
              <Label htmlFor="is_ccts_obligated" className="text-xs font-semibold text-foreground cursor-pointer">
                Obligated Entity under Carbon Credit Trading Scheme (CCTS)
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewBenchmarkOpen(false)}
                className="border-border text-foreground hover:bg-muted text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 text-xs h-9"
              >
                Create Benchmark
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Role Assignment Dialog */}
      <Dialog open={selectedUserForRole !== null} onOpenChange={(open) => !open && setSelectedUserForRole(null)}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-foreground">Modify User RBAC Role Authority</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedUserForRole && (
              <>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Target User: <span className="font-semibold text-foreground">{selectedUserForRole.full_name || "Unassigned"}</span></p>
                  <p>Target Account Email: <span className="font-semibold text-foreground font-mono">{selectedUserForRole.email}</span></p>
                  <p>Current Authority: <span className="font-semibold text-foreground">{selectedUserForRole.roles.join(", ")}</span></p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role_select" className="text-xs text-muted-foreground">Select New RBAC Level</Label>
                  <Select value={selectedRoleId} onValueChange={(val) => { if (val) setSelectedRoleId(val); }}>
                    <SelectTrigger className="bg-card border-border text-xs h-9 text-foreground">
                      <SelectValue placeholder="Select role level" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {rolesList.map((role) => (
                        <SelectItem key={role.id} value={role.id} className="text-xs">
                          {role.name} {role.is_internal ? " (Internal)" : ""} {role.description ? ` - ${role.description}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRoleId && (() => {
                  const selectedRoleObj = rolesList.find(r => r.id === selectedRoleId);
                  const needsOrg = selectedRoleObj && !selectedRoleObj.is_internal && !["SUPER_ADMIN", "SALES", "GOVT_AUDITOR"].includes(selectedRoleObj.name);
                  if (!needsOrg) return null;
                  return (
                    <div className="space-y-1.5">
                      <Label htmlFor="org_select" className="text-xs text-muted-foreground">Select Scope Organization</Label>
                      <Select value={selectedOrgId} onValueChange={(val) => setSelectedOrgId(val || "")}>
                        <SelectTrigger className="bg-card border-border text-xs h-9 text-foreground">
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id} className="text-xs">
                              {org.legal_name} {org.trade_name ? `(${org.trade_name})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })()}

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedUserForRole(null)}
                    className="border-border text-foreground hover:bg-muted text-xs h-9"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignRole}
                    className="bg-foreground text-background hover:bg-foreground/90 text-xs h-9"
                  >
                    Assign Role Authority
                  </Button>
                </DialogFooter>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={isNewRoleOpen} onOpenChange={setIsNewRoleOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-foreground">Create New RBAC Role</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRole} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="role_name" className="text-xs text-muted-foreground">Role Name</Label>
              <Input
                id="role_name"
                placeholder="e.g. AUDITOR"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                required
                className="h-9 text-xs bg-card border-border text-foreground"
              />
              <p className="text-[10px] text-muted-foreground">Will be auto-formatted to UPPERCASE_WITH_UNDERSCORES.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role_desc" className="text-xs text-muted-foreground">Description</Label>
              <Input
                id="role_desc"
                placeholder="e.g. Audit validator for compliance files"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="h-9 text-xs bg-card border-border text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role_perms" className="text-xs text-muted-foreground">Permissions (comma-separated)</Label>
              <Input
                id="role_perms"
                placeholder="e.g. read:audits, write:audits"
                value={newRole.permissions}
                onChange={(e) => setNewRole({ ...newRole, permissions: e.target.value })}
                className="h-9 text-xs bg-card border-border text-foreground"
              />
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="role_is_internal"
                checked={newRole.is_internal}
                onChange={(e) => setNewRole({ ...newRole, is_internal: e.target.checked })}
                className="rounded border-border bg-card text-foreground"
              />
              <Label htmlFor="role_is_internal" className="text-xs font-semibold text-foreground cursor-pointer">
                Is Internal Role (IndiCarbon internal operations only)
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewRoleOpen(false)}
                className="border-border text-foreground hover:bg-muted text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 text-xs h-9"
              >
                Create Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
