import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building, 
  Mail, 
  Plus, 
  Search, 
  Users,
  Pencil,
  Trash2
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Form schema
const teamFormSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  orgId: z.string().min(1, "Organization is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
});

type TeamFormValues = z.infer<typeof teamFormSchema>;

export default function TeamsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);
  const [deleteTeamId, setDeleteTeamId] = useState<number | null>(null);

  // Fetch teams
  const { data: teams, isLoading } = useQuery({
    queryKey: ["/api/grafana/teams"],
  });

  // Fetch organizations for the dropdown
  const { data: organizations } = useQuery({
    queryKey: ["/api/grafana/organizations"],
  });

  // Add team mutation
  const addTeamMutation = useMutation({
    mutationFn: async (data: TeamFormValues) => {
      const payload = {
        ...data,
        orgId: parseInt(data.orgId),
      };
      const res = await apiRequest("POST", "/api/grafana/teams", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team added",
        description: "The team has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/teams"] });
      setIsAddTeamOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add team: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update team mutation
  const updateTeamMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TeamFormValues }) => {
      const payload = {
        ...data,
        orgId: parseInt(data.orgId),
      };
      const res = await apiRequest("PUT", `/api/grafana/teams/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Team updated",
        description: "The team has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/teams"] });
      setEditingTeam(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update team: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete team mutation
  const deleteTeamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/grafana/teams/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/teams"] });
      setDeleteTeamId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete team: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding or editing teams
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      orgId: "",
      email: "",
    },
  });

  // Reset form when editing team changes
  useState(() => {
    if (editingTeam) {
      form.reset({
        name: editingTeam.name,
        orgId: String(editingTeam.orgId),
        email: editingTeam.email || "",
      });
    } else {
      form.reset({
        name: "",
        orgId: "",
        email: "",
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: TeamFormValues) => {
    if (editingTeam) {
      updateTeamMutation.mutate({ id: editingTeam.id, data: values });
    } else {
      addTeamMutation.mutate(values);
    }
  };

  // Filter teams by search term
  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(search.toLowerCase()) || 
    (organizations?.find(org => org.id === team.orgId)?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout
      title="Teams"
      subtitle="Manage Grafana teams across organizations"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-auto">
          <Input 
            type="text" 
            placeholder="Search teams..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 bg-grafana-dark-100 border border-grafana-dark-200 rounded-md text-grafana-text placeholder-grafana-gray focus:outline-none focus:ring-1 focus:ring-grafana-orange w-full md:w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-grafana-gray" />
        </div>
        
        <Button
          onClick={() => setIsAddTeamOpen(true)}
          className="flex items-center bg-grafana-orange hover:bg-grafana-orange/90 text-white w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Team
        </Button>
      </div>

      <Card className="bg-grafana-dark-100 border-grafana-dark-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto grafana-scrollbar">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-grafana-dark-200">
                  <TableHead className="text-grafana-text font-medium text-sm">Team</TableHead>
                  <TableHead className="text-grafana-text font-medium text-sm">Organization</TableHead>
                  <TableHead className="text-grafana-text font-medium text-sm">Email</TableHead>
                  <TableHead className="text-grafana-text font-medium text-sm">Grafana ID</TableHead>
                  <TableHead className="text-grafana-text font-medium text-sm text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b border-grafana-dark-200">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-8 w-8 rounded-full bg-grafana-dark-200" />
                          <Skeleton className="h-4 w-24 bg-grafana-dark-200" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20 bg-grafana-dark-200" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32 bg-grafana-dark-200" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16 bg-grafana-dark-200" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Skeleton className="h-8 w-8 rounded-md bg-grafana-dark-200" />
                          <Skeleton className="h-8 w-8 rounded-md bg-grafana-dark-200" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredTeams?.length > 0 ? (
                  // Display teams
                  filteredTeams.map((team) => {
                    // Find the organization for this team
                    const org = organizations?.find(o => o.id === team.orgId);
                    
                    return (
                      <TableRow key={team.id} className="border-b border-grafana-dark-200 hover:bg-grafana-dark-200/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mr-2">
                              <Users className="h-4 w-4" />
                            </div>
                            <span className="text-white font-medium">{team.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-grafana-text">
                          {org ? (
                            <div className="flex items-center">
                              <Building className="h-4 w-4 mr-1 text-blue-400" />
                              <span>{org.name}</span>
                            </div>
                          ) : (
                            <span className="text-grafana-text">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell className="text-grafana-text">
                          {team.email ? (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-grafana-text" />
                              <span>{team.email}</span>
                            </div>
                          ) : (
                            <span className="text-grafana-text/50">No email</span>
                          )}
                        </TableCell>
                        <TableCell className="text-grafana-text">
                          {team.grafanaId ? (
                            <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full">
                              {team.grafanaId}
                            </span>
                          ) : (
                            <span className="text-grafana-text/50">None</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingTeam(team)}
                              className="hover:bg-grafana-dark-200 text-grafana-text hover:text-white"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteTeamId(team.id)}
                              className="hover:bg-grafana-dark-200 text-grafana-text hover:text-grafana-error"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-grafana-text">
                      {search ? (
                        <>No teams found matching "{search}"</>
                      ) : (
                        <>No teams found. Click "Add Team" to create one.</>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Team Dialog */}
      <Dialog open={isAddTeamOpen || editingTeam !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddTeamOpen(false);
          setEditingTeam(null);
          form.reset();
        }
      }}>
        <DialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingTeam ? "Edit Team" : "Add Team"}
            </DialogTitle>
            <DialogDescription>
              {editingTeam
                ? "Update the team details below."
                : "Fill in the details to create a new team."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grafana-text">Team Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter team name"
                        className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      />
                    </FormControl>
                    <FormMessage className="text-grafana-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orgId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grafana-text">Organization</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-grafana-dark border-grafana-dark-200 text-grafana-text">
                          <SelectValue placeholder="Select an organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
                        {organizations?.map((org) => (
                          <SelectItem key={org.id} value={String(org.id)} className="focus:bg-grafana-dark-200 focus:text-white">
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-grafana-error" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grafana-text">Email (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="team@example.com"
                        className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="text-grafana-error" />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddTeamOpen(false);
                    setEditingTeam(null);
                    form.reset();
                  }}
                  className="bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                  disabled={addTeamMutation.isPending || updateTeamMutation.isPending}
                >
                  {(addTeamMutation.isPending || updateTeamMutation.isPending) ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : editingTeam ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteTeamId !== null} onOpenChange={(open) => !open && setDeleteTeamId(null)}>
        <AlertDialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTeamId && deleteTeamMutation.mutate(deleteTeamId)}
              className="bg-grafana-error hover:bg-grafana-error/90 text-white"
              disabled={deleteTeamMutation.isPending}
            >
              {deleteTeamMutation.isPending ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </div>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
