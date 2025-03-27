import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MainLayout from "@/components/layout/main-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, Database, Server } from "lucide-react";

// Form schemas
const grafanaSettingsSchema = z.object({
  grafanaUrl: z.string().url("Please enter a valid URL"),
  grafanaAdminUser: z.string().min(1, "Username is required"),
  grafanaAdminPassword: z.string().min(1, "Password is required"),
  autoSync: z.boolean().default(false),
});

const opoppoSettingsSchema = z.object({
  opoppoDbHost: z.string().min(1, "Host is required"),
  opoppoDbName: z.string().min(1, "Database name is required"),
  opoppoDbUser: z.string().min(1, "Username is required"),
  opoppoDbPassword: z.string().min(1, "Password is required"),
  opoppoDbPort: z.string().regex(/^\d+$/, "Port must be a number"),
  opoppoDbSsl: z.boolean().default(false),
});

type GrafanaSettingsValues = z.infer<typeof grafanaSettingsSchema>;
type OPoppoSettingsValues = z.infer<typeof opoppoSettingsSchema>;

export default function SettingsPage() {
  const { toast } = useToast();

  // Grafana settings form
  const grafanaForm = useForm<GrafanaSettingsValues>({
    resolver: zodResolver(grafanaSettingsSchema),
    defaultValues: {
      grafanaUrl: "http://localhost:3000",
      grafanaAdminUser: "admin",
      grafanaAdminPassword: "",
      autoSync: false,
    },
  });

  // Opoppo settings form
  const opoppoForm = useForm<OPoppoSettingsValues>({
    resolver: zodResolver(opoppoSettingsSchema),
    defaultValues: {
      opoppoDbHost: "muska01",
      opoppoDbName: "OPO_C",
      opoppoDbUser: "",
      opoppoDbPassword: "",
      opoppoDbPort: "5432",
      opoppoDbSsl: false,
    },
  });

  // Fetch settings
  const { data: grafanaSettings, isLoading: isLoadingGrafanaSettings } = useQuery({
    queryKey: ["/api/settings/grafana"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/settings/grafana");
        if (!res.ok) throw new Error("Failed to fetch Grafana settings");
        const data = await res.json();
        return JSON.parse(data.value || "{}");
      } catch (error) {
        console.error("Error fetching Grafana settings:", error);
        return {};
      }
    },
  });

  const { data: opoppoSettings, isLoading: isLoadingOPoppoSettings } = useQuery({
    queryKey: ["/api/settings/opoppo"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/settings/opoppo");
        if (!res.ok) throw new Error("Failed to fetch Opoppo settings");
        const data = await res.json();
        return JSON.parse(data.value || "{}");
      } catch (error) {
        console.error("Error fetching Opoppo settings:", error);
        return {};
      }
    },
  });

  // Update form values when data is loaded
  useEffect(() => {
    if (grafanaSettings) {
      grafanaForm.reset({
        grafanaUrl: grafanaSettings.grafanaUrl || "http://localhost:3000",
        grafanaAdminUser: grafanaSettings.grafanaAdminUser || "admin",
        grafanaAdminPassword: grafanaSettings.grafanaAdminPassword || "",
        autoSync: grafanaSettings.autoSync || false,
      });
    }
  }, [grafanaSettings]);

  useEffect(() => {
    if (opoppoSettings) {
      opoppoForm.reset({
        opoppoDbHost: opoppoSettings.opoppoDbHost || "muska01",
        opoppoDbName: opoppoSettings.opoppoDbName || "OPO_C",
        opoppoDbUser: opoppoSettings.opoppoDbUser || "",
        opoppoDbPassword: opoppoSettings.opoppoDbPassword || "",
        opoppoDbPort: opoppoSettings.opoppoDbPort || "5432",
        opoppoDbSsl: opoppoSettings.opoppoDbSsl || false,
      });
    }
  }, [opoppoSettings]);

  // Update settings mutations
  const updateGrafanaSettingsMutation = useMutation({
    mutationFn: async (data: GrafanaSettingsValues) => {
      const res = await apiRequest("PUT", "/api/settings/grafana", {
        value: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Grafana settings saved",
        description: "Your Grafana settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/grafana"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to save Grafana settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateOPoppoSettingsMutation = useMutation({
    mutationFn: async (data: OPoppoSettingsValues) => {
      const res = await apiRequest("PUT", "/api/settings/opoppo", {
        value: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Opoppo settings saved",
        description: "Your Opoppo database settings have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/opoppo"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to save Opoppo settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmitGrafanaSettings = (values: GrafanaSettingsValues) => {
    updateGrafanaSettingsMutation.mutate(values);
  };

  const onSubmitOPoppoSettings = (values: OPoppoSettingsValues) => {
    updateOPoppoSettingsMutation.mutate(values);
  };

  return (
    <MainLayout
      title="Settings"
      subtitle="Configure Grafana Master Management System"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafana API Settings */}
        <Card className="bg-grafana-dark-100 border-grafana-dark-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-grafana-orange" />
              <CardTitle className="text-lg text-white">Grafana API Settings</CardTitle>
            </div>
            <CardDescription>
              Configure the connection to your Grafana instance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingGrafanaSettings ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                <Skeleton className="h-10 w-full bg-grafana-dark-200" />
                <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                <Skeleton className="h-10 w-full bg-grafana-dark-200" />
                <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                <Skeleton className="h-10 w-full bg-grafana-dark-200" />
                <Skeleton className="h-10 w-24 bg-grafana-dark-200" />
              </div>
            ) : (
              <Form {...grafanaForm}>
                <form onSubmit={grafanaForm.handleSubmit(onSubmitGrafanaSettings)} className="space-y-4">
                  <FormField
                    control={grafanaForm.control}
                    name="grafanaUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-grafana-text">Grafana URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="http://localhost:3000"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormDescription className="text-grafana-text/70">
                          The URL of your Grafana instance
                        </FormDescription>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grafanaForm.control}
                    name="grafanaAdminUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-grafana-text">Admin Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="admin"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormDescription className="text-grafana-text/70">
                          Grafana admin username for API access
                        </FormDescription>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grafanaForm.control}
                    name="grafanaAdminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-grafana-text">Admin Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormDescription className="text-grafana-text/70">
                          Grafana admin password for API access
                        </FormDescription>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={grafanaForm.control}
                    name="autoSync"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-grafana-dark-200 p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white">Auto Synchronization</FormLabel>
                          <FormDescription className="text-grafana-text/70">
                            Automatically sync users daily
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-grafana-orange"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                    disabled={updateGrafanaSettingsMutation.isPending}
                  >
                    {updateGrafanaSettingsMutation.isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Grafana Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        {/* Opoppo Database Settings */}
        <Card className="bg-grafana-dark-100 border-grafana-dark-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg text-white">Opoppo Database Settings</CardTitle>
            </div>
            <CardDescription>
              Configure the connection to the Opoppo user repository
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingOPoppoSettings ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                <Skeleton className="h-10 w-full bg-grafana-dark-200" />
                <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                <Skeleton className="h-10 w-full bg-grafana-dark-200" />
                <Skeleton className="h-4 w-32 bg-grafana-dark-200" />
                <Skeleton className="h-10 w-full bg-grafana-dark-200" />
                <Skeleton className="h-10 w-24 bg-grafana-dark-200" />
              </div>
            ) : (
              <Form {...opoppoForm}>
                <form onSubmit={opoppoForm.handleSubmit(onSubmitOPoppoSettings)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={opoppoForm.control}
                      name="opoppoDbHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-grafana-text">Host</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="muska01"
                              className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                            />
                          </FormControl>
                          <FormMessage className="text-grafana-error" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={opoppoForm.control}
                      name="opoppoDbPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-grafana-text">Port</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="5432"
                              className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                            />
                          </FormControl>
                          <FormMessage className="text-grafana-error" />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={opoppoForm.control}
                    name="opoppoDbName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-grafana-text">Database Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="OPO_C"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={opoppoForm.control}
                    name="opoppoDbUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-grafana-text">Username</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="database_user"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={opoppoForm.control}
                    name="opoppoDbPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-grafana-text">Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                          />
                        </FormControl>
                        <FormMessage className="text-grafana-error" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={opoppoForm.control}
                    name="opoppoDbSsl"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border border-grafana-dark-200 p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-white">SSL Connection</FormLabel>
                          <FormDescription className="text-grafana-text/70">
                            Enable SSL for database connection
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-grafana-orange"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={updateOPoppoSettingsMutation.isPending}
                  >
                    {updateOPoppoSettingsMutation.isPending ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Database Settings
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card className="bg-grafana-dark-100 border-grafana-dark-200 mt-6">
        <CardHeader>
          <CardTitle className="text-lg text-white">System Information</CardTitle>
          <CardDescription>
            Details about the Grafana Master Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between py-2 border-b border-grafana-dark-200">
              <span className="text-grafana-text">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-grafana-dark-200">
              <span className="text-grafana-text">Environment</span>
              <span className="text-white">{process.env.NODE_ENV || "development"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-grafana-dark-200">
              <span className="text-grafana-text">Database</span>
              <span className="text-white">PostgreSQL</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-grafana-text">Server Time</span>
              <span className="text-white">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
