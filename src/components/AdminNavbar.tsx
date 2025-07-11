import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AdminNavbarProps {
  currentPage?: string; // like "/admin/faculty"
}

const AdminNavbar = ({ currentPage }: AdminNavbarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Students", path: "/admin/students" },
    { label: "Faculty", path: "/admin/faculty" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Assign Students", path: "/admin/assign-students" },
    { label: "Schedule", path: "/admin/schedule" }
  ];

  const handleLogout = () => {
    signOut();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Menu Items */}
          <div className="flex items-center space-x-8">
            <img src="/Zeno.png" alt="Logo" className="h-8 w-auto" />

            <div className="flex space-x-2">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant={currentPage === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className={`text-sm px-3 py-2 ${currentPage === item.path ? "text-white" : "text-gray-700"
                    }`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Avatar and Dropdown */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-500 text-white">A</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
