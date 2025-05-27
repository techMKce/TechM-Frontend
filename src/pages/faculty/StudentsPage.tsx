
import FacultyNavbar from "@/components/FacultyNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Users, GraduationCap } from "lucide-react";

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: string;
}

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
  enrollmentDate: string;
}

interface Assignment {
  id: string;
  studentId: string;
  facultyId: string;
  courseId: string;
  assignedAt: string;
}

const StudentsPage = () => {
  const [activeFilter, setActiveFilter] = useState<'enrolled' | 'assigned'>('enrolled');
  const [enrolledStudents, setEnrolledStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  const [facultyCourses, setFacultyCourses] = useState<Course[]>([]);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadStudents();
  }, [currentUser.id]);

  const loadStudents = () => {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    // Get faculty's courses
    const myCourses = courses.filter((course: Course) => course.facultyId === currentUser.id);
    setFacultyCourses(myCourses);

    // Get enrolled students (students enrolled in faculty's courses)
    const enrolledStudentIds = new Set();
    myCourses.forEach((course: Course) => {
      const courseEnrollments = enrollments.filter((enrollment: Enrollment) => enrollment.courseId === course.id);
      courseEnrollments.forEach((enrollment: Enrollment) => {
        enrolledStudentIds.add(enrollment.studentId);
      });
    });

    const enrolledStudentsList = students.filter((student: Student) => 
      enrolledStudentIds.has(student.id)
    );
    setEnrolledStudents(enrolledStudentsList);

    // Get assigned students (students directly assigned to faculty)
    const assignedStudentIds = assignments
      .filter((assignment: Assignment) => assignment.facultyId === currentUser.id)
      .map((assignment: Assignment) => assignment.studentId);

    const assignedStudentsList = students.filter((student: Student) => 
      assignedStudentIds.includes(student.id)
    );
    setAssignedStudents(assignedStudentsList);
  };

  const getStudentCourses = (studentId: string) => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const studentEnrollments = enrollments.filter((enrollment: Enrollment) => enrollment.studentId === studentId);
    
    return facultyCourses.filter((course: Course) => 
      studentEnrollments.some((enrollment: Enrollment) => enrollment.courseId === course.id)
    );
  };

  const currentStudents = activeFilter === 'enrolled' ? enrolledStudents : assignedStudents;

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar currentPage="/faculty/students" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600">Manage and view your students</p>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-4">
          <Button 
            variant={activeFilter === 'enrolled' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('enrolled')}
            className="flex items-center gap-2"
          >
            <GraduationCap className="h-4 w-4" />
            All Enrolled Students ({enrolledStudents.length})
          </Button>
          <Button 
            variant={activeFilter === 'assigned' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('assigned')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Assigned Students ({assignedStudents.length})
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeFilter === 'enrolled' ? 'Enrolled Students' : 'Assigned Students'}
            </CardTitle>
            <CardDescription>
              {activeFilter === 'enrolled' 
                ? 'Students enrolled in your courses' 
                : 'Students assigned directly to you'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    {activeFilter === 'enrolled' && <TableHead>Enrolled Courses</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.department}</TableCell>
                      {activeFilter === 'enrolled' && (
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {getStudentCourses(student.id).map((course) => (
                              <Badge key={course.id} variant="secondary" className="text-xs">
                                {course.courseId}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">
                  No {activeFilter === 'enrolled' ? 'enrolled' : 'assigned'} students found
                </h3>
                <p className="text-sm text-gray-500">
                  {activeFilter === 'enrolled' 
                    ? 'Students will appear here when they enroll in your courses' 
                    : 'Students will appear here when they are assigned to you by admin'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentsPage;
