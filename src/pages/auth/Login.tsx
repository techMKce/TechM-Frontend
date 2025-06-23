import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircleIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

import { toast } from "@/hooks/use-toast";

import { Mail, Lock, Eye, EyeOff } from "lucide-react";


const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    
    if (!email || !password) {
      toast({title:`Please fill all fields !`,variant:'warning'});
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({title:"Please enter a valid email address",variant:'destructive'});
      return;
    }

    setIsLoading(true);

    try {
      await signIn({ email, password });
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error?.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
        toast({title:"Invalid email or password. Please try again.",variant:'destructive'});
      } else if (error?.response?.status === 404) {
        setError("No account found with this email address.");
        toast({title:"No account found with this email address.",variant:'destructive'});
      } else if (error?.response?.status === 403) {
        setError("Your account has been suspended. Please contact support.");
        toast({title:"Your account has been suspended. Please contact support.",variant:'destructive'});
      } else if (error?.response?.status === 429) {
        setError("Too many login attempts. Please try again later.");
        toast({title:"Too many login attempts. Please try again later.",variant:'destructive'});
      } else if (error?.response?.status >= 500) {
        setError("Server error. Please try again later.");
        toast({title:"Server error. Please try again later.",variant:'destructive'});
      } else {
        setError("Login failed. Please try again.");
        toast({title:"Login failed. Please try again.",variant:'destructive'});
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-100 to-blue-200">
      {/* Header */}
      <div className="flex justify-center pt-6">
        <img
          src="/Karpagam_Logo-removebg-preview.png"
          alt="University Logo"
          className="h-20 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-sm mt-2">
              Enter your credentials to access the portal
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10"
                  disabled={isLoading}
                  aria-describedby={error ? "login-error" : undefined}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p id="login-error" className="text-red-800 text-sm text-center" role="alert">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              disabled={isLoading}
              type="button"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 p-4">
        © {new Date().getFullYear()} University Learning Portal. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;