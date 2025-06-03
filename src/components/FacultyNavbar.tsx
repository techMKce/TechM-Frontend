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
import {
  User,
  LogOut,
  Home,
  BookOpen,
  ListTodoIcon,
  Book,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

interface FacultyNavbarProps {
  currentPage?: string;
}

const FacultyNavbar = ({ currentPage }: FacultyNavbarProps) => {
  const { signOut, user } = useAuth(); // Assuming `user` contains email or id
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const menuItems = [
    { label: "Dashboard", path: "/faculty/dashboard", icon: Home },
    { label: "Courses", path: "/faculty/courses", icon: BookOpen },
    { label: "Attendance", path: "/faculty/attendance", icon: ListTodoIcon },
  ];

  useEffect(() => {
    const fetchAllFaculty = async () => {
      try {
        const response = await axios.get("/api/faculty/all"); // Replace with your real endpoint
        const allFaculty = response.data;

        // Filter using email or ID — replace with actual logic
        const matchedFaculty = allFaculty.find(
          (f: any) => f.email === user?.email // or f.id === user?.id
        );

        setCurrentUser(matchedFaculty);
      } catch (error) {
        console.error("Error fetching faculty list:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFaculty();
  }, [user]);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/faculty/dashboard", icon: Home },
    { label: "Courses", path: "/faculty/courses", icon: BookOpen },
    { label: "Attendance", path: "/faculty/attendance", icon: ListTodoIcon },
    {label: "Exams", path: "/faculty/exams", icon: Book }
  ];

  const initials = currentUser.name
    ? currentUser.name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
    : "F";

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
                  <Avatar className="h-8 w-8">
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
                    <p className="font-medium">{currentUser?.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser?.email}
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
