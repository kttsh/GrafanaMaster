import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface EditUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
}

// Define the schema for form validation
const editUserSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  login: z.string().optional(),
  company: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
  status: z.string().optional(),
});

type EditUserFormValues = z.infer<typeof editUserSchema>;

// Define interfaces for organization and user data
interface GrafanaOrganization {
  id: number;
  name: string;
  grafanaId?: number;
  status?: string;
}

interface UserOrganization {
  id: number;
  role: string;
  isDefault: boolean;
  name: string;
}

export default function EditUserDialog({ isOpen, onClose, userId }: EditUserDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState<GrafanaOrganization[]>([]);

  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: [`/api/grafana/users/${userId}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/grafana/users/${userId}`);
      const data = await res.json();
      return data;
    },
    enabled: isOpen && !!userId,
  });

  // Fetch user's organization memberships
  const { data: userOrgs, isLoading: isLoadingOrgs } = useQuery({
    queryKey: [`/api/grafana/users/${userId}/organizations`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/grafana/users/${userId}/organizations`);
      const data = await res.json();
      return data;
    },
    enabled: isOpen && !!userId,
  });

  // Fetch all available organizations
  const { data: allOrgs } = useQuery({
    queryKey: ["/api/grafana/organizations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/grafana/organizations");
      const data = await res.json();
      return data;
    },
    enabled: isOpen,
  });

  // Form setup
  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      userId: "",
      name: "",
      email: "",
      login: "",
      company: "",
      department: "",
      position: "",
      status: "active",
    },
  });

  // Update form values when user data is loaded
  useEffect(() => {
    if (userData) {
      form.reset({
        userId: userData.userId || "",
        name: userData.name || "",
        email: userData.email || "",
        login: userData.login || "",
        company: userData.company || "",
        department: userData.department || "",
        position: userData.position || "",
        status: userData.status || "active",
      });
    }
  }, [userData, form]);

  // Update organizations when data is loaded
  useEffect(() => {
    if (allOrgs) {
      setOrganizations(allOrgs as GrafanaOrganization[]);
    }
  }, [allOrgs]);

  // Handle form submission to update user
  const updateUserMutation = useMutation({
    mutationFn: async (data: EditUserFormValues) => {
      const res = await apiRequest("PATCH", `/api/grafana/users/${userId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "ユーザー更新完了",
        description: "ユーザー情報が正常に更新されました。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/grafana/users"] });
      queryClient.invalidateQueries({ queryKey: [`/api/grafana/users/${userId}`] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: `ユーザー更新に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add/remove user from an organization
  const updateOrgMembershipMutation = useMutation({
    mutationFn: async ({ action, orgId, role = "Viewer" }: { action: "add" | "remove"; orgId: number; role?: string }) => {
      if (action === "add") {
        const res = await apiRequest("POST", `/api/grafana/users/${userId}/organizations/${orgId}`, { role });
        return await res.json();
      } else {
        await apiRequest("DELETE", `/api/grafana/users/${userId}/organizations/${orgId}`);
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/grafana/users/${userId}/organizations`] });
      queryClient.invalidateQueries({ queryKey: [`/api/grafana/users/${userId}`] });
    },
    onError: (error: Error) => {
      toast({
        title: "エラー",
        description: `組織メンバーシップの更新に失敗しました: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: EditUserFormValues) => {
    setLoading(true);
    updateUserMutation.mutate(values);
  };

  const handleAddToOrg = (orgId: number, role: string = "Viewer") => {
    updateOrgMembershipMutation.mutate({ action: "add", orgId, role });
  };

  const handleRemoveFromOrg = (orgId: number) => {
    updateOrgMembershipMutation.mutate({ action: "remove", orgId });
  };

  // Check if user is already a member of an organization
  const isUserInOrg = (orgId: number) => {
    return userOrgs?.some((org: UserOrganization) => org.id === orgId) || false;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-grafana-dark-100 border-grafana-dark-200 text-grafana-text sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Edit User</DialogTitle>
          <DialogDescription>
            Update user information and manage organization memberships.
          </DialogDescription>
        </DialogHeader>

        {isLoadingUser ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-grafana-orange" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>User ID</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="User ID"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>名前</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="名前"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@example.com"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="login"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ログイン名</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ログイン名"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>会社</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="会社名"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>部門</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="部門名"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>役職</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="役職名"
                          className="bg-grafana-dark-200 border-grafana-dark-300"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ステータス</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-grafana-dark-200 border-grafana-dark-300">
                            <SelectValue placeholder="ステータスを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-grafana-dark-200 border-grafana-dark-300">
                          <SelectItem value="active">有効</SelectItem>
                          <SelectItem value="pending">保留中</SelectItem>
                          <SelectItem value="disabled">無効</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Organization Memberships */}
              <div className="mt-6">
                <Label className="text-white text-lg">Organization Memberships</Label>
                <div className="mt-2 border border-grafana-dark-300 rounded-md overflow-hidden">
                  {isLoadingOrgs ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-grafana-orange" />
                    </div>
                  ) : (
                    <div className="divide-y divide-grafana-dark-300">
                      {organizations?.map((org) => (
                        <div key={org.id} className="flex items-center justify-between p-3">
                          <div>
                            <span className="text-white">{org.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-grafana-text">Member:</span>
                            <Switch
                              checked={isUserInOrg(org.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  handleAddToOrg(org.id);
                                } else {
                                  handleRemoveFromOrg(org.id);
                                }
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={onClose}
                  type="button"
                  className="bg-grafana-dark border-grafana-dark-300 text-grafana-text hover:bg-grafana-dark-200"
                >
                  キャンセル
                </Button>
                <Button
                  type="submit"
                  disabled={loading || updateUserMutation.isPending}
                  className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                >
                  {updateUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  更新
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}