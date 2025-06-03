import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/service/api";
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
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<User[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<string>(null);

  useEffect(() => {
    const fetchData = async () => {
      const deptResponse = await api.get("/profile/faculty/departments");
      if (deptResponse.status !== 200) {
        toast.error("Failed to load departments");
        return;
      }
      const departmentsData: string[] = deptResponse.data.filter(dep => dep !== null);
      console.log(departmentsData);
      setDepartments(departmentsData);

      const courseResponse = await api.get("/course/details");
      if (courseResponse.status !== 200) {
        toast.error("Failed to load courses");
        return;
      }
      const coursesData: Course[] = courseResponse.data.map((course: any) => ({
        id: course.course_id,
        name: course.courseTitle,
        code: course.courseCode,
        department: course.department,
        isEnabled: course.isActive,
      }));
      setCourses(coursesData.filter((course) => course.isEnabled));
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDepartment) return;
    const fetchFaculty = async () => {
      if (selectedDepartment === "all") {
        const response = await api.get("/profile/faculty");
        if (response.status !== 200) {
          toast.error("Failed to load faculty");
          return;
        }
        console.log(response.data);
        const facultyData: Faculty[] = response.data.map((f: any) => ({
          id: f.staffId,
          name: f.name,
          email: f.email,
          facultyId: f.facultyId,
          department: f.department,
        }));
        setFaculty(facultyData);
        return;
      }
      const response = await api.get(
        `/profile/faculty/by-department/${selectedDepartment}`
      );
      if (response.status !== 200) {
        toast.error("Failed to load faculty");
        return;
      }
      console.log(response.data);
      const facultyData: Faculty[] = response.data.map((f: any) => ({
        id: f.staffId,
        name: f.name,
        email: f.email,
        facultyId: f.facultyId,
        department: f.department,
      }));
      setFaculty(facultyData);
    };
    fetchFaculty();
  }, [selectedDepartment]);

  useEffect(() => {
    if(!selectedCourse) return;
    const fetchEnrolledStudents = async () => {
      console.log("Fetching enrolled students for course:", selectedCourse);
      const response = await api.get(`/course-enrollment/by-course/${selectedCourse?.id}`);
      if (response.status !== 200) {
        toast.error("Failed to load enrolled students");
        return;
      }
      const rollNumbers = response.data.rollNums;
      console.log("Enrolled students roll numbers:", rollNumbers);
      const studentsResponse = await api.get("/profile/student");
      console.log("Students response:", studentsResponse.data);
      const studentsData: Student[] = studentsResponse.data.map((s: any) => ({
        id: s.rollNum,
        name: s.name,
        email: s.email,
        rollNumber: s.rollNum,
        department: s.program,
      }));
      setStudents(studentsData);
      console.log("All students data:", students);
      const enrollmentData: User[] = studentsResponse.data.map((s: any) => ({
        id: s.rollNum,
        name: s.name,
        type: "student",
        status: `Roll: ${s.rollNum}`,
      })).filter((s:any) => s.id && rollNumbers.includes(s.id));
      console.log("Filtered enrolled students:", enrollmentData);
      setEnrolledUsers(enrollmentData);
    }
    fetchEnrolledStudents();
  },[selectedCourse]);



  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setSelectedUsers([]);
  };

  const handleUserSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  // const handleFacultySelect = (facultyId: string, checked: boolean) => {
  //   if (checked) {
  //     setSelectedFaculty((prev) => [...prev, facultyId]);
  //   } else {
  //     setSelectedFaculty((prev) => prev.filter((id) => id !== facultyId));
  //   }
  // };

  const handleAssignStudents = async () => {
    if (selectedCourse === null ||
      selectedUsers.length === 0 ||
      selectedFaculty === null ) {
      toast.error(
        "Please select a course, at least one student, and at least one faculty member"
      );
      return;
    }
    const selectedStudentIds = selectedUsers.filter((id) =>
      students.some((s) => s.id === id)
    );

    const response = await api.post("faculty-student-assigning/admin/assign", {
      courseId: selectedCourse.id,
      facultyId: selectedFaculty,
      rollNums: selectedStudentIds,
    });

    if (response.status !== 200) {
      toast.error("Failed to assign students to faculty");
      return;
    }


    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent("assignmentsUpdated"));

    // Reset selections
    setSelectedUsers([]);
    setSelectedFaculty(null);

    toast.success(
      `Successfully Assigned ${selectedStudentIds.length} students to  faculty members for course ${selectedCourse.name}`
    );
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
          {/* First Layout - Department and Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Department & Course</CardTitle>
              <CardDescription>
                Choose a department to view all available courses
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
                  <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
                    <RadioGroup
                      value={selectedFaculty || ""}
                      onValueChange={(value) => setSelectedFaculty(value)}
                      id="faculty-radio-group"
                    >
                      {faculty.map((facultyMember) => (
                        <div
                          key={facultyMember.id}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
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
                      ))}
                    </RadioGroup>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Second Layout - Course Selection and Students */}
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
                    {enrolledUsers.filter((user) => user.type === "student")
                      .length > 0 ? (
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
                              .filter((user) => user.type === "student")
                              .map((student) => {
                                const studentData = students.find(
                                  (s) => s.id === student.id
                                );
                                return (
                                  <tr
                                    key={student.id}
                                    className="hover:bg-gray-50"
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
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="font-medium text-gray-900">
                                        {student.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="text-sm text-gray-600">
                                        {student.id}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="text-sm text-gray-600">
                                        {studentData?.department || "N/A"}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
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
        {((selectedCourse && selectedUsers.length > 0)) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Assignment Summary</CardTitle>
              <CardDescription>
                Review the assignments that will be created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedCourse && (
                  <>
                    <p>
                      <strong>Course:</strong> {selectedCourse.name}
                    </p>
                    <p>
                      <strong>Selected Students:</strong>{" "}
                      {
                        selectedUsers.filter((id) =>
                          students.some((s) => s.id === id)
                        ).length
                      }
                    </p>
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
