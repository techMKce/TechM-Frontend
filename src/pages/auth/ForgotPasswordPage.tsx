import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    const students = JSON.parse(localStorage.getItem("students") || "[]");
    const exists = students.some((s: any) => s.email === email);

    if (exists) {
      toast.success("Password reset link sent (mocked)");
      // In real case, trigger backend or mail service
    } else {
      toast.error("No student found with that email");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
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
          <Button onClick={handleProceed} className="w-full bg-primary text-white hover:bg-primary/90">
            Proceed
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
  );
};

export default ForgotPassword;
