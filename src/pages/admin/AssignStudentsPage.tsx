import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { toast } from "sonner";
import api from "../../service/api";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  type: "student" | "faculty";
  status: string;
}

const AssignStudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [existingAssignments, setExistingAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState({
    initial: true,
    faculty: false,
    students: false,
    assignment: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, initial: true }));
        const [deptResponse, courseResponse] = await Promise.all([
          api.get("/profile/faculty/departments"),
          api.get("/course/details")
        ]);

        if (deptResponse.status !== 200 || courseResponse.status !== 200) {
          toast.error("Failed to load initial data");
          return;
        }

        const departmentsData: string[] = deptResponse.data.filter(dep => dep !== null);
        setDepartments(departmentsData);

        const coursesData: Course[] = courseResponse.data.map((course: any) => ({
          id: course.course_id,
          name: course.courseTitle,
          code: course.courseCode,
          department: course.department,
          isEnabled: course.isActive,
        }));
        setCourses(coursesData.filter((course) => course.isEnabled));
      } catch (error) {
        toast.error("Error loading initial data");
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;

    const fetchFaculty = async () => {
      try {
        setLoading(prev => ({ ...prev, faculty: true }));
        let response;
        if (selectedDepartment === "all") {
          response = await api.get("/profile/faculty");
        } else {
          response = await api.get(`/profile/faculty/by-department/${selectedDepartment}`);
        }

        if (response.status !== 200) {
          toast.error("Failed to load faculty");
          return;
        }

        const facultyData: Faculty[] = response.data.map((f: any) => ({
          id: f.staffId,
          name: f.name,
          email: f.email,
          facultyId: f.facultyId,
          department: f.department,
        }));
        setFaculty(facultyData);
      } catch (error) {
        toast.error("Error loading faculty data");
      } finally {
        setLoading(prev => ({ ...prev, faculty: false }));
      }
    };

    fetchFaculty();
  }, [selectedDepartment]);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchEnrolledStudents = async () => {
      try {
        setLoading(prev => ({ ...prev, students: true }));
        const [enrollmentResponse, studentsResponse] = await Promise.all([
          api.get(`/course-enrollment/by-course/${selectedCourse.id}`),
          api.get("/profile/student")
        ]);

        if (enrollmentResponse.status !== 200 || studentsResponse.status !== 200) {
          toast.error("Failed to load student data");
          return;
        }

        const rollNumbers = enrollmentResponse.data.rollNums;

        const studentsData: Student[] = studentsResponse.data.map((s: any) => ({
          id: s.rollNum,
          name: s.name,
          email: s.email,
          rollNumber: s.rollNum,
          department: s.program,
        }));

        setStudents(studentsData);

        const enrollmentData: User[] = studentsResponse.data
          .filter((s: any) => rollNumbers.includes(s.rollNum))
          .map((s: any) => ({
            id: s.rollNum,
            name: s.name,
            type: "student",
            status: `Roll: ${s.rollNum}`,
          }));

        setEnrolledUsers(enrollmentData);
      } catch (error) {
        toast.error("Error loading enrolled students");
      } finally {
        setLoading(prev => ({ ...prev, students: false }));
      }
    };

    fetchEnrolledStudents();
  }, [selectedCourse]);

  const handleCourseSelect = (course: Course | null) => {
    setSelectedCourse(course);
    setSelectedUsers([]);
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };


  // Updated to only check for duplicate assignments within the same course
  const checkExistingAssignments = (studentIds: string[], facultyId: string, courseId: string) => {
    return studentIds.some(studentId =>
      existingAssignments.some(assignment =>
        assignment.studentId === studentId &&
        assignment.courseId === courseId
      )
    );
  };

  // Find which faculty a student is assigned to for the current course
  const getAssignedFacultyForStudent = (studentId: string, courseId: string) => {
    const assignment = existingAssignments.find(a =>
      a.studentId === studentId && a.courseId === courseId
    );

    if (assignment) {
      const assignedFaculty = faculty.find(f => f.id === assignment.facultyId);
      return assignedFaculty?.name || "Assigned Faculty";
    }
    return null;
  };


  const handleAssignStudents = async () => {
    if (!selectedCourse || selectedUsers.length === 0 || !selectedFaculty) {
      toast.error("Please select a course, at least one student, and a faculty member");
      return;
    }

    // Check for existing assignments in the same course
    const hasExistingAssignments = checkExistingAssignments(
      selectedUsers,
      selectedFaculty,
      selectedCourse.id
    );

    if (hasExistingAssignments) {
      toast.error("One or more selected students are already assigned to a faculty for this course");
      return;
    }

    try {
      setLoading(prev => ({ ...prev, assignment: true }));
      const response = await api.post("faculty-student-assigning/admin/assign", {
        courseId: selectedCourse.id,
        facultyId: selectedFaculty,
        rollNums: selectedUsers,
      });

      if (response.status !== 200) {
        toast.error("Failed to assign students to faculty");
        return;
      }

      // Update existing assignments state
      const newAssignments = selectedUsers.map(studentId => ({
        id: `${studentId}-${selectedFaculty}-${selectedCourse.id}`,
        studentId,
        facultyId: selectedFaculty,
        courseId: selectedCourse.id
      }));

      setExistingAssignments([...existingAssignments, ...newAssignments]);
      window.dispatchEvent(new CustomEvent("assignmentsUpdated"));

      setSelectedUsers([]);
      toast.success(`Successfully assigned ${selectedUsers.length} students`);
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || "";

        if (status === 409) {
          toast.error("One or more students are already assigned to another faculty for this course");
        } else if (status === 400) {
          toast.error(message || "Bad request");
        } else {
          toast.error("Failed to assign students. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(prev => ({ ...prev, assignment: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/assign-students" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign Students</h1>
          <p className="text-gray-600">
            Assign faculty members to students through course selections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department and Faculty */}
          <Card>
            <CardHeader>
              <CardTitle>Select Department & Faculty</CardTitle>
              <CardDescription>
                Choose a department to view available faculty members
              </CardDescription>
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
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedDepartment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Faculty
                  </label>
                  {loading.faculty ? (
                    <div className="py-4 text-center text-gray-500">Loading faculty...</div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                      <RadioGroup value={selectedFaculty} onValueChange={setSelectedFaculty}>
                        {faculty.length > 0 ? (
                          faculty.map((facultyMember) => (
                            <div
                              key={facultyMember.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <RadioGroupItem value={facultyMember.id} id={`faculty-radio-${facultyMember.id}`} />
                              <label htmlFor={`faculty-radio-${facultyMember.id}`} className="flex-1 cursor-pointer">
                                <h4 className="font-medium text-gray-900">
                                  {facultyMember.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  Faculty ID: {facultyMember.id}
                                </p>
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-4">No faculty members found</div>
                        )}
                      </RadioGroup>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course and Students */}
          <Card>
            <CardHeader>
              <CardTitle>Select Course and Students</CardTitle>
              <CardDescription>
                Choose a course to view enrolled students
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course
                </label>
                <Select
                  value={selectedCourse?.id || ""}
                  onValueChange={(courseId) => {
                    const course = courses.find((c) => c.id === courseId);
                    handleCourseSelect(course || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.id}  {course.name}
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
                  {loading.students ? (
                    <div className="py-4 text-center text-gray-500">Loading students...</div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {enrolledUsers.length > 0 ? (
                        <table className="w-full border rounded-lg overflow-hidden">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrolledUsers.map((student) => {
                              const studentData = students.find((s) => s.id === student.id);
                              // Check if student is assigned to any faculty for the current course
                              const isAssigned = existingAssignments.some(
                                a => a.studentId === student.id &&
                                  a.courseId === selectedCourse.id
                              );
                              const assignedFaculty = getAssignedFacultyForStudent(student.id, selectedCourse.id);

                              return (
                                <tr key={student.id} className={isAssigned ? "bg-gray-50" : ""}>
                                  <td className="px-4 py-3">
                                    <Checkbox
                                      checked={selectedUsers.includes(student.id)}
                                      onCheckedChange={(checked) =>
                                        handleUserSelect(student.id, checked as boolean)
                                      }
                                      disabled={isAssigned}
                                    />
                                  </td>
                                  <td className="px-4 py-3">{student.name}</td>
                                  <td className="px-4 py-3">{student.id}</td>
                                  <td className="px-4 py-3">
                                    {isAssigned ? (
                                      <div className="space-y-1">
                                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                          Assigned
                                        </Badge>
                                        {assignedFaculty && (
                                          <p className="text-xs text-gray-600">
                                            Faculty: {assignedFaculty}
                                          </p>
                                        )}
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                        Enrolled
                                      </Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-center text-gray-500 py-8">No students enrolled in this course</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assignment Summary */}
        {selectedCourse && selectedUsers.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
              <CardDescription>
                Review the assignments that will be created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Course:</span>
                  <span>{selectedCourse.id}  {selectedCourse.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Selected Faculty:</span>
                  <span>{faculty.find(f => f.id === selectedFaculty)?.name || "No faculty selected"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Students to Assign:</span>
                  <Badge variant="secondary" className="text-xs">{selectedUsers.length}</Badge>
                </div>

                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Button
                    onClick={handleAssignStudents}
                    className="w-40"
                    disabled={loading.assignment || !selectedFaculty || selectedUsers.length === 0}
                  >
                    {loading.assignment ? "Assigning..." : "Assign Students"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignStudentsPage;