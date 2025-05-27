
import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const EnrolledCoursesPage = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadEnrolledCourses();
  }, [currentUser.id]);

  const loadEnrolledCourses = () => {
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

    setEnrolledCourses(enrolledCoursesData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar currentPage="/student/enrolled-courses" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Enrolled Courses</h1>
          <p className="text-gray-600">Your currently enrolled courses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enrolled Courses</CardTitle>
            <CardDescription>Courses you are currently enrolled in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.name}</CardTitle>
                      <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800">
                        Enrolled
                      </span>
                    </div>
                    <CardDescription>
                      <span className="font-medium">Course ID:</span> {course.courseId}
                    </CardDescription>
                    <CardDescription>
                      <span className="font-medium">Faculty:</span> {course.facultyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{course.description}</p>
                  </CardContent>
                </Card>
              ))}
              {enrolledCourses.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  You are not enrolled in any courses yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnrolledCoursesPage;
