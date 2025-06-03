
import React from 'react';
import { Calendar, Clock, MapPin, User, Users, BookOpen, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Exam {
  id: string;
  subject: string;
  course: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  faculty: string;
  totalStudents: number;
  description?: string;
}

interface ExamCardProps {
  exam: Exam;
  userRole: 'STUDENT' | 'FACULTY';
}

const ExamCard = ({ exam, userRole }: ExamCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'final':
        return 'bg-red-100 text-red-800';
      case 'midterm':
        return 'bg-orange-100 text-orange-800';
      case 'quiz':
        return 'bg-blue-100 text-blue-800';
      case 'assignment':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return exam.date === today;
  };

  const isPast = () => {
    const today = new Date().toISOString().split('T')[0];
    return exam.date < today;
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${isToday() ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">{exam.subject}</h3>
              {isToday() && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Today
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{exam.course}</p>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(exam.status)}>
                {exam.status.charAt(0).toUpperCase() + exam.status.slice(1).replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={getTypeColor(exam.type)}>
                {exam.type.charAt(0).toUpperCase() + exam.type.slice(1)}
              </Badge>
            </div>
          </div>
          
          {userRole === 'FACULTY' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Exam</DropdownMenuItem>
                <DropdownMenuItem>View Students</DropdownMenuItem>
                <DropdownMenuItem>Export Results</DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">Cancel Exam</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(exam.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{exam.time} ({exam.duration})</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{exam.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {userRole === 'STUDENT' ? (
                <>
                  <User className="h-4 w-4" />
                  <span>Faculty: {exam.faculty}</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span>{exam.totalStudents} Students</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {exam.description && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {exam.description}
            </p>
          </div>
        )}
        
        <div className="flex gap-2">
          {exam.status === 'upcoming' && !isPast() && (
            <>
              <Button variant="outline" size="sm" className="flex-1">
                {userRole === 'STUDENT' ? 'View Details' : 'Manage Exam'}
              </Button>
              {userRole === 'STUDENT' && (
                <Button variant="ghost" size="sm">
                  Add to Calendar
                </Button>
              )}
            </>
          )}
          
          {exam.status === 'completed' && (
            <Button variant="outline" size="sm" className="flex-1">
              {userRole === 'STUDENT' ? 'View Results' : 'View Report'}
            </Button>
          )}
          
          {exam.status === 'in-progress' && (
            <Button size="sm" className="flex-1">
              {userRole === 'STUDENT' ? 'Join Exam' : 'Monitor Exam'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExamCard;
