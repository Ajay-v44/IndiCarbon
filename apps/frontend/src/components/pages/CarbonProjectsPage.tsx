"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  submitProject,
  listProjects,
  evaluateProjectCredits,
  analyseProjectDocument,
  SubmitProjectPayload,
} from "@/lib/api/marketplace";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FolderOpen,
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Sun,
  Wind,
  Leaf,
  Zap,
  Flame,
  Droplets,
  Factory,
  TreePine,
  RefreshCw,
  Upload,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Info,
  BrainCircuit,
  Sparkles,
} from "lucide-react";

const PROJECT_TYPES = [
  { value: "Solar PV", label: "Solar PV", icon: Sun, color: "text-amber-500", bg: "bg-amber-500/10" },
  { value: "Wind Power", label: "Wind Power", icon: Wind, color: "text-teal-500", bg: "bg-teal-500/10" },
  { value: "Biomass Energy", label: "Biomass Energy", icon: Leaf, color: "text-green-500", bg: "bg-green-500/10" },
  { value: "Waste Heat Recovery", label: "Waste Heat Recovery", icon: Factory, color: "text-orange-500", bg: "bg-orange-500/10" },
  { value: "Methane Capture", label: "Methane Capture", icon: Flame, color: "text-red-500", bg: "bg-red-500/10" },
  { value: "Afforestation", label: "Afforestation / REDD+", icon: TreePine, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { value: "Energy Efficiency", label: "Energy Efficiency", icon: Zap, color: "text-violet-500", bg: "bg-violet-500/10" },
  { value: "Industrial Fuel Switching", label: "Fuel Switching", icon: Factory, color: "text-blue-500", bg: "bg-blue-500/10" },
  { value: "Blue Carbon", label: "Blue Carbon / Wetlands", icon: Droplets, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { value: "Hydrogen", label: "Green Hydrogen", icon: Zap, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { value: "Carbon Capture", label: "Carbon Capture & Storage", icon: Factory, color: "text-gray-500", bg: "bg-gray-500/10" },
  { value: "Other", label: "Other", icon: Leaf, color: "text-muted-foreground", bg: "bg-muted" },
];

const REGISTRIES = ["VERRA", "Gold Standard", "BEE / PAT Scheme", "CCTS (India)", "CDM (UN)", "Other"];

const REQUIRED_DOCS = [
  "Project Design Document (PDD)",
  "Energy Audit Report",
  "Monitoring Report",
  "Engineering / Commissioning Report",
  "Third-Party Verification Report",
  "Land / Site Agreement",
];

function statusBadge(status: string) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
          <Clock className="w-2.5 h-2.5 mr-1" />
          Pending Review
        </Badge>
      );
    case "UNDER_REVIEW":
      return (
        <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]">
          <Eye className="w-2.5 h-2.5 mr-1" />
          Under Review
        </Badge>
      );
    case "VERIFIED":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
          <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
          Verified
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 text-[10px]">
          <XCircle className="w-2.5 h-2.5 mr-1" />
          Rejected
        </Badge>
      );
    default:
      return <Badge className="text-[10px]">{status}</Badge>;
  }
}

function getProjectTypeConfig(type: string) {
  return PROJECT_TYPES.find((t) => t.value === type) || PROJECT_TYPES[PROJECT_TYPES.length - 1];
}

