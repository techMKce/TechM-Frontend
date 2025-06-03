import { Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Home, BookOpen, Users, Book, Signpost, ListTodoIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface StudentNavbarProps {
  currentPage?: string;
}

const StudentNavbar = ({ currentPage }: StudentNavbarProps) => {
  const navigate = useNavigate();
  const {signOut, isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    console.log('Initial user data:', user);
    return user;
  });

  // Listen for profile updates
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      console.log('Updated user data:', updatedUser);
      setCurrentUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for manual updates within the same tab
    const interval = setInterval(() => {
      const updatedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleLogout = () => {
    signOut();
    // navigate("/login");
  };

    // if (!isAuthenticated) {
    //   return <Navigate to="/login" />;
    // }

  const menuItems = [
    { label: "Dashboard", path: "/student/dashboard", icon: Home },
    { label: "Courses", path: "/student/courses", icon: BookOpen },,
    { label: "Attendance", path: "/student/attendance", icon: ListTodoIcon },
    {label: "Exams", path: "/student/exams", icon: Book }
  ];

  const userName = currentUser?.name || 'Student';
  const userEmail = currentUser?.email || 'student@example.com';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img src="/Zeno.png"  className="h-8 w-auto" />
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
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    {currentUser?.profileImage ? (
                      <AvatarImage src={currentUser.profileImage} alt="Profile" />
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
                <DropdownMenuItem onClick={() => navigate('/profile')}>
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