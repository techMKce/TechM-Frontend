
import { useState } from "react";
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

interface AdminNavbarProps {
  currentPage?: string;
}

const AdminNavbar = ({ currentPage }: AdminNavbarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard" },
    { label: "Students", path: "/admin/students" },
    { label: "Faculty", path: "/admin/faculty" },
    { label: "Courses", path: "/admin/courses" },
    { label: "Assign Students", path: "/admin/assign-students" }
  ];

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex space-x-4">
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  variant={currentPage === item.path ? "default" : "ghost"}
                  onClick={() => navigate(item.path)}
                  className="text-sm"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-500 text-white">A</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
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
