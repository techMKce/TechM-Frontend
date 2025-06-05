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
import { toast } from "sonner";
import { Mail } from "lucide-react";
import api from "@/service/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleProceed = async () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    setLoading(true);

    const response = await api.post("/auth/forgotPassword", { email });
    if (response.data == true) {
      setSent(true);
      toast.success("Password reset link sent (mocked)");
    } else {
      toast.error("No student found with that email");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-blue-100 to-blue-200">
      {/* Header */}
      <div className="flex justify-center pt-6">
        <img
          src="/Karpagam_Logo-removebg-preview.png" // use a public URL or make sure it's in /public
          alt="University Logo"
          className="h-20 object-contain"
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={handleProceed}
              className="w-full bg-primary text-white hover:bg-primary/90"
              disabled={loading || sent}
            >
              {loading ? "Sending..." : sent ? "Sent Reset Link" : "Proceed"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Remember your password?{" "}
              <span
                onClick={() => navigate("/student/login")}
                className="text-blue-700 hover:underline cursor-pointer"
              >
                Back to login
              </span>
            </p>
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

export default ForgotPassword; ///ForgotPassword code