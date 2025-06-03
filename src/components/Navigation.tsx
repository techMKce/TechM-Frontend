
import React from 'react';
import { Calendar, BookOpen, Users, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  currentPage: string;
  userRole: 'student' | 'faculty';
}

const Navigation = ({ currentPage, userRole }: NavigationProps) => {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/courses' },
    { id: 'exams', label: 'Exams', icon: Calendar, path: '/exams' },
    { id: 'attendance', label: 'Attendance', icon: Users, path: '/attendance' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-900 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="font-bold text-gray-900">ZENO</span>
            </div>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center space-x-2 px-4 py-2 ${
                      isActive ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">S</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
