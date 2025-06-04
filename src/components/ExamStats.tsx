
import React from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

interface ExamStatsProps {
  exams: Exam[];
  userRole: string;
}

const ExamStats = ({ exams, userRole }: ExamStatsProps) => {
  const upcomingExams = exams.filter(exam => exam.status === 'upcoming').length;
  const completedExams = exams.filter(exam => exam.status === 'completed').length;
  const totalExams = exams.length;
  const todayExams = exams.filter(exam => {
    const today = new Date().toISOString().split('T')[0];
    return exam.date === today && exam.status === 'upcoming';
  }).length;

  const stats = [
    {
      title: 'Total Exams',
      value: totalExams,
      description: userRole === 'STUDENT' ? 'Exams scheduled for you' : 'Exams you\'re managing',
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Upcoming Exams',
      value: upcomingExams,
      description: 'Scheduled for future dates',
      icon: AlertCircle,
      color: 'orange'
    },
    {
      title: 'Completed Exams',
      value: completedExams,
      description: 'Successfully completed',
      icon: CheckCircle,
      color: 'green'
    },
    {
      title: 'Today\'s Exams',
      value: todayExams,
      description: 'Scheduled for today',
      icon: Clock,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-500 text-blue-500';
      case 'orange':
        return 'bg-orange-500 text-orange-500';
      case 'green':
        return 'bg-green-500 text-green-500';
      case 'purple':
        return 'bg-purple-500 text-purple-500';
      default:
        return 'bg-gray-500 text-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = getColorClasses(stat.color);
        
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-full ${colorClasses.split(' ')[0]} bg-opacity-10 flex items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${colorClasses.split(' ')[1]}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ExamStats;
