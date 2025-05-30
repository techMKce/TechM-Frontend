import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@/service/api";

const ChangePassword = () => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const response = await api.post("/auth/updatePassword", {
      email,
      newPassword,
    });

    if (response.data === false) {
      toast.error("Failed to update password. Please try again.");
      return;
    }
    toast.success("Password updated successfully");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2 ">
            <Lock className="w-5 h-5" />
            <CardTitle className="text-2xl font-bold">
              Change Password
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>

          {/* New Password */}
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-primary text-white hover:bg-primary/90"
            onClick={handleChangePassword}
          >
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
