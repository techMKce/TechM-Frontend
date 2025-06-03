import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import StudentNavbar from '../StudentNavbar';
import FacultyNavbar from '../FacultyNavbar';
import { useAuth } from '@/hooks/useAuth';
import api from '../../service/api';
import dayjs from 'dayjs';

interface Exam {
  id: number;
  courseId: string;
  courseName: string;
  session: string;
  date: string; // ISO date string
  timeSlot: string;
}

const ExamCard = ({ exam }: { exam: Exam }) => {
  const examDate = dayjs(exam.date);
  const today = dayjs();
  const isToday = examDate.isSame(today, 'day');

  // Determine exam status badge
  let status = '';
  let statusColor = '';
  if (examDate.isBefore(today, 'day')) {
    status = 'Completed';
    statusColor = 'text-green-600 bg-green-100';
  } else if (isToday) {
    status = 'Today';
    statusColor = 'text-blue-600 bg-blue-100';
  } else {
    status = 'Upcoming';
    statusColor = 'text-yellow-700 bg-yellow-100';
  }

  return (
    <Card className="flex flex-col justify-between h-full p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 rounded-2xl">
      <CardHeader className="flex justify-between items-start mb-2 p-0">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {exam.courseName}
        </CardTitle>
        <span
          className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColor}`}
          aria-label={`Exam status: ${status}`}
        >
          {status}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 text-gray-700 p-0 pt-2">
        <p>
          <span className="font-semibold">Course ID:</span> {exam.courseId}
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-gray-500" />
          <time dateTime={exam.date}>{examDate.format('MMM D, YYYY')}</time>
        </p>
        <p className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-gray-500" />
          <span>{exam.timeSlot}</span>
        </p>
        <p>
          <span className="font-semibold">Session:</span> {exam.session}
        </p>
      </CardContent>
    </Card>
  );
};

const Exams = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [examData, setExamData] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/attendance/getexam');
        setExamData(res.data);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const today = dayjs();

  // Filter exams by search term (courseName)
  const filteredExams = examData.filter((exam) =>
    exam.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Categorize exams
  const upcomingExams = filteredExams.filter((exam) =>
    dayjs(exam.date).isAfter(today, 'day')
  );
  const todayExams = filteredExams.filter((exam) =>
    dayjs(exam.date).isSame(today, 'day')
  );
  const completedExams = filteredExams.filter((exam) =>
    dayjs(exam.date).isBefore(today, 'day')
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {profile.profile.role === 'STUDENT' ? <StudentNavbar /> : <FacultyNavbar />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Scheduled Exams</h1>
        <p className="mb-6 text-gray-600">
          {profile.profile.role === 'STUDENT'
            ? 'View your upcoming examinations and track your academic schedule'
            : 'Manage and oversee scheduled students examinations for your courses'}
        </p>

        <div className="mb-6 max-w-md">
          <Input
            placeholder="Search exams by course name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="text-center text-gray-600">Loading exams...</div>
        ) : filteredExams.length === 0 ? (
          <div className="text-center text-gray-500">
            No exams found. Try adjusting your search.
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-6">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming ({upcomingExams.length})</TabsTrigger>
              <TabsTrigger value="today">Today ({todayExams.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedExams.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingExams.length === 0 ? (
                <p className="text-center text-gray-500">No upcoming exams.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="today">
              {todayExams.length === 0 ? (
                <p className="text-center text-gray-500">No exams scheduled for today.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {todayExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedExams.length === 0 ? (
                <p className="text-center text-gray-500">No completed exams.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Exams;
