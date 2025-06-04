
import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

const AvailableCoursesPage = () => {
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadAvailableCourses();
  }, [currentUser.id]);

  const loadAvailableCourses = () => {
    // Get enrolled courses
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const studentEnrollments = enrollments.filter((enrollment: Enrollment) => enrollment.studentId === currentUser.id);
    
    // Get all active courses
    const allCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const activeCourses = allCourses.filter((course: Course) => course.isEnabled);
    
    // Calculate enrolled course IDs
    const enrolledCourseIds = studentEnrollments.map((enrollment: Enrollment) => enrollment.courseId);
    
    // Calculate available courses (not enrolled in)
    const availableCoursesData = activeCourses.filter((course: Course) => !enrolledCourseIds.includes(course.id));

    setAvailableCourses(availableCoursesData);
  };

  const handleEnroll = (courseId: string) => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    // Check if already enrolled
    const alreadyEnrolled = enrollments.some((enrollment: Enrollment) => 
      enrollment.studentId === currentUser.id && enrollment.courseId === courseId
    );

    if (alreadyEnrolled) {
      toast.warning("You are already enrolled in this course");
      return;
    }

    const newEnrollment: Enrollment = {
      id: Date.now().toString(),
      studentId: currentUser.id,
      courseId: courseId,
      enrolledAt: new Date().toISOString()
    };

    const updatedEnrollments = [...enrollments, newEnrollment];
    localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
    
    loadAvailableCourses();
    toast.success("Successfully enrolled in the course!");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar/>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-gray-600">Browse and enroll in available courses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Courses</CardTitle>
            <CardDescription>Courses you can enroll in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription>
                      <span className="font-medium">Course ID:</span> {course.courseId}
                    </CardDescription>
                    <CardDescription>
                      <span className="font-medium">Faculty:</span> {course.facultyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                    <Button 
                      onClick={() => handleEnroll(course.id)} 
                      className="w-full"
                    >
                      Enroll
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {availableCourses.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No available courses at the moment
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvailableCoursesPage;
