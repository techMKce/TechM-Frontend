import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Award } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    availableCourses: 0,
    attendancePercentage: 0
  });

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadStats();
  }, [currentUser.id]);

  const loadStats = () => {
    // Get enrolled courses
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const studentEnrollments = enrollments.filter((enrollment: Enrollment) => enrollment.studentId === currentUser.id);

    // Get all active courses
    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const activeCourses = allCourses.filter((course: Course) => course.isEnabled);

    // Calculate enrolled course IDs
    const enrolledCourseIds = studentEnrollments.map((enrollment: Enrollment) => enrollment.courseId);

    // Get enrolled courses details
    const enrolledCoursesData = activeCourses.filter((course: Course) => enrolledCourseIds.includes(course.id));

    // Calculate available courses (not enrolled in)
    const availableCoursesData = activeCourses.filter((course: Course) => !enrolledCourseIds.includes(course.id));

    // Calculate attendance percentage (placeholder)
    const attendanceRecords = JSON.parse(localStorage.getItem('attendance') || '[]');
    const studentAttendance = attendanceRecords.filter((record: any) => record.studentId === currentUser.id);
    const attendancePercentage = studentAttendance.length > 0 
      ? Math.round((studentAttendance.filter((record: any) => record.present).length / studentAttendance.length) * 100)
      : 0;

    setStats({
      enrolledCourses: enrolledCoursesData.length,
      availableCourses: availableCoursesData.length,
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