import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Redirect, useLocation } from "wouter";
import { insertUserSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<string>("login");
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    // Remove confirmPassword as it's not in the schema
    const { confirmPassword, ...registerData } = values;
    registerMutation.mutate(registerData);
  };

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-grafana-black">
      {/* Hero Section */}
      <div className="hidden md:flex md:w-1/2 bg-grafana-dark-100 p-8 flex-col justify-center items-center">
        <div className="max-w-lg">
          <div className="flex items-center mb-6">
            <img 
              src="https://grafana.com/static/assets/img/grafana_icon.svg" 
              alt="Grafana Logo" 
              className="h-16 w-16 mr-4"
            />
            <h1 className="text-3xl font-bold text-white">Grafana Master Management</h1>
          </div>
          <p className="text-grafana-text text-xl mb-6">
            Centralized management system for Grafana users, organizations, and teams with Opoppo integration.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-grafana-orange/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6 text-grafana-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">User Synchronization</h3>
                <p className="text-grafana-text">Seamlessly sync users between Opoppo and Grafana</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-grafana-orange/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6 text-grafana-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Complete User Management</h3>
                <p className="text-grafana-text">Manage users, organizations, and teams in one place</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-grafana-orange/20 p-2 rounded-full mr-4">
                <svg className="h-6 w-6 text-grafana-orange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium">Detailed Activity Tracking</h3>
                <p className="text-grafana-text">Monitor user activity and synchronization status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-md border-grafana-dark-200 bg-grafana-dark-100">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl text-white">
              {activeTab === "login" ? "Sign In" : "Create an Account"}
            </CardTitle>
            <CardDescription className="text-grafana-text">
              {activeTab === "login" 
                ? "Enter your credentials to access the management system" 
                : "Register a new account to get started"}
            </CardDescription>
          </CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-grafana-text">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      {...loginForm.register("username")}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-grafana-error">
                        {loginForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-grafana-text">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-grafana-error">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            {/* Register Form */}
            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-grafana-text">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="First name"
                        className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                        {...registerForm.register("firstName")}
                      />
                      {registerForm.formState.errors.firstName && (
                        <p className="text-sm text-grafana-error">
                          {registerForm.formState.errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-grafana-text">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Last name"
                        className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                        {...registerForm.register("lastName")}
                      />
                      {registerForm.formState.errors.lastName && (
                        <p className="text-sm text-grafana-error">
                          {registerForm.formState.errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-grafana-text">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-grafana-error">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-username" className="text-grafana-text">Username</Label>
                    <Input
                      id="reg-username"
                      placeholder="Choose a username"
                      className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      {...registerForm.register("username")}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-grafana-error">
                        {registerForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="text-grafana-text">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password"
                      className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-grafana-error">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-grafana-text">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="bg-grafana-dark border-grafana-dark-200 text-grafana-text"
                      {...registerForm.register("confirmPassword")}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-grafana-error">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-grafana-orange hover:bg-grafana-orange/90 text-white"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
