"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Shield,
  Building,
  Settings,
  RefreshCw,
  UserCheck,
  Briefcase,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { listUsers, listRoles, assignRole, registerUser } from "@/lib/api/auth";
import { UserProfile, RoleResponse } from "@/lib/api/types";
import { useAppSelector } from "@/store/hooks";

export function SettingsPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<RoleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create User Form State
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserDesignation, setNewUserDesignation] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  // Assign Role State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const tokens = useAppSelector((state) => state.auth.tokens);
  const userOrgId = tokens?.organization_id || tokens?.organization_ids?.[0];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [fetchedUsers, fetchedRoles] = await Promise.all([
        listUsers(),
        listRoles(),
      ]);
      setUsers(fetchedUsers);
      setRoles(fetchedRoles);
    } catch (err: any) {
      toast.error(err.message || "Failed to load team data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserPassword || !newUserFullName) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setCreatingUser(true);
    try {
      await registerUser({
        email: newUserEmail,
        password: newUserPassword,
        full_name: newUserFullName,
        designation: newUserDesignation || undefined,
        phone_number: newUserPhone || undefined,
      });

      toast.success("User registered successfully.");
      setIsCreateOpen(false);
      // Reset form
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserFullName("");
      setNewUserDesignation("");
      setNewUserPhone("");
      
      // Refresh user list
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user.");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleId) {
      toast.error("Please select a user and a role.");
      return;
    }

    setAssigning(true);
    try {
      await assignRole({
        user_id: selectedUser.id,
        role_id: selectedRoleId,
        organization_id: userOrgId || undefined,
      });

      toast.success(`Role assigned to ${selectedUser.full_name || selectedUser.email} successfully.`);
      setIsAssignOpen(false);
      setSelectedUser(null);
      setSelectedRoleId(null);
      
      // Refresh user list
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to assign role.");
    } finally {
      setAssigning(false);
    }
  };

  const getRoleBadgeColor = (roleName: string) => {
    const name = roleName.toUpperCase();
    if (name.includes("ADMIN") || name.includes("OWNER")) {
      return "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20";
    }
    if (name.includes("MANAGER")) {
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    }
    if (name.includes("COMPLIANCE")) {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    }
    return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Settings & Governance</h1>
            <p className="text-sm text-muted-foreground font-medium">
              Manage organization membership, assign RBAC permissions, and invite team members.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="border-border text-muted-foreground hover:bg-muted"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger
              render={
                <Button size="sm" className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-black font-bold">
                  <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                  Add User
                </Button>
              }
            />
            <DialogContent className="glass border-border text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Add New User
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Create a new user account associated with your organization.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-2">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-xs text-foreground font-semibold">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter full name"
                    value={newUserFullName}
                    onChange={(e) => setNewUserFullName(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs text-foreground font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@company.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xs text-foreground font-semibold">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="bg-background border-border text-foreground text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="designation" className="text-xs text-foreground font-semibold">Designation</Label>
                    <Input
                      id="designation"
                      placeholder="e.g. Lead Analyst"
                      value={newUserDesignation}
                      onChange={(e) => setNewUserDesignation(e.target.value)}
                      className="bg-background border-border text-foreground text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs text-foreground font-semibold">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91..."
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="bg-background border-border text-foreground text-sm"
                    />
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creatingUser}
                    className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-black font-bold"
                  >
                    {creatingUser ? "Adding..." : "Add User"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Governance Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Users Table */}
        <Card className="lg:col-span-2 glass border-border">
          <CardHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <CardTitle className="text-base text-foreground">Team Members</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Active directory of carbon analysts and organization managers.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <span className="text-xs text-muted-foreground font-semibold">Retrieving organization structure...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-muted-foreground">No team members found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="border-b border-border">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-muted-foreground text-xs font-semibold">User</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold">Contact</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold">Roles</TableHead>
                      <TableHead className="text-muted-foreground text-xs font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-b border-border/50 hover:bg-muted/30">
                        <TableCell className="py-3">
                          <div>
                            <p className="font-semibold text-foreground text-sm">{user.full_name || "No Name"}</p>
                            {user.designation && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Briefcase className="w-3 h-3" />
                                {user.designation}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="space-y-0.5">
                            <p className="text-xs text-foreground flex items-center gap-1.5">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {user.email}
                            </p>
                            {user.phone_number && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {user.phone_number}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {user.roles && user.roles.length > 0 ? (
                              user.roles.map((role) => (
                                <Badge key={role} className={`text-[10px] uppercase font-bold border ${getRoleBadgeColor(role)}`}>
                                  {role.replace("_", " ")}
                                </Badge>
                              ))
                            ) : (
                              <Badge className="text-[10px] bg-muted text-muted-foreground border-border">
                                NO ROLE
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              // pre-fill role if they have one
                              const firstRoleId = roles.find(r => user.roles?.includes(r.name))?.id || null;
                              setSelectedRoleId(firstRoleId);
                              setIsAssignOpen(true);
                            }}
                            className="border-border text-muted-foreground hover:bg-muted text-xs py-1 px-2.5 h-7"
                          >
                            <Shield className="w-3.5 h-3.5 mr-1" />
                            Manage Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roles Details / Org Permissions */}
        <div className="space-y-6">
          {/* Organization Details Panel */}
          <Card className="glass border-border">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base text-foreground">Organization Scopes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-2">
                <p className="text-xs text-muted-foreground">Active Organization ID</p>
                <code className="text-xs text-foreground block font-mono bg-muted p-2 rounded border border-border truncate">
                  {userOrgId || "00000000-0000-0000-0000-000000000000"}
                </code>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Permissions</h4>
                <div className="space-y-1">
                  {[
                    "Read emissions ledger, audit certificates",
                    "Record greenhouse gas emissions",
                    "Approve SQL mutations (HITL process)",
                    "Initiate carbon offsets contracts",
                  ].map((perm) => (
                    <div key={perm} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Roles Description */}
          <Card className="glass border-border">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-base text-foreground">Role Permissions Mapping</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5">
              {roles.length === 0 ? (
                <p className="text-xs text-muted-foreground">No available roles definitions.</p>
              ) : (
                roles.map((role) => (
                  <div key={role.id} className="space-y-1 border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">{role.name.replace("_", " ")}</span>
                      <Badge className="bg-muted text-muted-foreground text-[9px] border-border font-mono">
                        {role.id.slice(0, 8)}...
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight">{role.description || "No description provided."}</p>
                    {role.permissions && role.permissions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {role.permissions.map((perm) => (
                          <span key={perm} className="text-[8px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-border px-1 py-0.5 rounded font-mono">
                            {perm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manage Role Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="glass border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Manage User Role
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-xs">
              Assign or update the RBAC role mapped to this user.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground block font-medium">User</span>
              <p className="text-sm font-semibold text-foreground">
                {selectedUser?.full_name || "No Name"}
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedUser?.email}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs text-foreground font-semibold">Choose Role</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger className="bg-background border-border text-foreground text-sm">
                  <SelectValue placeholder="Select an RBAC role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border text-foreground">
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id} className="focus:bg-muted focus:text-foreground">
                      {r.name.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAssignOpen(false);
                setSelectedUser(null);
                setSelectedRoleId(null);
              }}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignRole}
              disabled={assigning || !selectedRoleId}
              className="bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 text-white dark:text-black font-bold"
            >
              {assigning ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
