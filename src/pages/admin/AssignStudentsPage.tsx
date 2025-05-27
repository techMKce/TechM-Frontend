
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  year: string;
}

interface Faculty {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  department: string;
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
  enrolledAt: string;
}

interface Assignment {
  id: string;
  studentId: string;
  facultyId: string;
  courseId: string;
  assignedAt: string;
}

const AssignStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

  // Get unique departments
  const departments = [...new Set(students.map(student => student.department))];

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
    // Filter students based on selected department and course
    let filtered = students;
    
    if (selectedDepartment && selectedDepartment !== "all") {
      filtered = filtered.filter(student => student.department === selectedDepartment);
    }

    setFilteredStudents(filtered);
    setSelectedStudents([]); // Clear selection when filters change

    // Set selected faculty based on course
    if (selectedCourse && selectedCourse !== "all") {
      const course = courses.find(c => c.id === selectedCourse);
      if (course) {
        const courseFaculty = faculty.find(f => f.id === course.facultyId);
        setSelectedFaculty(courseFaculty || null);
      }
    } else {
      setSelectedFaculty(null);
    }
  }, [students, selectedDepartment, selectedCourse, courses, faculty]);

  const handleStudentSelect = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select students who are not already enrolled
      const availableStudents = filteredStudents.filter(student => 
        !isStudentEnrolled(student.id, selectedCourse)
      );
      setSelectedStudents(availableStudents.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  };

  const handleAssignStudents = () => {
    if (!selectedCourse || selectedCourse === "all") {
      toast.error("Please select a course");
      return;
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    // Create assignments to faculty for selected students (for attendance purposes only)
    const newAssignments = selectedStudents.map(studentId => ({
      id: Date.now().toString() + Math.random().toString(),
      studentId,
      facultyId: selectedFaculty?.id || '',
      courseId: selectedCourse,
      assignedAt: new Date().toISOString()
    }));

    const updatedAssignments = [...assignments, ...newAssignments];
    
    setAssignments(updatedAssignments);
    localStorage.setItem('assignments', JSON.stringify(updatedAssignments));
    
    setSelectedStudents([]);
    toast.success(`Successfully assigned ${selectedStudents.length} student(s) to faculty for attendance tracking`);
  };

  const isStudentEnrolled = (studentId: string, courseId: string) => {
    if (!courseId || courseId === "all") return false;
    return enrollments.some(enrollment => 
      enrollment.studentId === studentId && enrollment.courseId === courseId
    );
  };

  const getAssignmentStatus = (studentId: string) => {
    if (!selectedCourse || selectedCourse === "all") return "Not Selected";
    const enrolled = isStudentEnrolled(studentId, selectedCourse);
    const assigned = isStudentAssigned(studentId, selectedCourse);
    
    if (assigned) return "Already Assigned";
    if (enrolled) return "Enrolled";
    return "Not Assigned";
  };

  const isStudentAssigned = (studentId: string, courseId: string) => {
    if (!courseId || courseId === "all") return false;
    return assignments.some(assignment => 
      assignment.studentId === studentId && assignment.courseId === courseId
    );
  };

  const canSelectStudent = (studentId: string) => {
    return !isStudentAssigned(studentId, selectedCourse);
  };

  const availableStudents = filteredStudents.filter(student => canSelectStudent(student.id));

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/assign-students" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Students</h1>
          <p className="text-gray-600">Assign students to courses and faculty members</p>
        </div>

        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Select course and department to filter students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Course</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.courseId} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Department</label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Faculty Information */}
              {selectedFaculty && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900">Assigned Faculty</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Name:</strong> {selectedFaculty.name}</p>
                    <p><strong>Faculty ID:</strong> {selectedFaculty.facultyId}</p>
                    <p><strong>Email:</strong> {selectedFaculty.email}</p>
                    <p><strong>Department:</strong> {selectedFaculty.department}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Assignment */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Student Assignment</CardTitle>
                  <CardDescription>
                    {selectedCourse 
                      ? `Assign students to: ${courses.find(c => c.id === selectedCourse)?.name || 'Selected Course'}`
                      : 'Select a course to assign students'
                    }
                  </CardDescription>
                </div>
                {selectedCourse && selectedFaculty && (
                  <Button 
                    onClick={handleAssignStudents}
                    disabled={selectedStudents.length === 0}
                  >
                    Assign Selected Students ({selectedStudents.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!selectedCourse ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Please select a course to view and assign students</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.length === availableStudents.length && availableStudents.length > 0}
                          onCheckedChange={handleSelectAll}
                          disabled={availableStudents.length === 0}
                        />
                      </TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => {
                      const status = getAssignmentStatus(student.id);
                      const canSelect = canSelectStudent(student.id);
                      
                      return (
                        <TableRow key={student.id} className={!canSelect ? "opacity-50" : ""}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={(checked) => handleStudentSelect(student.id, checked as boolean)}
                              disabled={!canSelect}
                            />
                          </TableCell>
                          <TableCell>{student.rollNumber}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.department}</TableCell>
                          <TableCell>{student.year}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                status === "Already Assigned" ? "destructive" : 
                                status === "Enrolled" ? "default" : "secondary"
                              }
                            >
                              {status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4">
                          {selectedDepartment && selectedDepartment !== "all"
                            ? 'No students found in the selected department'
                            : 'No students available'
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignStudentsPage;
