import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import { User, LogOut, Home, BookOpen, ListTodoIcon } from "lucide-react";


import { useAuth } from "@/hooks/useAuth";
import profileApi from "@/service/api"; // Import the same API instance used in index.tsx
import toast from "react-hot-toast";

interface FacultyNavbarProps {
  currentPage?: string;
}

const FacultyNavbar = ({ currentPage }: FacultyNavbarProps) => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth(); // Use profile from useAuth
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchFacultyData = async () => {
      if (!profile || !profile.profile?.id) return;

      try {
        // Use the same API endpoint pattern as in index.tsx
        const response = await profileApi.get(`/profile/faculty/${profile.profile.id}`);
        setCurrentUser(response.data);
      } catch (error) {
        toast.error("Failed to load faculty profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [profile]); // Watch for changes in profile

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };


  const userName = currentUser?.name || "Faculty";
  const userEmail = currentUser?.email || "faculty@example.com";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();
  const menuItems = [
    { label: "Dashboard", path: "/faculty/dashboard", icon: Home },
    { label: "Courses", path: "/faculty/courses", icon: BookOpen },
    { label: "Attendance", path: "/faculty/attendance", icon: ListTodoIcon },
    {label: "Exams", path: "/faculty/exams", icon: BookOpen }
  ];



  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b h-16 flex items-center px-6">
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src="/Zeno.png" alt="Logo" className="h-8 w-auto" />
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={currentPage === item.path ? "default" : "ghost"}
                    onClick={() => navigate(item.path)}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full p-0"
                >
                  <Avatar className="h-8 w-8 bg-gray-400">
                    {currentUser?.image ? (
                      <AvatarImage src={currentUser.image} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-green-500 text-white">
                        {initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{userName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default FacultyNavbar;