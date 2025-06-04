import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
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
  Users,
  BookOpen,
  UserCheck,
  ListTodoIcon,
  Book,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface FacultyNavbarProps {
  currentPage?: string;
}

const FacultyNavbar = ({ currentPage }: FacultyNavbarProps) => {
  const { signOut,isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("currentUser") || "{}")
  );

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      setCurrentUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for manual updates within the same tab
    const interval = setInterval(() => {
      const updatedUser = JSON.parse(
        localStorage.getItem("currentUser") || "{}"
      );
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleLogout = () => {
    signOut();
    // navigate("/");
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

  // if (!isAuthenticated) {
  //   return <Navigate to="/login" />;
  // }

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
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {currentUser.profileImage ? (
                      <AvatarImage
                        src={currentUser.profileImage}
                        alt="Profile"
                      />
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
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
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
