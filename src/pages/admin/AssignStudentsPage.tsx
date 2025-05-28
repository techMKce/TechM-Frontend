import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  facultyId: string;
  department: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  department: string;
  isEnabled: boolean;
}

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
}

interface Assignment {
  id: string;
  studentId: string;
  facultyId: string;
  courseId: string;
}

interface User {
  id: string;
  name: string;
  type: 'student' | 'faculty';
  status: string;
}

const AssignStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);

  // Get unique departments from all data
  const departments = [...new Set([
    ...students.map(student => student.department),
    ...faculty.map(f => f.department),
    ...courses.map(course => course.department)
  ])].filter(Boolean);

  useEffect(() => {
    // Load data from localStorage
    const savedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const savedFaculty = JSON.parse(localStorage.getItem('faculty') || '[]');
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    const savedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const savedAssignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    setStudents(savedStudents);
    setFaculty(savedFaculty);
    setCourses(savedCourses.filter((course: Course) => course.isEnabled));
    setEnrollments(savedEnrollments);
    setAssignments(savedAssignments);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // Get enrolled students for the selected course
      const courseEnrollments = enrollments.filter(enrollment => enrollment.courseId === selectedCourse.id);
      const enrolledStudents = courseEnrollments.map(enrollment => {
        const student = students.find(s => s.id === enrollment.studentId);
        return student ? {
          id: student.id,
          name: student.name,
          type: 'student' as const,
          status: `Roll: ${student.rollNumber}`,
          rollNumber: student.rollNumber
        } : null;
      }).filter(Boolean) as User[];

      // Get faculty for the same department as the course
      const courseFaculty = faculty.filter(f => f.department === selectedCourse.department).map(f => ({
        id: f.id,
        name: f.name,
        type: 'faculty' as const,
        status: `Faculty ID: ${f.facultyId}`,
        rollNumber: ""
      }));

      setEnrolledUsers([...enrolledStudents, ...courseFaculty]);
    } else {
      setEnrolledUsers([]);
    }
  }, [selectedCourse, enrollments, students, faculty]);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedUsers([]);
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleFacultySelect = (facultyId: string, checked: boolean) => {
    if (checked) {
      setSelectedFaculty(prev => [...prev, facultyId]);
    } else {
      setSelectedFaculty(prev => prev.filter(id => id !== facultyId));
    }
  };

  const getDepartmentFaculty = () => {
    if (!selectedDepartment || selectedDepartment === "all") {
      return faculty;
    }
    return faculty.filter(f => f.department === selectedDepartment);
  };

  const handleAssignStudents = () => {
    if (!selectedCourse || selectedUsers.length === 0 || selectedFaculty.length === 0) {
      toast.error("Please select a course, at least one student, and at least one faculty member");
      return;
    }

    const selectedStudentIds = selectedUsers.filter(userId => 
      students.some(s => s.id === userId)
    );

    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    // Create new assignments
    const newAssignments: Assignment[] = [];
    selectedFaculty.forEach(facultyId => {
      selectedStudentIds.forEach(studentId => {
        // Check if assignment already exists
        const existingAssignment = assignments.find(a => 
          a.studentId === studentId && 
          a.facultyId === facultyId && 
          a.courseId === selectedCourse.id
        );

        if (!existingAssignment) {
          newAssignments.push({
            id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            studentId,
            facultyId,
            courseId: selectedCourse.id
          });
        }
      });
    });

    if (newAssignments.length === 0) {
      toast.warning("All selected assignments already exist");
      return;
    }

    // Save new assignments
    const updatedAssignments = [...assignments, ...newAssignments];
    setAssignments(updatedAssignments);
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('assignmentsUpdated'));

    // Reset selections
    setSelectedUsers([]);
    setSelectedFaculty([]);

    toast.success(`Successfully created ${newAssignments.length} new assignments`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/assign-students" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Students</h1>
          <p className="text-gray-600">Assign faculty members to students through course selections</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* First Layout - Department and Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Department & Course</CardTitle>
              <CardDescription>Choose a department to view all available courses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDepartment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Faculty
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    {getDepartmentFaculty().map(facultyMember => (
                      <div
                        key={facultyMember.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          checked={selectedFaculty.includes(facultyMember.id)}
                          onCheckedChange={(checked) => 
                            handleFacultySelect(facultyMember.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{facultyMember.name}</h4>
                          <p className="text-sm text-gray-600">Faculty ID: {facultyMember.facultyId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}


            </CardContent>
          </Card>

          {/* Second Layout - Course Selection and Students */}
          <Card>
            <CardHeader>
              <CardTitle>Select Course and Students</CardTitle>
              <CardDescription>Choose a course to view enrolled students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <Select 
                  value={selectedCourse?.id || ""} 
                  onValueChange={(courseId) => {
                    const course = courses.find(c => c.id === courseId);
                    handleCourseSelect(course || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourse && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enrolled Students
                  </label>
                  <div className="max-h-96 overflow-y-auto">
                    {enrolledUsers.filter(user => user.type === 'student').length > 0 ? (
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Select
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Roll Number
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Department
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrolledUsers
                              .filter(user => user.type === 'student')
                              .map(student => {
                                const studentData = students.find(s => s.id === student.id);
                                return (
                                  <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <Checkbox
                                        checked={selectedUsers.includes(student.id)}
                                        onCheckedChange={(checked) => 
                                          handleUserSelect(student.id, checked as boolean)
                                        }
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="font-medium text-gray-900">{student.name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="text-sm text-gray-600">{student.rollNumber || student.id}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="text-sm text-gray-600">{studentData?.department || 'N/A'}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge variant="secondary" className="text-xs">
                                        Enrolled
                                      </Badge>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        No students enrolled in this course
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignment Summary */}
        {((selectedCourse && selectedUsers.length > 0) || selectedFaculty.length > 0) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
              <CardDescription>Review the assignments that will be created</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedCourse && (
                  <>
                    <p><strong>Course:</strong> {selectedCourse.name}</p>
                    <p><strong>Selected Students:</strong> {
                      selectedUsers.filter(id => students.some(s => s.id === id)).length
                    }</p>
                  </>
                )}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button 
                  onClick={handleAssignStudents}
                  className="w-full"
                  size="lg"
                >
                  Assign Selected Students to Faculty
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignStudentsPage;