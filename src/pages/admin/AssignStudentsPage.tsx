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
import { toast } from "@/hooks/use-toast";
import api from "../../service/api";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

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

interface CourseAssignment {
  facultyId: string;
  courseId: string;
  assignedRollNums: string[];
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
  const [selectAll, setSelectAll] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<string>("");
  const [loading, setLoading] = useState({
    initial: true,
    faculty: false,
    students: false,
    assignment: false,
    assignments: false,
  });
  const [loader, setLoader] = useState(false);
  const [courseAssignments, setCourseAssignments] = useState<CourseAssignment[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading((prev) => ({ ...prev, initial: true }));
        const [deptResponse, courseResponse] = await Promise.all([
          api.get("/profile/faculty/departments"),
          api.get("/course/details"),
        ]);

        if (deptResponse.status !== 200 || courseResponse.status !== 200) {
          toast({title:"Failed to load initial data",variant:'destructive'});
          setLoader(false);
          return;
        }

        const departmentsData: string[] = deptResponse.data.filter(
          (dep) => dep !== null
        );
        setDepartments(departmentsData);

        const coursesData: Course[] = courseResponse.data.map(
          (course: any) => ({
            id: course.course_id,
            name: course.courseTitle,
            code: course.courseCode,
            department: course.department,
            isEnabled: course.isActive,
          })
        );
        setCourses(coursesData.filter((course) => course.isEnabled));
      } catch (error) {
        toast({title:"Error loading initial data",variant:'destructive'});
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
        setLoader(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;

    const fetchFaculty = async () => {
      try {
        setLoading((prev) => ({ ...prev, faculty: true }));
        let response;
        if (selectedDepartment === "all") {
          response = await api.get("/profile/faculty");
        } else {
          response = await api.get(
            `/profile/faculty/by-department/${selectedDepartment}`
          );
        }

        if (response.status !== 200) {
          toast({title:"Failed to load faculty",variant:'destructive'});
          setLoader(false);
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
        toast({title:"Error loading faculty data",variant:'destructive'});
      } finally {
        setLoading((prev) => ({ ...prev, faculty: false }));
        setLoader(false);
      }
    };

    fetchFaculty();
  }, [selectedDepartment]);

  const fetchCourseAssignments = async (courseId: string) => {
    try {
      setLoading((prev) => ({ ...prev, assignments: true }));
      const response = await api.get(`/faculty-student-assigning/admin/course/${courseId}`);
      
      if (response.status === 200) {
        const assignmentsData: CourseAssignment[] = response.data.map((assignment: any) => ({
          facultyId: assignment.facultyId,
          courseId: assignment.courseId,
          assignedRollNums: assignment.assignedRollNums || []
        }));
        setCourseAssignments(assignmentsData);
      }
    } catch (error) {
      console.warn("Could not fetch course assignments:", error);
      setCourseAssignments([]);
    } finally {
      setLoading((prev) => ({ ...prev, assignments: false }));
    }
  };

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchEnrolledStudents = async () => {
      try {
        setLoading((prev) => ({ ...prev, students: true }));
        const [enrollmentResponse, studentsResponse] = await Promise.all([
          api.get(`/course-enrollment/by-course/${selectedCourse.id}`),
          api.get("/profile/student"),
        ]);

        if (
          enrollmentResponse.status !== 200 ||
          studentsResponse.status !== 200
        ) {
          toast({title:"Failed to load student data",variant:'destructive'});
          setLoader(false);

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

        await fetchCourseAssignments(selectedCourse.id);
      } catch (error) {
        toast({title:"Error loading enrolled students",variant:'destructive'});
      } finally {
        setLoading((prev) => ({ ...prev, students: false }));
        setLoader(false);
      }
    };

    fetchEnrolledStudents();
  }, [selectedCourse]);

  const handleCourseSelect = (course: Course | null) => {
    setSelectedCourse(course);
    setSelectedUsers([]);
    setSelectAll(false);
    setCourseAssignments([]);
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    setSelectedUsers((prev) =>
      checked ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const unassignedStudents = enrolledUsers.filter(
        (student) => !isStudentAssigned(student.id)
      ).map(student => student.id);
      setSelectedUsers(unassignedStudents);
    } else {
      setSelectedUsers([]);
    }
    setSelectAll(checked);
  };

  const isStudentAssigned = (studentId: string) => {
    return courseAssignments.some(assignment => 
      assignment.assignedRollNums.includes(studentId)
    );
  };

  const getAssignedFacultyForStudent = (studentId: string) => {
    const assignment = courseAssignments.find(assignment => 
      assignment.assignedRollNums.includes(studentId)
    );

    if (assignment) {
      const assignedFaculty = faculty.find(
        (f) => f.id === assignment.facultyId
      );
      return assignedFaculty?.name || "Unknown Faculty";
    }

    return null;
  };

