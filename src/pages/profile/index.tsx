import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "@/components/StudentNavbar";
import FacultyNavbar from "@/components/FacultyNavbar";
import ProfileComponent from "@/components/ProfileComponent";

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.id) {
      navigate('/');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  // Listen for profile updates from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (updatedUser.id) {
        setCurrentUser(updatedUser);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for manual updates within the same tab
    const interval = setInterval(() => {
      const updatedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (updatedUser.id && JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setCurrentUser(updatedUser);
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [currentUser]);

  const handleUpdate = (updatedUser: any) => {
    const storageKey = currentUser.role === 'student' ? 'students' : 'faculty';
    const users = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const updatedUsers = users.map((user: any) => 
      user.id === currentUser.id 
        ? { ...user, ...updatedUser }
        : user
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const isStudent = currentUser.role === 'student';
  const NavbarComponent = isStudent ? StudentNavbar : FacultyNavbar;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarComponent currentPage="/profile" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your profile information and settings</p>
        </div>
        <ProfileComponent 
          userType={currentUser.role} 
          currentUser={currentUser}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}