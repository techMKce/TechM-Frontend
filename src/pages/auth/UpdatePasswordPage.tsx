import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/service/api";

const ChangePassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleChangePassword = async () => {
    setError(null);

    if (!newPassword || !confirmPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }


    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      toast({ title: passwordError, variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {

      setError("Passwords do not match");
      toast({ title: "Passwords do not match", variant: "destructive" });

      return;
    }

    setLoading(true);


    try {
      const response = await api.post("/auth/updatePassword", {
        email,
        newPassword,
      });

      if (response.status === 200) {
        toast({ title: "Password updated successfully", variant: "default" });
        navigate("/student/login");
      } else {
        setError("Failed to update password. Please try again.");
        toast({ title: "Failed to update password. Please try again.", variant: "destructive" });
      }
    } catch (error: any) {
      console.error("Change password error:", error);
      
      if (error?.response?.status === 404) {
        setError("User not found. Please check your email.");
        toast({title:"User not found. Please check your email.",variant:'warning'});
      } else if (error?.response?.status === 400) {
        setError("Invalid request. Please try again.");
        toast({title:"Invalid request. Please try again.",variant:'destructive'});
      } else if (error?.response?.status === 401) {
        setError("Unauthorized. Please request a new password reset link.");
        toast({title:"Unauthorized. Please request a new password reset link.",variant:'destructive'});
      } else if (error?.response?.status >= 500) {
        setError("Server error. Please try again later.");
        toast({title:"Server error. Please try again later.",variant:'destructive'});
      } else {
        setError("Failed to update password. Please try again.");
        toast({title:"Failed to update password. Please try again.",variant:'destructive'});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleChangePassword();
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
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Lock className="w-6 h-6 text-primary" />
              <CardTitle className="text-2xl">Change Password</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Create a new secure password for your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  id="email" 
                  type="email" 
                  value={email} 
                  disabled 
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10"
                  placeholder="Enter new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded"
                  onClick={() => setShowNew(!showNew)}
                  tabIndex={0}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10"
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 rounded"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={0}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">Password Strength:</div>
                <div className="grid grid-cols-4 gap-1">
                  <div className={`h-2 rounded ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 rounded ${/(?=.*[a-z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 rounded ${/(?=.*[A-Z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                  <div className={`h-2 rounded ${/(?=.*\d)/.test(newPassword) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                </div>
                <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                  <span className={newPassword.length >= 8 ? 'text-green-600' : ''}>✓ 8+ characters</span>
                  <span className={/(?=.*[a-z])/.test(newPassword) ? 'text-green-600' : ''}>✓ Lowercase</span>
                  <span className={/(?=.*[A-Z])/.test(newPassword) ? 'text-green-600' : ''}>✓ Uppercase</span>
                  <span className={/(?=.*\d)/.test(newPassword) ? 'text-green-600' : ''}>✓ Number</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm text-center" role="alert">
                  {error}
                </p>
              </div>
            )}

            <Button
              className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              onClick={handleChangePassword}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <button
                  onClick={() => navigate("/student/login")}
                  className="text-blue-700 hover:underline cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                  type="button"
                >
                  Back to login
                </button>
              </p>
            </div>
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

export default ChangePassword;