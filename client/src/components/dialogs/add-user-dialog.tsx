import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2 } from "lucide-react";

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Form schema for adding a user
const addUserSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  login: z.string().min(1, "Login is required"),
  department: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  status: z.string().default("pending"),
  organizations: z.array(z.object({
    id: z.number(),
    isDefault: z.boolean().default(false),
    role: z.string().default("Viewer"),
  })).optional(),
});

type AddUserFormValues = z.infer<typeof addUserSchema>;

export default function AddUserDialog({ isOpen, onClose }: AddUserDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoadingOPoppoUser, setIsLoadingOPoppoUser] = useState(false);
  
  // Fetch organizations for the org selection
  const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery<Array<{ id: number, name: string }>>({
    queryKey: ["/api/grafana/organizations"],
    enabled: isOpen, // Only fetch when dialog is open
  });

  // Add user mutation
  const addUserMutation = useMutation({
    mutationFn: async (data: AddUserFormValues) => {
      // First create the user
      const res = await apiRequest("POST", "/api/grafana/users", {
        userId: data.userId,
        name: data.name,
        email: data.email,
        login: data.login,
        department: data.department,
        position: data.position,
        company: data.company,
        status: data.status,
      });
      
      const user = await res.json();
      
      // Then add the user to selected organizations
      if (data.organizations && data.organizations.length > 0) {
        await Promise.all(
          data.organizations.map(async (org) => {
            return apiRequest("POST", `/api/grafana/users/${user.id}/organizations/${org.id}`, {
              role: org.role,
              isDefault: org.isDefault,
            });
          })
        );
      }
      
      return user;
    },
    onSuccess: () => {
      toast({
        title: "User added",
        description: "The user has been added successfully.",
      });
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      // Reset form and close dialog
      form.reset();
      setStep(1);
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add user: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form for adding a user
  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      userId: "",
      name: "",
      email: "",
      login: "",
      department: "",
      position: "",
      company: "",
      status: "pending",
      organizations: [],
    },
  });

  // Fetch Opoppo user data when user ID is entered
  const fetchOPoppoUserData = async (userId: string) => {
    if (!userId.trim()) return;
    
    setIsLoadingOPoppoUser(true);
    try {
      const response = await fetch(`/api/opoppo/users/${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "User not found",
            description: "No user with this ID was found in Opoppo system.",
            variant: "destructive",
          });
        } else {
          throw new Error("Failed to fetch user data");
        }
      } else {
        const userData = await response.json();
        
        // Fill form fields with the fetched data
        form.setValue("name", `${userData.SEI} ${userData.MEI}`, { shouldValidate: true });
        form.setValue("email", `${userData.USER_ID}@example.com`, { shouldValidate: true });
        form.setValue("login", userData.USER_ID, { shouldValidate: true });
        form.setValue("company", userData.KAISYA_NM || "", { shouldValidate: true });
        form.setValue("department", userData.SOSHIKI_NM || "", { shouldValidate: true });
        form.setValue("position", userData.YAKUSYOKU_NM || "", { shouldValidate: true });
        
        toast({
          title: "User data loaded",
          description: "Opoppo user data has been loaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user data from Opoppo.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOPoppoUser(false);
    }
  };

  // Handle form submission
  const onSubmit = (values: AddUserFormValues) => {
    addUserMutation.mutate(values);
  };

  // Handle organization selection
  const toggleOrganization = (orgId: number) => {
    const currentOrgs = form.getValues("organizations") || [];
    const index = currentOrgs.findIndex(org => org.id === orgId);
    
    if (index >= 0) {
      // Remove org if already selected
      const newOrgs = [...currentOrgs];
      newOrgs.splice(index, 1);
      form.setValue("organizations", newOrgs, { shouldValidate: true });
    } else {
      // Add org if not selected
      const newOrgs = [...currentOrgs, { id: orgId, isDefault: false, role: "Viewer" }];
      form.setValue("organizations", newOrgs, { shouldValidate: true });
    }
  };

  // Set an organization as default
  const setDefaultOrg = (orgId: number) => {
    const currentOrgs = form.getValues("organizations") || [];
    const newOrgs = currentOrgs.map(org => ({
      ...org,
      isDefault: org.id === orgId,
    }));
    form.setValue("organizations", newOrgs, { shouldValidate: true });
  };

  // Update role for an organization
  const updateOrgRole = (orgId: number, role: string) => {
    const currentOrgs = form.getValues("organizations") || [];
    const newOrgs = currentOrgs.map(org => 
      org.id === orgId ? { ...org, role } : org
    );
    form.setValue("organizations", newOrgs, { shouldValidate: true });
  };

  // Check if an organization is selected
  const isOrgSelected = (orgId: number) => {
    const currentOrgs = form.getValues("organizations") || [];
    return currentOrgs.some(org => org.id === orgId);
  };

  // Get the default organization
  const getDefaultOrg = () => {
    const currentOrgs = form.getValues("organizations") || [];
    return currentOrgs.find(org => org.isDefault)?.id;
  };

  // Get the role for an organization
  const getOrgRole = (orgId: number) => {
    const currentOrgs = form.getValues("organizations") || [];
    return currentOrgs.find(org => org.id === orgId)?.role || "Viewer";
  };

  // Handle dialog close
  const handleClose = () => {
    setStep(1);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white">Add New User</DialogTitle>
          <DialogDescription>
            {step === 1 ? "Fill in the user details below." : "Select organizations for this user."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Info */}
                <div>
                  <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User ID</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl className="flex-1">
                            <Input
                              {...field}
                              placeholder="Enter user ID"
                              className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                            />
                          </FormControl>
                          <Button 
                            type="button" 
                            variant="secondary" 
                            className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                            onClick={() => fetchOPoppoUserData(field.value)}
                            disabled={isLoadingOPoppoUser || !field.value}
                          >
                            {isLoadingOPoppoUser ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                            Load
                          </Button>
                        </div>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter full name"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="Enter email address"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="login"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Login Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter login username"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Organization Info */}
                <div>
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter company name"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter department"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Position</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter position"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-grafana-dark border-grafana-dark-200 text-grafana-text">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
                            <SelectItem value="pending" className="focus:bg-grafana-dark-200 focus:text-white">Pending</SelectItem>
                            <SelectItem value="active" className="focus:bg-grafana-dark-200 focus:text-white">Active</SelectItem>
                            <SelectItem value="disabled" className="focus:bg-grafana-dark-200 focus:text-white">Disabled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-grafana-text mb-2 block">Grafana Organizations</Label>
                {isLoadingOrgs ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-grafana-orange" />
                    <span className="ml-2">Loading organizations...</span>
                  </div>
                ) : organizations && organizations.length > 0 ? (
                  <div className="space-y-4 mt-2 max-h-64 overflow-y-auto pr-2 grafana-scrollbar">
                    {organizations.map((org) => (
                      <div key={org.id} className="border border-grafana-dark-200 rounded-md p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Checkbox
                              id={`org-${org.id}`}
                              checked={isOrgSelected(org.id)}
                              onCheckedChange={() => toggleOrganization(org.id)}
                              className="text-grafana-orange border-grafana-gray focus:ring-grafana-orange"
                            />
                            <Label htmlFor={`org-${org.id}`} className="ml-2 text-white font-medium">
                              {org.name}
                            </Label>
                          </div>
                          {isOrgSelected(org.id) && (
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`default-${org.id}`} className="text-sm text-grafana-text">
                                Default
                              </Label>
                              <Checkbox
                                id={`default-${org.id}`}
                                checked={getDefaultOrg() === org.id}
                                onCheckedChange={() => setDefaultOrg(org.id)}
                                className="text-blue-500 border-grafana-gray focus:ring-blue-500"
                                disabled={!isOrgSelected(org.id)}
                              />
                            </div>
                          )}
                        </div>
                        
                        {isOrgSelected(org.id) && (
                          <div className="ml-6 mt-2">
                            <Label className="text-sm text-grafana-text mb-1 block">
                              Role in {org.name}
                            </Label>
                            <Select
                              value={getOrgRole(org.id)}
                              onValueChange={(value) => updateOrgRole(org.id, value)}
                            >
                              <SelectTrigger className="w-full md:w-40 bg-grafana-dark border-grafana-dark-200 text-grafana-text">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text">
                                <SelectItem value="Admin" className="focus:bg-grafana-dark-200 focus:text-white">Admin</SelectItem>
                                <SelectItem value="Editor" className="focus:bg-grafana-dark-200 focus:text-white">Editor</SelectItem>
                                <SelectItem value="Viewer" className="focus:bg-grafana-dark-200 focus:text-white">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 text-grafana-text border border-grafana-dark-200 rounded-md">
                    No organizations found
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="border-t border-grafana-dark-200 pt-4 flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
              {step === 1 ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="mt-3 sm:mt-0 bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                  >
                    Next: Organization Assignment
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex flex-col-reverse sm:flex-row sm:space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="mt-3 sm:mt-0 bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      className="mt-3 sm:mt-0 bg-grafana-dark border-grafana-dark-200 text-grafana-text hover:bg-grafana-dark-200"
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  <Button
                    type="submit"
                    className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                    disabled={addUserMutation.isPending}
                  >
                    {addUserMutation.isPending ? (
                      <div className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Adding User...</span>
                      </div>
                    ) : (
                      "Add User"
                    )}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
