import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Award } from "lucide-react";
import { useState, useEffect } from "react";
import api from '../../service/api';
import {useAuth} from "@/hooks/useAuth";
interface Course {
  id: string;
  courseId: string;
  name: string;
  description: string;
  facultyId: string;
  facultyName: string;
  isEnabled: boolean;
}

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
}

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    availableCourses: 0,
    attendancePercentage: 0
  });

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadStats();
  }, [currentUser.id]);

  const loadStats = async() => {
    // Get enrolled courses
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const studentEnrollments = enrollments.filter((enrollment: Enrollment) => enrollment.studentId === currentUser.id);

    // Get all active courses
let allCourses = [];

try {
  const response = await api.get('/course/details');
  allCourses = [...response.data].length > 0 ? response.data : [];
  console.log("Fetched all courses:", allCourses);
} catch (error) {
  console.error("Error fetching all courses:", error);
  allCourses = []; // fallback in case of error
}

  const activeCourses = allCourses.filter((course) => course.isActive);

    // Calculate enrolled course IDs
    const enrolledCourseIds = studentEnrollments.map((enrollment: Enrollment) => enrollment.courseId);

    // Get enrolled courses details
    console.log("Fetching enrolled courses for student:", profile.profile.id);
    const enrolledCoursesData =await api.get(`/course-enrollment/by-student/${profile.profile.id}`)
  .then(response => response.data)
  .catch(error => {
    console.error("Error fetching enrolled courses:", error);
  });


    // Calculate available courses (not enrolled in)
    const availableCoursesData = activeCourses.filter((course: Course) => !enrolledCourseIds.includes(course.id));

    // Calculate attendance percentage (placeholder)
let attendancePercentage = 0;

try {
  const response = await api.get('/attendance/getstudent', {
    params: { id: profile.profile.id }
  });

  const attendanceRecords = Array.isArray(response.data) ? response.data : [];
  console.log("Fetched attendance records:", attendanceRecords);

  // Filter records for the current user
  const studentAttendance = attendanceRecords.filter(
    (record: any) => record.studentId === currentUser.id
  );

  const totalSessions = studentAttendance.length;
  const attendedSessions = studentAttendance.filter((record: any) => record.present).length;

  if (totalSessions > 0) {
    attendancePercentage = Math.round((attendedSessions / totalSessions) * 100);
  }
} catch (error) {
  console.error("Error fetching attendance records:", error);
  attendancePercentage = 0;
}

// Update stats
setStats({
  enrolledCourses: Array.isArray(enrolledCoursesData) ? enrolledCoursesData.length : 0,
  availableCourses: Array.isArray(availableCoursesData) ? availableCoursesData.length : 0,
  attendancePercentage
});

  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar currentPage="/student/dashboard" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome to your student portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <div className="p-2 rounded-full bg-blue-500">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
              <CardDescription className="text-xs text-muted-foreground">
                Courses you're currently enrolled in
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <div className="p-2 rounded-full bg-orange-500">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableCourses}</div>
              <CardDescription className="text-xs text-muted-foreground">
                New courses available to enroll
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Percentage</CardTitle>
              <div className="p-2 rounded-full bg-green-500">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
              <CardDescription className="text-xs text-muted-foreground">
                Your overall attendance rate
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;