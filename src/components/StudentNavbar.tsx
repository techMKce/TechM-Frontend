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
import axios from "axios";

interface StudentNavbarProps {
  currentPage?: string;
}

const StudentNavbar = ({ currentPage }: StudentNavbarProps) => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth(); // user contains logged-in user's info (email or id)
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const response = await axios.get("/auth/students/all"); // Update this to your real API
        const allStudents = response.data;

        // Match using email or ID
        const matched = allStudents.find(
          (student: any) => student.email === user?.email // Or use ID if preferred
        );

        setCurrentUser(matched);
      } catch (error) {
        console.error("Failed to fetch student data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user]);

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  const menuItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: Home },

    { label: "Courses", path: "/student/courses", icon: BookOpen },,
    { label: "Attendance", path: "/student/attendance", icon: ListTodoIcon },
    {label: "Exams", path: "/student/exams", icon: Book }
  ];

  const userName = currentUser?.name || "Student";
  const userEmail = currentUser?.email || "student@example.com";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

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
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100"
                >
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    {currentUser?.image ? (
                      <AvatarImage src={currentUser.image} alt="Profile" />
                    ) : (
                      <AvatarFallback className="bg-blue-500 text-white text-sm font-semibold">
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

export default StudentNavbar;
