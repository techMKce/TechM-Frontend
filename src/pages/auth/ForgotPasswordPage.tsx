// ForgotPassword.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import api from "@/service/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProceed = async () => {
    // Reset error state
    setError(null);
    
    if (!email) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({title:"Please enter a valid email address",variant:'destructive'});
      return;
    }
    
    setLoading(true);


    try {
      const response = await api.post("/auth/forgotPassword", { email });
      
      // Check response status properly
      if (response.status === 200) {
        setSent(true);
        toast({ title: "Password reset link sent!!", variant: "default" });
      }
    } catch (error: any) {
      console.error("Forgot password error:", error);
      
      if (error?.response?.status === 404) {
        setError("No account found with that email. Please check and try again.");
        toast({ title: "No student found with that email", variant: "destructive" });
      } else if (error?.response?.status === 400) {
        setError("Invalid email format. Please check and try again.");
        toast({ title: "Invalid email format. Please check and try again.", variant: "destructive" });
      } else if (error?.response?.status === 429) {
        setError("Too many requests. Please try again later.");
        toast({ title: "Too many requests. Please try again later.", variant: "destructive" });
      } else if (error?.response?.status >= 500) {
        setError("Server error. Please try again later.");
        toast({ title: "Server error. Please try again later.", variant: "destructive" });
      } else {
        setError("Something went wrong. Please try again later.");
        toast({ title: "Something went wrong. Please try again later.", variant: "destructive" });
      }
      
      setSent(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !sent) {
      handleProceed();
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
            // Hide image if it fails to load
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription className="text-sm mt-2">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                  disabled={loading || sent}
                  aria-describedby={error ? "email-error" : undefined}
                />
              </div>
            </div>
            
            {/* Error message */}
            {error && (
              <p id="email-error" className="text-red-600 text-sm text-center" role="alert">
                {error}
              </p>
            )}
            
            {/* Success message */}
            {sent && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-green-800 text-sm text-center">
                  ✓ Password reset link has been sent to your email
                </p>
              </div>
            )}
            
            <Button
              onClick={handleProceed}
              className="w-full bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
              disabled={loading || sent}
              type="button"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : sent ? (
                "Email Sent"
              ) : (
                "Send Reset Link"
              )}
            </Button>
            
            <div className="text-center space-y-2">
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
              
              {sent && (
                <p className="text-xs text-gray-500">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSent(false);
                      setError(null);
                    }}
                    className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
                    type="button"
                  >
                    try again
                  </button>
                </p>
              )}
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

export default ForgotPassword;