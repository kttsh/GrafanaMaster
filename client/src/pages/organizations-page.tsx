import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Plus, Pencil, Trash2, Users, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
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
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";

// Form schema
const orgFormSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  grafanaId: z.number().optional(),
});

type OrgFormValues = z.infer<typeof orgFormSchema>;

export default function OrganizationsPage() {
  const { toast } = useToast();
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<{ id: number; name: string; grafanaId?: number } | null>(null);
  const [deleteOrgId, setDeleteOrgId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch organizations
  const { data: organizations, isLoading } = useQuery<any[]>({
    queryKey: ["/api/grafana/organizations"],
  });
  
  // 組織同期のmutation
  const syncOrgsMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      const res = await apiRequest("POST", "/api/sync/organizations");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "組織の同期が完了しました",
        description: `${data.count}件の組織を同期しました。`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: Error) => {
      toast({
        title: "同期に失敗しました",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    },
  });

  // Add organization mutation
  const addOrgMutation = useMutation({
    mutationFn: async (data: OrgFormValues) => {
      const res = await apiRequest("POST", "/api/grafana/organizations", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Organization added",
        description: "The organization has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      setIsAddOrgOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add organization: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: OrgFormValues }) => {
      const res = await apiRequest("PUT", `/api/grafana/organizations/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Organization updated",
        description: "The organization has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      setEditingOrg(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update organization: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete organization mutation
  const deleteOrgMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/grafana/organizations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Organization deleted",
        description: "The organization has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/organizations"] });
      setDeleteOrgId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to delete organization: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding or editing organizations
  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      name: editingOrg?.name || "",
      grafanaId: editingOrg?.grafanaId,
    },
  });

  // Reset form when editing org changes
  useState(() => {
    if (editingOrg) {
      form.reset({
        name: editingOrg.name,
        grafanaId: editingOrg.grafanaId,
      });
    } else {
      form.reset({
        name: "",
        grafanaId: undefined,
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: OrgFormValues) => {
    if (editingOrg) {
      updateOrgMutation.mutate({ id: editingOrg.id, data: values });
    } else {
      addOrgMutation.mutate(values);
    }
  };

  return (
    <MainLayout
      title="Organizations"
      subtitle="Manage Grafana organizations and their members"
    >
      <div className="flex justify-between items-center mb-6">
        <Button
          onClick={() => syncOrgsMutation.mutate()}
          disabled={isSyncing}
          className="flex items-center bg-grafana-teal hover:bg-grafana-teal/90 text-grafana-dark font-medium"
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
          <span>{isSyncing ? "同期中..." : "Grafanaから組織を同期"}</span>
        </Button>
        <Button
          onClick={() => setIsAddOrgOpen(true)}
          className="flex items-center bg-grafana-orange hover:bg-grafana-orange/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-grafana-dark-100 border-grafana-dark-200">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-32 bg-grafana-dark-200" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-10 w-10 rounded-full bg-grafana-dark-200" />
                    <Skeleton className="h-4 w-24 bg-grafana-dark-200" />
                  </div>
                  <Skeleton className="h-4 w-full bg-grafana-dark-200" />
                  <div className="flex justify-end space-x-2">
                    <Skeleton className="h-9 w-9 rounded-md bg-grafana-dark-200" />
                    <Skeleton className="h-9 w-9 rounded-md bg-grafana-dark-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : organizations?.length > 0 ? (
          // Display organizations
          organizations.map((org) => (
            <Card key={org.id} className="bg-grafana-dark-100 border-grafana-dark-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-white flex justify-between items-center">
                  <span>{org.name}</span>
                  {org.grafanaId && (
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                      ID: {org.grafanaId}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center text-grafana-text mb-2">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Members: 12</span>
                  </div>
                  <div className="flex items-center text-grafana-text">
                    <Building className="h-4 w-4 mr-2" />
                    <span>Teams: 3</span>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingOrg(org)}
                    className="hover:bg-grafana-dark-200 text-grafana-text hover:text-white"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteOrgId(org.id)}
                    className="hover:bg-grafana-dark-200 text-grafana-text hover:text-grafana-error"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-grafana-text">
            No organizations found. Click "Add Organization" to create one.
          </div>
        )}
      </div>

      {/* Add/Edit Organization Dialog */}
      <Dialog open={isAddOrgOpen || editingOrg !== null} onOpenChange={(open) => {
        if (!open) {
          setIsAddOrgOpen(false);
          setEditingOrg(null);
          form.reset();
        }
      }}>
        <DialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingOrg ? "Edit Organization" : "Add Organization"}
            </DialogTitle>
            <DialogDescription>
              {editingOrg
                ? "Update the organization details below."
                : "Fill in the details to create a new organization."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-grafana-text">Organization Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter organization name"
                        className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editingOrg && (
                <FormField
                  control={form.control}
                  name="grafanaId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-grafana-text">Grafana ID (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Enter Grafana ID"
                          className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          value={field.value?.toString() || ""}
                          onChange={(e) => {
                            const value = e.target.value ? parseInt(e.target.value) : undefined;
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddOrgOpen(false);
                    setEditingOrg(null);
                    form.reset();
                  }}
                  className="bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                  disabled={addOrgMutation.isPending || updateOrgMutation.isPending}
                >
                  {(addOrgMutation.isPending || updateOrgMutation.isPending) ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </div>
                  ) : editingOrg ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOrgId !== null} onOpenChange={(open) => !open && setDeleteOrgId(null)}>
        <AlertDialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this organization? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrgId && deleteOrgMutation.mutate(deleteOrgId)}
              className="bg-grafana-error hover:bg-grafana-error/90 text-white"
              disabled={deleteOrgMutation.isPending}
            >
              {deleteOrgMutation.isPending ? (
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
