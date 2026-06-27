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
  Wallet,
  ArrowDownRight,
  IndianRupee,
  Workflow,
  MessageSquare,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { listUsers, listOrganizations, assignRole, listRoles, createRole, createUser, deleteUser, deleteOrganization, getOrganizationTokenStats } from "@/lib/api/auth";
import { listBenchmarks, createBenchmark, deleteBenchmark } from "@/lib/api/compliance";
import { getAllWallets, adminAddFunds, getAllWalletTransactions } from "@/lib/api/wallet";
import { getSystemLogs, getSystemLogStats, resolveSystemLog, bulkResolveSystemLogs } from "@/lib/api/system-logs";
import { getA2AStats, listA2ATasks } from "@/lib/api/ai";
import { UserProfile, OrganizationResponse, SectorBenchmarkResponse, RoleResponse, WalletResponse, WalletTransactionResponse, SystemLogEntry, SystemLogStats, SystemLogFilters, A2ATaskSummary, A2AActivityStats } from "@/lib/api/types";

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
  const roles = currentUser?.roles || [];
  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const isSales = roles.includes("SALES");
  const isGovtAuditor = roles.includes("GOVT_AUDITOR");

  // Default active tab based on role permissions
  const defaultTab = isSales ? "organizations" : (isGovtAuditor ? "benchmarks" : "monitoring");
  
  // Tabs & Searching
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [benchmarkSearchTerm, setBenchmarkSearchTerm] = useState("");

  // Data State
  const [organizations, setOrganizations] = useState<OrganizationResponse[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [benchmarks, setBenchmarks] = useState<SectorBenchmarkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenStats, setTokenStats] = useState<Record<string, number>>({});

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

  // New User State
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    password: "",
    role_id: "",
    organization_id: "",
  });

  // Roles State
  const [rolesList, setRolesList] = useState<RoleResponse[]>([]);
  const [isNewRoleOpen, setIsNewRoleOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    is_internal: false,
    permissions: "",
  });

  // Wallet State
  const [wallets, setWallets] = useState<WalletResponse[]>([]);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransactionResponse[]>([]);
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [addFundsOrgId, setAddFundsOrgId] = useState("");
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [addFundsDescription, setAddFundsDescription] = useState("");
  const [walletSearchTerm, setWalletSearchTerm] = useState("");

  // System Logs State (live from API)
  const [systemLogs, setSystemLogs] = useState<SystemLogEntry[]>([]);
  const [systemLogStats, setSystemLogStats] = useState<SystemLogStats | null>(null);
  const [systemLogsTotal, setSystemLogsTotal] = useState(0);
  const [systemLogsLoading, setSystemLogsLoading] = useState(false);
  const [logFilters, setLogFilters] = useState<SystemLogFilters>({ limit: 50, offset: 0 });
  const [logSearchInput, setLogSearchInput] = useState("");
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

  // A2A Protocol Admin State
  const [a2aTasks, setA2aTasks] = useState<A2ATaskSummary[]>([]);
  const [a2aStats, setA2aStats] = useState<A2AActivityStats | null>(null);
  const [a2aLoading, setA2aLoading] = useState(false);
  const [a2aFilterState, setA2aFilterState] = useState<string>("");
  const [a2aFilterOrg, setA2aFilterOrg] = useState<string>("");
  const [a2aSearchTerm, setA2aSearchTerm] = useState("");
  const [a2aInspectedTask, setA2aInspectedTask] = useState<A2ATaskSummary | null>(null);

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

  // Fetch system logs
  const fetchSystemLogs = async (filters: SystemLogFilters = logFilters) => {
    if (!isSuperAdmin && !isGovtAuditor) return;
    try {
      setSystemLogsLoading(true);
      const [logsData, statsData] = await Promise.all([
        getSystemLogs(filters),
        getSystemLogStats(filters.organization_id),
      ]);
      setSystemLogs(logsData.logs);
      setSystemLogsTotal(logsData.total);
      setSystemLogStats(statsData);
      setSelectedLogIds(new Set());
    } catch (err) {
      console.error("Failed to load system logs:", err);
    } finally {
      setSystemLogsLoading(false);
    }
  };

  const handleLogFilterChange = (updates: Partial<SystemLogFilters>) => {
    const newFilters = { ...logFilters, ...updates, offset: 0 };
    setLogFilters(newFilters);
    fetchSystemLogs(newFilters);
  };

  const handleLogSearch = () => {
    handleLogFilterChange({ search: logSearchInput || undefined });
  };

  const handleResolveSystemLog = async (logId: string) => {
    try {
      await resolveSystemLog(logId);
      toast.success("Log entry resolved.");
      fetchSystemLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to resolve log.");
    }
  };

  const handleBulkResolve = async () => {
    if (selectedLogIds.size === 0) return;
    try {
      const result = await bulkResolveSystemLogs(Array.from(selectedLogIds));
      toast.success(`${result.resolved_count} log(s) resolved.`);
      fetchSystemLogs();
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk resolve.");
    }
  };

  const toggleLogSelection = (id: string) => {
    setSelectedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const promises: Promise<any>[] = [];
      
      // 1. Organizations (Super Admin, Sales)
      if (isSuperAdmin || isSales) {
        promises.push(listOrganizations().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }
      
      // 2. Users (Super Admin only)
      if (isSuperAdmin) {
        promises.push(listUsers().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }
      
      // 3. Benchmarks (Super Admin, Govt Auditor)
      if (isSuperAdmin || isGovtAuditor) {
        promises.push(listBenchmarks().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }
      
      // 4. Roles (All internal admins need roles list)
      promises.push(listRoles().catch(() => []));
      
      // 5. Wallets (Super Admin, Sales)
      if (isSuperAdmin || isSales) {
        promises.push(getAllWallets().catch(() => []));
        promises.push(getAllWalletTransactions().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
        promises.push(Promise.resolve([]));
      }
      
      // 6. Token Stats (Super Admin, Sales)
      if (isSuperAdmin || isSales) {
        promises.push(getOrganizationTokenStats().catch(() => []));
      } else {
        promises.push(Promise.resolve([]));
      }
      
      const [orgList, userList, benchmarkList, roleList, walletList, txnList, tokenList] = await Promise.all(promises);
      
      setOrganizations(orgList);
      setUsers(userList);
      setBenchmarks(benchmarkList);
      setRolesList(roleList);
      setWallets(walletList);
      setWalletTransactions(txnList);
      
      const statsMap: Record<string, number> = {};
      if (Array.isArray(tokenList)) {
        tokenList.forEach((stat: any) => {
          statsMap[stat.organization_id] = stat.total_tokens;
        });
      }
      setTokenStats(statsMap);
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

  const fetchA2AData = async () => {
    if (!isSuperAdmin) return;
    setA2aLoading(true);
    try {
      const [tasks, stats] = await Promise.all([
        listA2ATasks({ limit: 100 }).catch(() => []),
        getA2AStats().catch(() => null),
      ]);
      setA2aTasks(tasks);
      if (stats) setA2aStats(stats);
    } catch {}
    setA2aLoading(false);
  };

  useEffect(() => {
    fetchData();
    if (isSuperAdmin || isGovtAuditor) {
      fetchSystemLogs();
    }
    if (isSuperAdmin) {
      fetchA2AData();
    }
  }, [currentUser]);

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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user? Their email and phone number will be freed up for new registrations.")) return;
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deactivated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate user.");
    }
  };

  const handleDeleteOrganization = async (orgId: string) => {
    if (!confirm("Are you sure you want to deactivate this organization? This will release its registration number and tax ID.")) return;
    try {
      await deleteOrganization(orgId);
      setOrganizations((prev) => prev.filter((o) => o.id !== orgId));
      toast.success("Organization deactivated successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to deactivate organization.");
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

  // Create User handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedRoleObj = rolesList.find(r => r.id === newUser.role_id);
      const needsOrg = selectedRoleObj && !selectedRoleObj.is_internal && !["SUPER_ADMIN", "SALES", "GOVT_AUDITOR"].includes(selectedRoleObj.name);

      const payload = {
        email: newUser.email,
        full_name: newUser.full_name,
        password: newUser.password || undefined,
        role_id: newUser.role_id,
        organization_id: needsOrg ? (newUser.organization_id || undefined) : undefined,
      };

      const res = await createUser(payload);
      setUsers((prev) => [res, ...prev]);
      setIsNewUserOpen(false);
      setNewUser({ email: "", full_name: "", password: "", role_id: "", organization_id: "" });
      toast.success(`User '${res.full_name || res.email}' created successfully.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create user.");
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

  // Resolve Error log helper (delegates to API)
  const handleResolveLog = (id: string) => {
    handleResolveSystemLog(id);
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
          { label: "Platform Wallet Balance", value: `₹${wallets.reduce((a, w) => a + w.balance, 0).toLocaleString()}`, icon: Wallet, color: "text-teal-500", bg: "bg-teal-500/10" },
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
                  <Icon className={`w-5 h-5 ${stat.color} ${"animate" in stat && stat.animate ? "animate-bounce" : ""}`} />
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
              {(isSuperAdmin || isGovtAuditor) && (
                <TabsTrigger value="monitoring" className="text-xs font-medium py-1.5 px-3">
                  <Activity className="w-3.5 h-3.5 mr-2" /> Platform Monitoring
                </TabsTrigger>
              )}
              {(isSuperAdmin || isSales) && (
                <TabsTrigger value="organizations" className="text-xs font-medium py-1.5 px-3">
                  <Building2 className="w-3.5 h-3.5 mr-2" /> Organizations
                </TabsTrigger>
              )}
              {isSuperAdmin && (
                <TabsTrigger value="users" className="text-xs font-medium py-1.5 px-3">
                  <Users className="w-3.5 h-3.5 mr-2" /> Users & Roles
                </TabsTrigger>
              )}
              {(isSuperAdmin || isGovtAuditor) && (
                <TabsTrigger value="benchmarks" className="text-xs font-medium py-1.5 px-3">
                  <Settings className="w-3.5 h-3.5 mr-2" /> Sector Benchmarks
                </TabsTrigger>
              )}
              {(isSuperAdmin || isSales) && (
                <TabsTrigger value="wallets" className="text-xs font-medium py-1.5 px-3">
                  <Wallet className="w-3.5 h-3.5 mr-2" /> Wallets & Ledger
                </TabsTrigger>
              )}
              {isSuperAdmin && (
                <TabsTrigger value="ai-agent" className="text-xs font-medium py-1.5 px-3">
                  <Bot className="w-3.5 h-3.5 mr-2" /> AI Guardrails
                </TabsTrigger>
              )}
              {(isSuperAdmin || isGovtAuditor) && (
                <TabsTrigger value="exceptions" className="text-xs font-medium py-1.5 px-3">
                  <ShieldAlert className="w-3.5 h-3.5 mr-2" /> System Logs
                  {(systemLogStats?.unresolved ?? 0) > 0 && (
                    <Badge className="ml-2 bg-destructive text-destructive-foreground hover:bg-destructive font-black text-[9px] px-1 min-w-4 h-4 justify-center items-center rounded-full">
                      {systemLogStats!.unresolved}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
              {isSuperAdmin && (
                <TabsTrigger value="a2a" className="text-xs font-medium py-1.5 px-3">
                  <Workflow className="w-3.5 h-3.5 mr-2" /> A2A Protocol
                  {(a2aStats?.total_tasks ?? 0) > 0 && (
                    <Badge className="ml-2 bg-blue-500/10 text-blue-500 font-bold text-[9px] px-1.5 h-4 justify-center items-center rounded-full">
                      {a2aStats!.total_tasks}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
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
                      <TableHead className="text-xs font-semibold py-3">Token Consumption</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">Loading customer directories...</TableCell>
                      </TableRow>
                    ) : filteredOrgs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">No organizations found matching search criteria.</TableCell>
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
                          <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                            {tokenStats[org.id]?.toLocaleString() || "0"} tokens
                          </TableCell>
                          <TableCell className="py-3 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setInspectedOrg(org);
                                  setIsInspecting(true);
                                }}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                title="Inspect Details"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {currentUser?.roles?.includes("SUPER_ADMIN") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteOrganization(org.id)}
                                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  title="Deactivate Organization"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
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

                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Tokens Used</span>
                        <span className="text-[10px] text-muted-foreground font-mono font-semibold">{tokenStats[org.id]?.toLocaleString() || "0"} tokens</span>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setInspectedOrg(org);
                            setIsInspecting(true);
                          }}
                          className="h-8 text-xs px-3 text-foreground border-border hover:bg-muted font-medium flex-1"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" /> Inspect Details
                        </Button>
                        {currentUser?.roles?.includes("SUPER_ADMIN") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteOrganization(org.id)}
                            className="h-8 text-xs px-3 border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 text-destructive font-medium flex-1"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Disable
                          </Button>
                        )}
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
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search user name or email..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                    />
                  </div>
                  {currentUser?.roles?.includes("SUPER_ADMIN") && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setNewUser({
                          email: "",
                          full_name: "",
                          password: "",
                          role_id: rolesList[0]?.id || "",
                          organization_id: "",
                        });
                        setIsNewUserOpen(true);
                      }}
                      className="h-8 text-xs bg-foreground text-background hover:bg-foreground/90 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Create User
                    </Button>
                  )}
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
                              <div className="flex items-center justify-end gap-2">
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
                                {user.id !== currentUser?.user_id && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="h-8 text-xs border border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 text-destructive font-medium"
                                    title="Deactivate User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    Disable
                                  </Button>
                                )}
                              </div>
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
                        <div className="flex gap-2 pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUserForRole(user);
                              const matchingRole = rolesList.find(r => r.name === user.roles[0]);
                              setSelectedRoleId(matchingRole ? matchingRole.id : (rolesList[0]?.id || ""));
                              setSelectedOrgId(user.organization_ids?.[0] || "");
                            }}
                            className="h-8 text-xs px-3 text-foreground border-border hover:bg-muted font-medium flex-1"
                          >
                            Assign Role Authority
                          </Button>
                          {user.id !== currentUser?.user_id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteUser(user.id)}
                              className="h-8 text-xs px-3 border-destructive/20 hover:border-destructive/40 hover:bg-destructive/10 text-destructive font-medium flex-1"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Disable
                            </Button>
                          )}
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

        {/* tab 5: Wallets & Transaction Ledger */}
        <TabsContent value="wallets" className="outline-none space-y-4">
          {/* Wallet Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Wallets</p>
                  <p className="text-2xl font-black tracking-tight text-foreground mt-1">{wallets.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Platform Balance</p>
                  <p className="text-2xl font-black tracking-tight text-foreground mt-1">
                    ₹{wallets.reduce((acc, w) => acc + w.balance, 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Total Transactions</p>
                  <p className="text-2xl font-black tracking-tight text-foreground mt-1">{walletTransactions.length}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Wallets Table + Add Funds */}
          <Card className="glass border-border">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Organization Wallets</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">View balances and add funds to organization wallets.</CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setAddFundsOrgId(organizations[0]?.id || "");
                    setAddFundsAmount("");
                    setAddFundsDescription("");
                    setIsAddFundsOpen(true);
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90 font-medium h-9 text-xs"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Organization</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Wallet ID</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Currency</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Balance</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {wallets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-xs text-muted-foreground">
                          No wallets created yet. Add funds to an organization to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      wallets.map((w) => {
                        const org = organizations.find((o) => o.id === w.organization_id);
                        return (
                          <TableRow key={w.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="py-3 pl-4 font-semibold text-xs text-foreground">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  {org ? org.legal_name[0] : "?"}
                                </div>
                                <span>{org?.legal_name || w.organization_id.substring(0, 8)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-xs text-muted-foreground font-mono">{w.id.substring(0, 12)}…</TableCell>
                            <TableCell className="py-3 text-xs text-muted-foreground">{w.currency}</TableCell>
                            <TableCell className="py-3 text-right">
                              <span className={`text-sm font-bold font-mono ${w.balance > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                                ₹{w.balance.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell className="py-3 text-right pr-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setAddFundsOrgId(w.organization_id);
                                  setAddFundsAmount("");
                                  setAddFundsDescription("");
                                  setIsAddFundsOpen(true);
                                }}
                                className="h-8 text-xs border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Funds
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden p-4 space-y-3">
                {wallets.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No wallets created yet.</p>
                ) : (
                  wallets.map((w) => {
                    const org = organizations.find((o) => o.id === w.organization_id);
                    return (
                      <Card key={w.id} className="glass border-border p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              {org ? org.legal_name[0] : "?"}
                            </div>
                            <div className="truncate">
                              <h3 className="font-semibold text-xs text-foreground truncate">{org?.legal_name || "Unknown Org"}</h3>
                              <p className="text-[10px] text-muted-foreground font-mono truncate">{w.id.substring(0, 12)}…</p>
                            </div>
                          </div>
                          <span className={`text-sm font-bold font-mono ${w.balance > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                            ₹{w.balance.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-end pt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setAddFundsOrgId(w.organization_id);
                              setAddFundsAmount("");
                              setAddFundsDescription("");
                              setIsAddFundsOpen(true);
                            }}
                            className="h-8 text-xs px-3 text-foreground border-border hover:bg-muted font-medium w-full"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Funds
                          </Button>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Transaction Ledger */}
          <Card className="glass border-border">
            <CardHeader className="pb-4 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">Transaction Ledger</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Complete wallet transaction history across all organizations.</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search by type or description..."
                    value={walletSearchTerm}
                    onChange={(e) => setWalletSearchTerm(e.target.value)}
                    className="pl-8 h-8 text-xs w-64 bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/50 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold py-3 pl-4">Date</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Organization</TableHead>
                      <TableHead className="text-xs font-semibold py-3">Type</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Amount</TableHead>
                      <TableHead className="text-xs font-semibold py-3 text-right">Balance After</TableHead>
                      <TableHead className="text-xs font-semibold py-3 pr-4">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border/30">
                    {walletTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">No transactions yet.</TableCell>
                      </TableRow>
                    ) : (
                      walletTransactions
                        .filter(
                          (t) =>
                            !walletSearchTerm ||
                            t.txn_type.toLowerCase().includes(walletSearchTerm.toLowerCase()) ||
                            (t.description && t.description.toLowerCase().includes(walletSearchTerm.toLowerCase()))
                        )
                        .map((txn) => {
                          const org = organizations.find((o) => o.id === txn.organization_id);
                          const isCredit = txn.amount > 0;
                          return (
                            <TableRow key={txn.id} className="hover:bg-muted/20 transition-colors">
                              <TableCell className="py-3 pl-4 text-xs text-muted-foreground font-mono">
                                {txn.created_at ? new Date(txn.created_at).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                              </TableCell>
                              <TableCell className="py-3 text-xs text-foreground font-semibold">
                                {org?.legal_name || txn.organization_id.substring(0, 8)}
                              </TableCell>
                              <TableCell className="py-3">
                                <Badge
                                  className={`text-[9px] font-bold uppercase ${
                                    txn.txn_type === "ADMIN_CREDIT"
                                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                      : txn.txn_type === "TRADE_CREDIT"
                                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                      : txn.txn_type === "TRADE_DEBIT"
                                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                      : "bg-destructive/10 text-destructive border-destructive/20"
                                  }`}
                                >
                                  {txn.txn_type.replace("_", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 text-right">
                                <span className={`text-xs font-bold font-mono flex items-center justify-end gap-1 ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                                  {isCredit ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                  {isCredit ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell className="py-3 text-right text-xs font-mono text-muted-foreground">₹{txn.balance_after.toLocaleString()}</TableCell>
                              <TableCell className="py-3 pr-4 text-xs text-muted-foreground truncate max-w-[200px]">{txn.description || "—"}</TableCell>
                            </TableRow>
                          );
                        })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="lg:hidden p-4 space-y-3">
                {walletTransactions.length === 0 ? (
                  <p className="text-center py-6 text-xs text-muted-foreground">No transactions yet.</p>
                ) : (
                  walletTransactions
                    .filter(
                      (t) =>
                        !walletSearchTerm ||
                        t.txn_type.toLowerCase().includes(walletSearchTerm.toLowerCase()) ||
                        (t.description && t.description.toLowerCase().includes(walletSearchTerm.toLowerCase()))
                    )
                    .map((txn) => {
                      const org = organizations.find((o) => o.id === txn.organization_id);
                      const isCredit = txn.amount > 0;
                      return (
                        <Card key={txn.id} className="glass border-border p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Badge
                                className={`text-[9px] font-bold uppercase shrink-0 ${
                                  txn.txn_type === "ADMIN_CREDIT"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : txn.txn_type === "TRADE_CREDIT"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : txn.txn_type === "TRADE_DEBIT"
                                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                    : "bg-destructive/10 text-destructive border-destructive/20"
                                }`}
                              >
                                {txn.txn_type.replace("_", " ")}
                              </Badge>
                              <span className="text-xs font-semibold text-foreground truncate">{org?.legal_name || "Unknown"}</span>
                            </div>
                            <span className={`text-sm font-bold font-mono ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                              {isCredit ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground">
                            <span>{txn.description || "—"}</span>
                            <span className="font-mono">Bal: ₹{txn.balance_after.toLocaleString()}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {txn.created_at ? new Date(txn.created_at).toLocaleString("en-IN") : "—"}
                          </div>
                        </Card>
                      );
                    })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* tab 6: AI Guardrails */}
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

        {/* tab 7: System Logs (live from API) */}
        <TabsContent value="exceptions" className="outline-none space-y-4">
          {/* Stats Overview */}
          {systemLogStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Logs", value: systemLogStats.total, color: "text-blue-500", bg: "bg-blue-500/10" },
                { label: "Unresolved", value: systemLogStats.unresolved, color: "text-destructive", bg: "bg-destructive/10" },
                { label: "Errors", value: systemLogStats.errors, color: "text-red-500", bg: "bg-red-500/10" },
                { label: "Warnings", value: systemLogStats.warnings, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: "Critical", value: systemLogStats.criticals, color: "text-rose-600", bg: "bg-rose-600/10" },
              ].map((stat, idx) => (
                <Card key={idx} className="glass border-border">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-black tracking-tight text-foreground mt-0.5">{stat.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <ShieldAlert className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Filters Bar */}
          <Card className="glass border-border">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search error messages..."
                    value={logSearchInput}
                    onChange={(e) => setLogSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogSearch()}
                    className="pl-8 h-8 text-xs bg-background border-border text-foreground placeholder:text-muted-foreground/50"
                  />
                </div>

                {/* Organization Filter */}
                <Select
                  value={logFilters.organization_id || "_all"}
                  onValueChange={(val) => handleLogFilterChange({ organization_id: val === "_all" ? undefined : val || undefined })}
                >
                  <SelectTrigger className="bg-background border-border text-xs h-8 w-[180px] text-foreground">
                    <SelectValue placeholder="All Organizations" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="_all" className="text-xs">All Organizations</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id} className="text-xs">{org.legal_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Service Filter */}
                <Select
                  value={logFilters.service || "_all"}
                  onValueChange={(val) => handleLogFilterChange({ service: val === "_all" ? undefined : val || undefined })}
                >
                  <SelectTrigger className="bg-background border-border text-xs h-8 w-[140px] text-foreground">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="_all" className="text-xs">All Services</SelectItem>
                    {(systemLogStats?.services || []).map((svc) => (
                      <SelectItem key={svc} value={svc} className="text-xs capitalize">{svc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Level Filter */}
                <Select
                  value={logFilters.level || "_all"}
                  onValueChange={(val) => handleLogFilterChange({ level: val === "_all" ? undefined : val || undefined })}
                >
                  <SelectTrigger className="bg-background border-border text-xs h-8 w-[120px] text-foreground">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="_all" className="text-xs">All Levels</SelectItem>
                    <SelectItem value="CRITICAL" className="text-xs">Critical</SelectItem>
                    <SelectItem value="ERROR" className="text-xs">Error</SelectItem>
                    <SelectItem value="WARNING" className="text-xs">Warning</SelectItem>
                    <SelectItem value="INFO" className="text-xs">Info</SelectItem>
                  </SelectContent>
                </Select>

                {/* Resolved Filter */}
                <Select
                  value={logFilters.is_resolved === undefined ? "_all" : logFilters.is_resolved ? "true" : "false"}
                  onValueChange={(val) => handleLogFilterChange({ is_resolved: val === "_all" ? undefined : val === "true" })}
                >
                  <SelectTrigger className="bg-background border-border text-xs h-8 w-[120px] text-foreground">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border text-foreground">
                    <SelectItem value="_all" className="text-xs">All Status</SelectItem>
                    <SelectItem value="false" className="text-xs">Unresolved</SelectItem>
                    <SelectItem value="true" className="text-xs">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchSystemLogs(logFilters)}
                  className="border-border text-foreground hover:bg-muted h-8 text-xs px-3"
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${systemLogsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                {selectedLogIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={handleBulkResolve}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 h-8 text-xs px-3"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1.5" />
                    Resolve {selectedLogIds.size} Selected
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Log Entries */}
          <Card className="glass border-border">
            <CardHeader className="pb-2 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">System Error & Event Log</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Showing {systemLogs.length} of {systemLogsTotal} entries — captured in background across all services.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {systemLogsLoading && systemLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground">Loading system logs...</div>
              ) : systemLogs.length === 0 ? (
                <div className="text-center py-12 text-xs text-muted-foreground flex flex-col items-center gap-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-500/30" />
                  <p className="font-semibold">No log entries match your filters.</p>
                  <p>All systems running clean.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {systemLogs.map((log) => (
                    <div
                      key={log.id}
                      className={cn(
                        "p-4 transition-all hover:bg-muted/20",
                        log.is_resolved && "opacity-60"
                      )}
                    >
                      {/* Header row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <input
                            type="checkbox"
                            checked={selectedLogIds.has(log.id)}
                            onChange={() => toggleLogSelection(log.id)}
                            className="rounded border-border bg-card"
                          />
                          <Badge className={`text-[9px] font-black uppercase ${
                            log.level === "CRITICAL" ? "bg-rose-600 text-white" :
                            log.level === "ERROR" ? "bg-destructive text-destructive-foreground" :
                            log.level === "WARNING" ? "bg-amber-500 text-background" :
                            "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          }`}>
                            {log.level}
                          </Badge>
                          <Badge variant="outline" className="text-[9px] font-semibold border-border text-muted-foreground capitalize">
                            {log.service}
                          </Badge>
                          {log.http_method && log.http_path && (
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {log.http_method} {log.http_path}
                            </span>
                          )}
                          {log.http_status && (
                            <Badge variant="outline" className={`text-[9px] font-mono ${
                              parseInt(log.http_status) >= 500 ? "border-destructive/30 text-destructive" :
                              parseInt(log.http_status) >= 400 ? "border-amber-500/30 text-amber-500" :
                              "border-border text-muted-foreground"
                            }`}>
                              {log.http_status}
                            </Badge>
                          )}
                          {log.duration_ms && (
                            <span className="text-[10px] text-muted-foreground">{log.duration_ms}ms</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {log.created_at ? new Date(log.created_at).toLocaleString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit", second: "2-digit",
                            }) : "—"}
                          </span>
                          {!log.is_resolved ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveLog(log.id)}
                              className="border-border text-foreground hover:bg-muted h-6 text-[10px] font-bold px-2"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                              Resolve
                            </Button>
                          ) : (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/10 text-[9px] font-bold">
                              RESOLVED
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-xs text-foreground font-semibold leading-snug mb-1">{log.message}</p>

                      {/* Org + Request ID context */}
                      <div className="flex flex-wrap gap-3 text-[10px] text-muted-foreground mb-1">
                        {log.organization_id && (
                          <span>
                            Org: <span className="font-mono font-semibold text-foreground">
                              {organizations.find(o => o.id === log.organization_id)?.legal_name || log.organization_id.substring(0, 12) + "…"}
                            </span>
                          </span>
                        )}
                        {log.request_id && (
                          <span>Request: <span className="font-mono">{log.request_id.substring(0, 12)}…</span></span>
                        )}
                      </div>

                      {/* Expandable Stack Trace */}
                      {log.stack_trace && (
                        <div>
                          <button
                            onClick={() => toggleLogExpansion(log.id)}
                            className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground font-bold mt-1 transition-colors"
                          >
                            <Terminal className="w-3 h-3" />
                            {expandedLogs[log.id] ? "Hide" : "Show"} Stack Trace
                          </button>
                          {expandedLogs[log.id] && (
                            <pre className="mt-2 p-3 bg-card border border-border rounded-xl text-[10px] text-muted-foreground font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-inner max-h-[300px] overflow-y-auto">
                              {log.stack_trace}
                            </pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {systemLogsTotal > (logFilters.limit || 50) && (
                <div className="flex items-center justify-between p-4 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">
                    Page {Math.floor((logFilters.offset || 0) / (logFilters.limit || 50)) + 1} of {Math.ceil(systemLogsTotal / (logFilters.limit || 50))}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(logFilters.offset || 0) === 0}
                      onClick={() => {
                        const newFilters = { ...logFilters, offset: Math.max(0, (logFilters.offset || 0) - (logFilters.limit || 50)) };
                        setLogFilters(newFilters);
                        fetchSystemLogs(newFilters);
                      }}
                      className="h-7 text-xs border-border text-foreground"
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={(logFilters.offset || 0) + (logFilters.limit || 50) >= systemLogsTotal}
                      onClick={() => {
                        const newFilters = { ...logFilters, offset: (logFilters.offset || 0) + (logFilters.limit || 50) };
                        setLogFilters(newFilters);
                        fetchSystemLogs(newFilters);
                      }}
                      className="h-7 text-xs border-border text-foreground"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* tab 8: A2A Protocol Activity */}
        <TabsContent value="a2a" className="outline-none space-y-4">
          {/* A2A Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Total Tasks", value: a2aStats?.total_tasks ?? 0, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
              { label: "Completed", value: a2aStats?.completed_tasks ?? 0, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { label: "Failed", value: a2aStats?.failed_tasks ?? 0, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
              { label: "Guardrail Blocked", value: a2aStats?.blocked_tasks ?? 0, icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-500/10" },
              { label: "Avg Latency", value: `${Math.round(a2aStats?.avg_duration_ms ?? 0)}ms`, icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <Card key={idx} className="glass border-border">
                  <CardContent className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xl font-black tracking-tight text-foreground mt-0.5">{stat.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* A2A Filters */}
          <Card className="glass border-border">
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">A2A Protocol Task Activity (All Orgs)</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Cross-organization A2A task tracking with guardrail audit trails</CardDescription>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Input
                    placeholder="Search queries..."
                    value={a2aSearchTerm}
                    onChange={(e) => setA2aSearchTerm(e.target.value)}
                    className="h-8 w-44 text-xs bg-background border-border"
                  />
                  <Select value={a2aFilterState} onValueChange={(v) => setA2aFilterState(v ?? "")}>
                    <SelectTrigger className="w-32 h-8 text-xs">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchA2AData}
                    disabled={a2aLoading}
                    className="h-8 text-xs border-border text-foreground hover:bg-muted"
                  >
                    <RefreshCw className={cn("w-3 h-3 mr-1.5", a2aLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="text-[10px] font-bold py-2.5 pl-4">Task ID</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Organization</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Skill</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Query</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">State</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Guardrail</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Duration</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Tokens</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5">Time</TableHead>
                    <TableHead className="text-[10px] font-bold py-2.5 text-right pr-4">Inspect</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/30">
                  {a2aTasks
                    .filter((t) => !a2aFilterState || t.state === a2aFilterState)
                    .filter((t) => !a2aSearchTerm || t.query?.toLowerCase().includes(a2aSearchTerm.toLowerCase()))
                    .length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10 text-xs text-muted-foreground">
                        {a2aLoading ? "Loading A2A tasks..." : "No A2A tasks found. Tasks will appear here as users interact via the A2A protocol."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    a2aTasks
                      .filter((t) => !a2aFilterState || t.state === a2aFilterState)
                      .filter((t) => !a2aSearchTerm || t.query?.toLowerCase().includes(a2aSearchTerm.toLowerCase()))
                      .map((task) => {
                        const orgName = organizations.find((o) => o.id === task.organization_id)?.legal_name || task.organization_id?.substring(0, 8) || "—";
                        return (
                          <TableRow key={task.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="py-2.5 pl-4 text-[10px] text-muted-foreground font-mono">
                              {task.id.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="py-2.5 text-[10px] text-foreground font-medium truncate max-w-[100px]">
                              {orgName}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge variant="outline" className="text-[8px] font-semibold border-border capitalize">
                                {(task.skill_id || "general").replace(/-/g, " ")}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 text-[10px] text-foreground max-w-[180px] truncate">
                              {task.query}
                            </TableCell>
                            <TableCell className="py-2.5">
                              <Badge className={cn("text-[8px] font-bold uppercase", {
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20": task.state === "completed",
                                "bg-destructive/10 text-destructive border-destructive/20": task.state === "failed",
                                "bg-amber-500/10 text-amber-500 border-amber-500/20": task.state === "working",
                                "bg-blue-500/10 text-blue-500 border-blue-500/20": task.state === "submitted",
                                "bg-muted text-muted-foreground border-border": task.state === "canceled",
                              })}>
                                {task.state}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2.5">
                              {task.guardrail_blocked ? (
                                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[8px] font-bold">BLOCKED</Badge>
                              ) : (
                                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-bold">PASSED</Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-2.5 text-[10px] text-muted-foreground font-mono">
                              {task.duration_ms ? `${task.duration_ms}ms` : "—"}
                            </TableCell>
                            <TableCell className="py-2.5 text-[10px] text-muted-foreground font-mono">
                              {task.token_usage || "—"}
                            </TableCell>
                            <TableCell className="py-2.5 text-[10px] text-muted-foreground">
                              {task.created_at ? new Date(task.created_at).toLocaleString() : "—"}
                            </TableCell>
                            <TableCell className="py-2.5 text-right pr-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setA2aInspectedTask(task)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      </main>

      {/* A2A Task Inspect Sheet */}
      <Sheet open={!!a2aInspectedTask} onOpenChange={() => setA2aInspectedTask(null)}>
        <SheetContent className="sm:max-w-xl bg-background border-l border-border text-foreground overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-sm font-bold text-foreground">A2A Task Inspection</SheetTitle>
            <SheetDescription className="text-xs font-mono text-muted-foreground">
              {a2aInspectedTask?.id}
            </SheetDescription>
          </SheetHeader>
          {a2aInspectedTask && (
            <div className="mt-6 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Badge className={cn("text-[9px] font-bold uppercase", {
                  "bg-emerald-500/10 text-emerald-500 border-emerald-500/20": a2aInspectedTask.state === "completed",
                  "bg-destructive/10 text-destructive border-destructive/20": a2aInspectedTask.state === "failed",
                  "bg-amber-500/10 text-amber-500 border-amber-500/20": a2aInspectedTask.state === "working",
                  "bg-blue-500/10 text-blue-500 border-blue-500/20": a2aInspectedTask.state === "submitted",
                })}>
                  {a2aInspectedTask.state}
                </Badge>
                {a2aInspectedTask.guardrail_blocked ? (
                  <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[9px]">GUARDRAIL BLOCKED</Badge>
                ) : (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px]">GUARDRAIL PASSED</Badge>
                )}
                <Badge variant="outline" className="text-[9px] capitalize">
                  {(a2aInspectedTask.skill_id || "general").replace(/-/g, " ")}
                </Badge>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Organization</span>
                <p className="text-xs text-foreground">
                  {organizations.find((o) => o.id === a2aInspectedTask.organization_id)?.legal_name || a2aInspectedTask.organization_id || "—"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Query</span>
                <p className="text-xs text-foreground bg-muted p-3 rounded-lg border border-border">{a2aInspectedTask.query}</p>
              </div>

              {a2aInspectedTask.answer && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Response</span>
                  <p className="text-xs text-foreground bg-muted p-3 rounded-lg border border-border whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {a2aInspectedTask.answer}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Duration</span>
                  <p className="text-xs font-mono text-foreground">{a2aInspectedTask.duration_ms ?? "—"}ms</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Tokens</span>
                  <p className="text-xs font-mono text-foreground">{a2aInspectedTask.token_usage ?? "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Session</span>
                  <p className="text-xs font-mono text-muted-foreground truncate">{a2aInspectedTask.session_id || "—"}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Created</span>
                  <p className="text-xs text-muted-foreground">
                    {a2aInspectedTask.created_at ? new Date(a2aInspectedTask.created_at).toLocaleString() : "—"}
                  </p>
                </div>
              </div>

              {a2aInspectedTask.guardrail_audit && Object.keys(a2aInspectedTask.guardrail_audit).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold block mb-1">Guardrail Audit Trail</span>
                  <pre className="text-[9px] font-mono text-muted-foreground bg-muted p-3 rounded-lg border border-border overflow-x-auto max-h-40 overflow-y-auto">
                    {JSON.stringify(a2aInspectedTask.guardrail_audit, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

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

      {/* Add Funds to Wallet Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-foreground">Add Funds to Organization Wallet</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!addFundsOrgId || !addFundsAmount) return;
              try {
                const res = await adminAddFunds({
                  organization_id: addFundsOrgId,
                  amount: parseFloat(addFundsAmount),
                  description: addFundsDescription || undefined,
                });
                setWallets((prev) => {
                  const exists = prev.find((w) => w.organization_id === addFundsOrgId);
                  if (exists) {
                    return prev.map((w) =>
                      w.organization_id === addFundsOrgId ? { ...w, balance: res.new_balance } : w
                    );
                  }
                  return [
                    ...prev,
                    { id: res.wallet_id, organization_id: addFundsOrgId, balance: res.new_balance, currency: "INR" },
                  ];
                });
                const txns = await getAllWalletTransactions().catch(() => []);
                setWalletTransactions(txns);
                setIsAddFundsOpen(false);
                const org = organizations.find((o) => o.id === addFundsOrgId);
                toast.success(`₹${parseFloat(addFundsAmount).toLocaleString()} added to ${org?.legal_name || "wallet"}. New balance: ₹${res.new_balance.toLocaleString()}`);
              } catch (err: any) {
                toast.error(err.message || "Failed to add funds.");
              }
            }}
            className="space-y-4 py-2"
          >
            <div className="space-y-1.5">
              <Label htmlFor="fund_org" className="text-xs text-muted-foreground">Select Organization</Label>
              <Select value={addFundsOrgId} onValueChange={(val) => { if (val) setAddFundsOrgId(val); }}>
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

            <div className="space-y-1.5">
              <Label htmlFor="fund_amount" className="text-xs text-muted-foreground">Amount (₹)</Label>
              <Input
                id="fund_amount"
                type="number"
                step="0.01"
                min="1"
                placeholder="e.g. 50000"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
                required
                className="bg-card border-border text-xs h-9 text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fund_desc" className="text-xs text-muted-foreground">Description (optional)</Label>
              <Input
                id="fund_desc"
                placeholder="e.g. Initial funding for Q2 trading"
                value={addFundsDescription}
                onChange={(e) => setAddFundsDescription(e.target.value)}
                className="bg-card border-border text-xs h-9 text-foreground"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddFundsOpen(false)}
                className="border-border text-foreground hover:bg-muted text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-9"
              >
                <IndianRupee className="w-3.5 h-3.5 mr-1" />
                Add Funds
              </Button>
            </DialogFooter>
          </form>
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

      {/* Create User Dialog */}
      <Dialog open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
        <DialogContent className="sm:max-w-md bg-background border border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-foreground">Create New Platform / Org User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="user_full_name" className="text-xs text-muted-foreground">Full Name</Label>
              <Input
                id="user_full_name"
                placeholder="e.g. Rahul Sharma"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                required
                className="h-9 text-xs bg-card border-border text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user_email" className="text-xs text-muted-foreground">Email Address</Label>
              <Input
                id="user_email"
                type="email"
                placeholder="e.g. rahul@company.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="h-9 text-xs bg-card border-border text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user_pass" className="text-xs text-muted-foreground">Password</Label>
              <Input
                id="user_pass"
                type="password"
                placeholder="Minimum 8 characters"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={8}
                className="h-9 text-xs bg-card border-border text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="user_role" className="text-xs text-muted-foreground">Select RBAC Level Role</Label>
              <Select value={newUser.role_id} onValueChange={(val) => setNewUser({ ...newUser, role_id: val || "" })}>
                <SelectTrigger className="bg-card border-border text-xs h-9 text-foreground">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {rolesList.map((role) => (
                    <SelectItem key={role.id} value={role.id} className="text-xs">
                      {role.name} {role.is_internal ? " (Internal)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(() => {
              const selectedRoleObj = rolesList.find(r => r.id === newUser.role_id);
              const needsOrg = selectedRoleObj && !selectedRoleObj.is_internal && !["SUPER_ADMIN", "SALES", "GOVT_AUDITOR"].includes(selectedRoleObj.name);
              if (!needsOrg) return null;
              return (
                <div className="space-y-1.5">
                  <Label htmlFor="user_org" className="text-xs text-muted-foreground">Select Organization</Label>
                  <Select value={newUser.organization_id} onValueChange={(val) => setNewUser({ ...newUser, organization_id: val || "" })}>
                    <SelectTrigger className="bg-card border-border text-xs h-9 text-foreground">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id} className="text-xs">
                          {org.legal_name}
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
                onClick={() => setIsNewUserOpen(false)}
                className="border-border text-foreground hover:bg-muted text-xs h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 text-xs h-9"
              >
                Create User
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