  const handleAssignStudents = async () => {
    if (!selectedCourse || selectedUsers.length === 0 || !selectedFaculty) {
      toast({title:
        "Please select a course, at least one student, and a faculty member",variant:'warning'}
      );
      setLoader(false);
      return;
    }

    // Check if any selected student is already assigned
    const alreadyAssignedStudents = selectedUsers.filter(studentId => 
      isStudentAssigned(studentId)
    );


    if (alreadyAssignedStudents.length > 0) {
      toast({title:
        "One or more selected students are already assigned to a faculty for this course",variant:'warning'}
      );
      setLoader(false);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, assignment: true }));
      setLoader(true);
      const response = await api.post(
        "faculty-student-assigning/admin/assign",
        {
          courseId: selectedCourse.id,
          facultyId: selectedFaculty,
          rollNums: selectedUsers,
        }
      );

      if (response.status !== 200) {
        toast({title:"Failed to assign students to faculty",variant:'destructive'});
        setLoader(false);
        return;
      }

      // Update local state with new assignments
      const existingAssignment = courseAssignments.find(
        a => a.facultyId === selectedFaculty && a.courseId === selectedCourse.id
      );

      if (existingAssignment) {
        setCourseAssignments(courseAssignments.map(assignment => 
          assignment.facultyId === selectedFaculty && assignment.courseId === selectedCourse.id
            ? {
                ...assignment,
                assignedRollNums: [...assignment.assignedRollNums, ...selectedUsers]
              }
            : assignment
        ));
      } else {
        setCourseAssignments([
          ...courseAssignments,
          {
            facultyId: selectedFaculty,
            courseId: selectedCourse.id,
            assignedRollNums: selectedUsers
          }
        ]);
      }

      setSelectedUsers([]);
      setSelectAll(false);
      toast({title:`Successfully assigned ${selectedUsers.length} students`});

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data || "";

        if (status === 409) {
          toast({title:
            "One or more students are already assigned to another faculty for this course",variant:'warning'}
          );
        } else if (status === 400) {
          toast({title:message || "Bad request",variant:'destructive'});
        } else {
          toast({title:"Failed to assign students,might Already Enrolled!, Please try again.",variant:'destructive'});
        }
      } else {
        toast({title:"An unexpected error occurred. Please try again.",variant:'destructive'});
      }
    } finally {
      setLoading((prev) => ({ ...prev, assignment: false }));
      setLoader(false);
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
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
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
                    <div className="py-4 text-center text-gray-500">
                      Loading faculty...
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                      <RadioGroup
                        value={selectedFaculty}
                        onValueChange={setSelectedFaculty}
                      >
                        {faculty.length > 0 ? (
                          faculty.map((facultyMember) => (
                            <div
                              key={facultyMember.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <RadioGroupItem
                                value={facultyMember.id}
                                id={`faculty-radio-${facultyMember.id}`}
                              />
                              <label
                                htmlFor={`faculty-radio-${facultyMember.id}`}
                                className="flex-1 cursor-pointer"
                              >
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
                          <div className="text-center text-gray-500 py-4">
                            No faculty members found
                          </div>
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
                        {course.id} {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCourse && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enrolled Students
                      {loading.assignments && (
                        <span className="text-xs text-blue-600 ml-2">
                          (Loading assignment status...)
                        </span>
                      )}
                    </label>
                    {enrolledUsers.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={selectAll}
                          onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                        />
                        <label
                          htmlFor="select-all"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Select All Unassigned
                        </label>
                      </div>
                    )}
                  </div>
                  {loading.students ? (
                    <div className="py-4 text-center text-gray-500">
                      Loading students...
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {enrolledUsers.length > 0 ? (
                        <table className="w-full border rounded-lg overflow-hidden">
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
                                Assignment Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrolledUsers.map((student) => {
                              const isAssigned = isStudentAssigned(student.id);
                              const assignedFaculty = getAssignedFacultyForStudent(student.id);

                              return (
                                <tr
                                  key={student.id}
                                  className={isAssigned ? "bg-gray-50" : ""}
                                >
                                  <td className="px-4 py-3">
                                    <Checkbox
                                      checked={selectedUsers.includes(
                                        student.id
                                      )}
                                      onCheckedChange={(checked) =>
                                        handleUserSelect(
                                          student.id,
                                          checked as boolean
                                        )
                                      }
                                      disabled={isAssigned}
                                    />
                                  </td>
                                  <td className="px-4 py-3">{student.name}</td>
                                  <td className="px-4 py-3">{student.id}</td>
                                  <td className="px-4 py-3">
                                    {isAssigned ? (
                                      <div className="space-y-1">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs bg-blue-100 text-blue-800"
                                        >
                                          {assignedFaculty ? 
                                            `Assigned to ${assignedFaculty}` : 
                                            "Already Assigned"}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-50 text-green-700 border-green-200"
                                      >
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
                        <p className="text-center text-gray-500 py-8">
                          No students enrolled in this course
                        </p>
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
                  <span>
                    {selectedCourse.id} {selectedCourse.name}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Selected Faculty:
                  </span>
                  <span>
                    {faculty.find((f) => f.id === selectedFaculty)?.name ||
                      "No faculty selected"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">
                    Students to Assign:
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {selectedUsers.length}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={() => {
                    handleAssignStudents();
                  }}
                  className="w-full"
                  size="lg"
                  disabled={loading.assignment || loader}
                >
                  {loading.assignment || loader ? (
                    <div className="flex items-center gap-2">
                      <span>Assigning Students...</span>
                      <img
                        src="/preloader1.png"
                        className="w-5 h-5 animate-spin"
                        alt="Loading"
                      />
                    </div>
                  ) : (
                    "Assign Selected Students to Faculty"
                  )}
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