export function CarbonProjectsPage() {
  const tokens = useAppSelector((state) => state.auth.tokens);
  const orgId = tokens?.organization_id;

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Pagination state
  const [projectsCount, setProjectsCount] = useState(0);
  const [projectsLimit] = useState(6);
  const [projectsOffset, setProjectsOffset] = useState(0);

  // AI Upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [aiExtractedData, setAiExtractedData] = useState<any>(null);

  // Form state
  const [form, setForm] = useState<Partial<SubmitProjectPayload>>({
    project_type: "Solar PV",
    registry: "VERRA",
    project_lifetime_years: 20,
  });
  const [docList, setDocList] = useState<string[]>([]);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  const fetchProjects = async (offsetVal: number = projectsOffset) => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await listProjects(orgId, undefined, projectsLimit, offsetVal);
      setProjects(res.projects || []);
      setProjectsCount(res.total || 0);
    } catch {
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(projectsOffset);
  }, [orgId, projectsOffset]);

  const handleSubmit = async () => {
    if (!orgId) return;
    if (!form.name) {
      toast.error("Project name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitProject({
        organization_id: orgId,
        name: form.name!,
        project_type: form.project_type || "Solar PV",
        description: form.description,
        registry: form.registry,
        energy_produced_mwh: form.energy_produced_mwh ? Number(form.energy_produced_mwh) : undefined,
        fuel_switched_litre: form.fuel_switched_litre ? Number(form.fuel_switched_litre) : undefined,
        waste_diverted_tonnes: form.waste_diverted_tonnes ? Number(form.waste_diverted_tonnes) : undefined,
        trees_planted: form.trees_planted ? Number(form.trees_planted) : undefined,
        area_hectares: form.area_hectares ? Number(form.area_hectares) : undefined,
        estimated_annual_reduction_tco2e: form.estimated_annual_reduction_tco2e
          ? Number(form.estimated_annual_reduction_tco2e)
          : undefined,
        estimated_credits: form.estimated_credits ? Number(form.estimated_credits) : undefined,
        project_lifetime_years: form.project_lifetime_years
          ? Number(form.project_lifetime_years)
          : undefined,
        submitted_documents: docList.length > 0 ? docList : undefined,
      });
      const aiMsg = result.ai_estimated_credits
        ? ` AI estimated ${result.ai_estimated_credits} credits.`
        : "";
      toast.success(`Project submitted!${aiMsg} IndiCarbon admin will review it shortly.`);
      setSubmitOpen(false);
      setForm({ project_type: "Solar PV", registry: "VERRA", project_lifetime_years: 20 });
      setDocList([]);
      setAiExtractedData(null);
      setProjectsOffset(0);
      fetchProjects(0);
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit project.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUploadAndAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setAiExtractedData(null);
    try {
      const data = await analyseProjectDocument(file);
      if (data && (data.name || data.project_type)) {
        setAiExtractedData(data);
        setForm({
          name: data.name || "",
          project_type: data.project_type || "Solar PV",
          description: data.description || "",
          registry: data.registry || "VERRA",
          project_lifetime_years: data.project_lifetime_years || 20,
          energy_produced_mwh: data.energy_produced_mwh || undefined,
          fuel_switched_litre: data.fuel_switched_litre || undefined,
          waste_diverted_tonnes: data.waste_diverted_tonnes || undefined,
          trees_planted: data.trees_planted || undefined,
          area_hectares: data.area_hectares || undefined,
          estimated_annual_reduction_tco2e: data.estimated_annual_reduction_tco2e || undefined,
          estimated_credits: data.estimated_credits || undefined,
        });
        setDocList(data.submitted_documents || []);
        toast.success("AI parsed document successfully! Review details below.");
      } else {
        toast.error("Failed to parse project details.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to parse project document.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleReEvaluate = async (projectId: string) => {
    setEvaluating(projectId);
    try {
      const result = await evaluateProjectCredits(projectId);
      toast.success(`AI evaluation complete! Estimated ${result.ai_estimated_credits ?? 0} credits.`);
      // Update in list
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, ...result } : p));
      if (selectedProject?.id === projectId) setSelectedProject({ ...selectedProject, ...result });
    } catch (e: any) {
      toast.error(e?.message || "Evaluation failed.");
    } finally {
      setEvaluating(null);
    }
  };

  const totalProjects = projects.length;
  const verifiedCount = projects.filter((p) => p.status === "VERIFIED").length;
  const pendingCount = projects.filter((p) => p.status === "PENDING" || p.status === "UNDER_REVIEW").length;
  const estimatedCredits = projects
    .filter((p) => p.status === "VERIFIED")
    .reduce((s: number, p: any) => s + (p.estimated_credits || 0), 0);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Carbon Projects</h1>
            <p className="text-sm text-muted-foreground">
              Submit and track your carbon reduction projects for credit verification
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-border text-muted-foreground hover:bg-muted"
            onClick={() => fetchProjects(projectsOffset)}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white dark:text-black font-semibold"
            onClick={() => setSubmitOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Submit New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: totalProjects, icon: FolderOpen, color: "text-foreground", bg: "bg-muted" },
          { label: "Verified", value: verifiedCount, icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Under Review", value: pendingCount, icon: Clock, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
          { label: "Est. Credits (Verified)", value: estimatedCredits.toLocaleString() + " tCO₂", icon: Leaf, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="glass border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  <p className={`text-2xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Eligibility Info Banner */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3 items-start">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-0.5">
            Important: How Carbon Credits Work
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Reducing emissions does <strong>NOT</strong> automatically create carbon credits. Credits can only be issued after your project is
            registered, monitored, verified by an accredited third party, and approved by a recognized registry (VERRA, Gold Standard, BEE/CCTS, etc.).
            Estimated credits shown are projections based on your submitted data — actual issuance depends on verification outcomes.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground text-sm">Loading projects...</div>
      ) : projects.length === 0 ? (
        <Card className="glass border-border">
          <CardContent className="py-16 text-center">
            <FolderOpen className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground mb-1">No projects submitted yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Submit your first carbon reduction project to start earning verified carbon credits.
            </p>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => setSubmitOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Submit Your First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const typeConfig = getProjectTypeConfig(project.project_type);
            const Icon = typeConfig.icon;
            const docs = project.submitted_documents || [];
            const docCoverage = REQUIRED_DOCS.filter((d) =>
              docs.some((sd: string) => sd.toLowerCase().includes(d.split(" ")[0].toLowerCase()))
            ).length;
            return (
              <Card
                key={project.id}
                className="glass border-border hover:border-emerald-500/30 transition-all cursor-pointer group"
                onClick={() => { setSelectedProject(project); setDetailOpen(true); }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${typeConfig.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    {statusBadge(project.status)}
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-0.5 line-clamp-1">{project.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{project.project_type} · {project.registry || "No Registry"}</p>

                  <div className="space-y-1.5 text-xs">
                    {project.ai_estimated_credits && (
                      <div className="flex items-center justify-between">
                        <span className="text-blue-500 flex items-center gap-1"><BrainCircuit className="w-3 h-3"/>AI Estimate</span>
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {Number(project.ai_estimated_credits).toLocaleString()} credits
                        </span>
                      </div>
                    )}
                    {project.credits_issued && (
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-500">Credits Issued</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(project.credits_issued).toLocaleString()} ✓
                        </span>
                      </div>
                    )}
                    {!project.ai_estimated_credits && project.estimated_annual_reduction_tco2e && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Est. Annual Reduction</span>
                        <span className="font-semibold text-foreground">
                          {Number(project.estimated_annual_reduction_tco2e).toLocaleString()} tCO₂e
                        </span>
                      </div>
                    )}
                    {project.project_lifetime_years && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lifetime</span>
                        <span className="font-semibold text-foreground">{project.project_lifetime_years} years</span>
                      </div>
                    )}
                  </div>

                  {/* Document completeness bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground">Document Completeness</span>
                      <span className="text-[10px] font-semibold text-foreground">
                        {docs.length} / {REQUIRED_DOCS.length} docs
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${(docs.length / REQUIRED_DOCS.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-muted-foreground">
                    Submitted {project.submitted_at ? new Date(project.submitted_at).toLocaleDateString("en-IN") : "—"}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Projects Pagination */}
      {projectsCount > projectsLimit && (
        <div className="flex items-center justify-between p-4 border-t border-border/50 bg-card/10 rounded-xl mt-4">
          <span className="text-[10px] text-muted-foreground">
            Page {Math.floor(projectsOffset / projectsLimit) + 1} of {Math.ceil(projectsCount / projectsLimit)}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={projectsOffset === 0}
              onClick={() => {
                const nextOffset = Math.max(0, projectsOffset - projectsLimit);
                setProjectsOffset(nextOffset);
              }}
              className="h-7 text-xs border border-border text-foreground bg-card hover:bg-muted"
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={projectsOffset + projectsLimit >= projectsCount}
              onClick={() => {
                const nextOffset = projectsOffset + projectsLimit;
                setProjectsOffset(nextOffset);
              }}
              className="h-7 text-xs border border-border text-foreground bg-card hover:bg-muted"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Submit Project Dialog */}
      <Dialog open={submitOpen} onOpenChange={(open) => {
        setSubmitOpen(open);
        if (!open) {
          setAiExtractedData(null);
          setUploadingFile(false);
          setForm({ project_type: "Solar PV", registry: "VERRA", project_lifetime_years: 20 });
          setDocList([]);
        }
      }}>
        <DialogContent className="sm:max-w-2xl bg-background border border-border text-foreground overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-base font-black text-foreground">Submit Carbon Reduction Project</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload your carbon offset project document (PDD, audit report, or proposal). Our AI agent will extract project metadata and calculate credit metrics.
            </p>
          </DialogHeader>

          {!aiExtractedData && !uploadingFile && (
            <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-emerald-500/50 rounded-xl transition-all p-6 bg-card/20">
              <Upload className="w-12 h-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Upload Project Design Document (PDD)</h3>
              <p className="text-xs text-muted-foreground text-center max-w-sm mb-4">
                Supported formats: PDF, DOCX, CSV, Excel. Max size 25MB. AI agent will analyze emissions methodology and prefill metrics.
              </p>
              <label className="relative cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all shadow-sm">
                Select Document
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.xls,.csv"
                  onChange={handleFileUploadAndAnalysis}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {uploadingFile && (
            <div className="py-12 flex flex-col items-center justify-center p-6 text-center">
              <BrainCircuit className="w-12 h-12 text-emerald-500 animate-pulse mb-4" />
              <h3 className="text-sm font-semibold text-foreground mb-1">Analyzing Carbon Project...</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Please wait while IndiCarbon AI parses the document, extracts calculations, and calculates carbon credit potential.
              </p>
            </div>
          )}

          {aiExtractedData && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4" />
                  AI Extracted Details
                </span>
                <label className="text-[10px] font-semibold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Upload different file
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xls,.csv"
                    onChange={handleFileUploadAndAnalysis}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Project Name *</Label>
                  <Input
                    placeholder="e.g. Kodinar Solar Plant Phase 2"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-card border-border text-xs h-9 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Project Type *</Label>
                  <Select
                    value={form.project_type}
                    onValueChange={(v) => { if (v) setForm({ ...form, project_type: v }); }}
                  >
                    <SelectTrigger className="bg-card border-border text-xs h-9 text-foreground">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {PROJECT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value} className="text-xs">
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Registry</Label>
                  <Select
                    value={form.registry}
                    onValueChange={(v) => { if (v) setForm({ ...form, registry: v }); }}
                  >
                    <SelectTrigger className="bg-card border-border text-xs h-9 text-foreground">
                      <SelectValue placeholder="Select registry" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border text-foreground">
                      {REGISTRIES.map((r) => (
                        <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Est. Annual Reduction (tCO₂e)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 500"
                    value={form.estimated_annual_reduction_tco2e || ""}
                    onChange={(e) => setForm({ ...form, estimated_annual_reduction_tco2e: parseFloat(e.target.value) || undefined })}
                    className="bg-card border-border text-xs h-9 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Est. Credits (tCO₂e)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 450"
                    value={form.estimated_credits || ""}
                    onChange={(e) => setForm({ ...form, estimated_credits: parseFloat(e.target.value) || undefined })}
                    className="bg-card border-border text-xs h-9 text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Project Lifetime (years)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 20"
                    value={form.project_lifetime_years || ""}
                    onChange={(e) => setForm({ ...form, project_lifetime_years: parseInt(e.target.value) || undefined })}
                    className="bg-card border-border text-xs h-9 text-foreground"
                  />
                </div>

                {/* AI Calculator Metrics */}
                <div className="sm:col-span-2 rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 space-y-3">
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5" />
                    AI Credit Extraction Metrics
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Energy Produced (MWh/yr)</Label>
                      <Input
                        type="number"
                        placeholder="Not detected"
                        value={form.energy_produced_mwh || ""}
                        onChange={(e) => setForm({ ...form, energy_produced_mwh: parseFloat(e.target.value) || undefined })}
                        className="bg-card border-border text-xs h-9 text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Fossil Fuel Displaced (l/yr)</Label>
                      <Input
                        type="number"
                        placeholder="Not detected"
                        value={form.fuel_switched_litre || ""}
                        onChange={(e) => setForm({ ...form, fuel_switched_litre: parseFloat(e.target.value) || undefined })}
                        className="bg-card border-border text-xs h-9 text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Waste Diverted (t/yr)</Label>
                      <Input
                        type="number"
                        placeholder="Not detected"
                        value={form.waste_diverted_tonnes || ""}
                        onChange={(e) => setForm({ ...form, waste_diverted_tonnes: parseFloat(e.target.value) || undefined })}
                        className="bg-card border-border text-xs h-9 text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Trees Planted</Label>
                      <Input
                        type="number"
                        placeholder="Not detected"
                        value={form.trees_planted || ""}
                        onChange={(e) => setForm({ ...form, trees_planted: parseInt(e.target.value) || undefined })}
                        className="bg-card border-border text-xs h-9 text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Area (hectares)</Label>
                      <Input
                        type="number"
                        placeholder="Not detected"
                        value={form.area_hectares || ""}
                        onChange={(e) => setForm({ ...form, area_hectares: parseFloat(e.target.value) || undefined })}
                        className="bg-card border-border text-xs h-9 text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description / PDD Summary</Label>
                  <textarea
                    rows={3}
                    placeholder="Describe your project, methodology, and expected environmental impact..."
                    value={form.description || ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Document Checklist */}
                <div className="sm:col-span-2 space-y-2">
                  <Label className="text-xs text-muted-foreground">Documents Detected by AI (tick to update)</Label>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {REQUIRED_DOCS.map((doc) => {
                      const checked = docList.includes(doc);
                      return (
                        <button
                          key={doc}
                          type="button"
                          onClick={() =>
                            setDocList((prev) =>
                              prev.includes(doc) ? prev.filter((d) => d !== doc) : [...prev, doc]
                            )
                          }
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-all ${
                            checked
                              ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-emerald-500/50"
                          }`}
                        >
                          {checked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-border shrink-0" />
                          )}
                          {doc}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2 border-t border-border/50 mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setSubmitOpen(false);
                setAiExtractedData(null);
              }}
              className="border-border text-foreground hover:bg-muted text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting || !form.name || !aiExtractedData}
              className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs h-9 font-semibold"
            >
              {submitting ? "Submitting..." : "Submit Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Project Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        {selectedProject && (
          <DialogContent className="sm:max-w-lg bg-background border border-border text-foreground overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-sm font-black text-foreground">{selectedProject.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                {statusBadge(selectedProject.status)}
                <Badge className="text-[10px] bg-muted text-muted-foreground border-border">
                  {selectedProject.project_type}
                </Badge>
                {selectedProject.registry && (
                  <Badge className="text-[10px] bg-muted text-muted-foreground border-border">
                    {selectedProject.registry}
                  </Badge>
                )}
              </div>

              {selectedProject.description && (
                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg border border-border">
                  {selectedProject.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                {selectedProject.estimated_annual_reduction_tco2e && (
                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1">Est. Annual Reduction</p>
                    <p className="text-sm font-black text-foreground">
                      {Number(selectedProject.estimated_annual_reduction_tco2e).toLocaleString()} tCO₂e
                    </p>
                  </div>
                )}
                {selectedProject.estimated_credits && (
                  <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/20">
                    <p className="text-[10px] text-muted-foreground mb-1">Est. Credits</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      {Number(selectedProject.estimated_credits).toLocaleString()} tCO₂e
                    </p>
                  </div>
                )}
                {selectedProject.project_lifetime_years && (
                  <div className="bg-muted/30 rounded-lg p-3 border border-border">
                    <p className="text-[10px] text-muted-foreground mb-1">Project Lifetime</p>
                    <p className="text-sm font-black text-foreground">{selectedProject.project_lifetime_years} years</p>
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Document Checklist</p>
                <div className="space-y-1.5">
                  {REQUIRED_DOCS.map((doc) => {
                    const docs = selectedProject.submitted_documents || [];
                    const has = docs.includes(doc);
                    return (
                      <div key={doc} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${has ? "border-emerald-500/30 bg-emerald-500/5 text-foreground" : "border-border bg-muted/20 text-muted-foreground"}`}>
                        {has ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        {doc}
                        {!has && <span className="ml-auto text-[10px] text-amber-500">Missing</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Evaluation Results */}
              {selectedProject.ai_estimated_credits && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                    <BrainCircuit className="w-3.5 h-3.5" /> AI Credit Evaluation
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Estimated Credits</p>
                      <p className="font-black text-blue-600 dark:text-blue-400">{selectedProject.ai_estimated_credits?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Annual Reduction</p>
                      <p className="font-black text-foreground">{selectedProject.ai_annual_reduction_tco2e?.toFixed(1)} tCO₂e</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Methodology</p>
                      <p className="font-semibold text-foreground">{selectedProject.ai_methodology || "—"}</p>
                    </div>
                    {selectedProject.ai_confidence_score && (
                      <div>
                        <p className="text-muted-foreground">Confidence</p>
                        <p className="font-semibold text-foreground">{Math.round((selectedProject.ai_confidence_score || 0) * 100)}%</p>
                      </div>
                    )}
                  </div>
                  {selectedProject.ai_evaluation_notes && (
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed border-t border-blue-500/20 pt-2">
                      {selectedProject.ai_evaluation_notes}
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-[10px] border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                    onClick={() => handleReEvaluate(selectedProject.id)}
                    disabled={evaluating === selectedProject.id}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    {evaluating === selectedProject.id ? "Evaluating..." : "Re-run AI Evaluation"}
                  </Button>
                </div>
              )}

              {selectedProject.reviewer_notes && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mb-1">Reviewer Notes</p>
                  <p className="text-xs text-muted-foreground">{selectedProject.reviewer_notes}</p>
                </div>
              )}

              {selectedProject.status === "VERIFIED" && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Project Verified!</p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    {selectedProject.credits_issued && (
                      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {selectedProject.credits_issued} carbon credits minted to your account ✓
                      </p>
                    )}
                    <p>Verified on: {selectedProject.verified_at ? new Date(selectedProject.verified_at).toLocaleDateString("en-IN") : "—"}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
