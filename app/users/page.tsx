"use client";

import { useState } from "react";
import { NavHeader } from "@/components/nav-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  Edit,
  Trash2,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Eye,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    linesAnnotated: 2456,
    linesVerified: 2450,
    lastActive: "2025-01-05T10:30:00",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "reviewer",
    linesAnnotated: 1923,
    linesVerified: 1920,
    lastActive: "2025-01-05T09:15:00",
    status: "active",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob.wilson@example.com",
    role: "annotator",
    linesAnnotated: 1678,
    linesVerified: 890,
    lastActive: "2025-01-04T16:45:00",
    status: "active",
  },
  {
    id: "4",
    name: "Alice Johnson",
    email: "alice.j@example.com",
    role: "annotator",
    linesAnnotated: 945,
    linesVerified: 234,
    lastActive: "2025-01-03T14:20:00",
    status: "inactive",
  },
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users] = useState(mockUsers);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<
    (typeof mockUsers)[0] | null
  >(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    role: "annotator",
  });
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("annotator");

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="gap-1 bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "reviewer":
        return (
          <Badge className="gap-1 bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">
            <CheckCircle2 className="h-3 w-3" />
            Reviewer
          </Badge>
        );
      default:
        return (
          <Badge className="gap-1" variant="secondary">
            <FileText className="h-3 w-3" />
            Annotator
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="gap-1 bg-green-500/10 text-green-700 hover:bg-green-500/20 dark:text-green-400">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="gap-1">
        Inactive
      </Badge>
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAddUser = () => {
    alert(`Adding user: ${newUserName} (${newUserEmail}) as ${newUserRole}`);
    setIsAddUserOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("annotator");
  };

  const handleEditUser = (user: (typeof mockUsers)[0]) => {
    setSelectedUser(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    alert(
      `Updating user: ${editUserData.name} (${editUserData.email}) as ${editUserData.role}`
    );
    setIsEditOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavHeader />

      <main className="container py-6 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold">
                User Management
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Manage annotators, reviewers, and administrators
              </p>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account and assign their role
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={newUserRole} onValueChange={setNewUserRole}>
                      <SelectTrigger id="role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="annotator">Annotator</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddUserOpen(false)}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* User Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">
                  Total Users
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">
                  {users.length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">
                  Active Users
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">
                  {users.filter((u) => u.status === "active").length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">
                  Total Annotations
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">
                  {users
                    .reduce((sum, u) => sum + u.linesAnnotated, 0)
                    .toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription className="text-xs sm:text-sm">
                  Total Verified
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">
                  {users
                    .reduce((sum, u) => sum + u.linesVerified, 0)
                    .toLocaleString()}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* User Cards */}
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    // Added 'relative' here to position the menu button absolutely on mobile
                    className="relative rounded-lg border p-3 sm:p-4 hover:bg-accent/50 transition-colors"
                  >
                    {/* Menu Button: Absolute on mobile to save width, Static on desktop */}
                    <div className="absolute top-2 right-2 sm:static sm:float-right sm:ml-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Avatar */}
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Content Container - pr-6 ensures text doesn't hit the absolute menu button on mobile */}
                      <div className="flex-1 min-w-0 space-y-2 pr-6 sm:pr-0">
                        {/* Name & Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {user.name}
                          </h3>
                          <div className="flex flex-wrap gap-1">
                            {getRoleBadge(user.role)}
                            {getStatusBadge(user.status)}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>

                        {/* Stats - Changed from grid to flex-col (stacked) on mobile to fix overlap */}
                        <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs sm:text-sm pt-1">
                          <div>
                            <span className="text-muted-foreground">
                              Annotated:{" "}
                            </span>
                            <span className="font-medium">
                              {user.linesAnnotated.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Verified:{" "}
                            </span>
                            <span className="font-medium">
                              {user.linesVerified.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Last Active */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="truncate">
                            Last active{" "}
                            {new Date(user.lastActive).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* View User Details Dialog */}
      <Dialog
        open={!!selectedUser && !isEditOpen}
        onOpenChange={(open: boolean) => !open && setSelectedUser(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl sm:text-2xl break-words">
                        {selectedUser.name}
                      </DialogTitle>
                      <DialogDescription className="mt-1 break-words">
                        {selectedUser.email}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Role and Status */}
                <div className="flex flex-wrap gap-3">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1 p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lines Annotated
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {selectedUser.linesAnnotated.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground">
                      Lines Verified
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {selectedUser.linesVerified.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground">
                      Accuracy Rate
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold">
                      {selectedUser.linesAnnotated > 0
                        ? Math.round(
                            (selectedUser.linesVerified /
                              selectedUser.linesAnnotated) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="space-y-1 p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <p className="text-lg sm:text-xl font-bold capitalize">
                      {selectedUser.status}
                    </p>
                  </div>
                </div>

                {/* Activity Information */}
                <div className="border-t pt-4 space-y-2">
                  <h3 className="font-semibold">Activity</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-muted-foreground">Last Active</span>
                      <span className="font-medium">
                        {new Date(selectedUser.lastActive).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-muted-foreground">User ID</span>
                      <span className="font-mono text-xs break-all">
                        {selectedUser.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 border-t pt-4">
                  <Button
                    className="flex-1 gap-2"
                    onClick={() => handleEditUser(selectedUser)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit User
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      Close
                    </Button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editUserData.role}
                onValueChange={(role: string) =>
                  setEditUserData({ ...editUserData, role })
                }
              >
                <SelectTrigger id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annotator">Annotator</SelectItem>
                  <SelectItem value="reviewer">Reviewer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
