import { useState, useEffect } from "react";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Calendar, FileText, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/service/api";
import { useAuth } from "@/hooks/useAuth";

interface Student {
  stdId: string;
  stdName: string;
  rollNum: string;
  deptName: string;
  batch: string;
  sem: string;
  isPresent?: boolean;
}

interface Course {
  courseId: string;
  courseName: string;
}

interface FacultyAssignment {
  facultyId: string;
  courseId: string;
  assignedRollNums: string[];
}

interface StudentDetails {
  stdId: string;
  stdName: string;
  rollNum: string;
  deptName: string;
  batch: string;
  sem: string;
}

const sessions = ["FN", "AN"];

const FacultyAttendancePage = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("mark");
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [absenteeCount, setAbsenteeCount] = useState(0);
  const [batches, setBatches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [facultyAssignments, setFacultyAssignments] = useState<FacultyAssignment[]>([]);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);

  const [formData, setFormData] = useState({
    batch: "",
    course: "",
    department: "",
    semester: "",
    session: "",
    date: new Date().toISOString().split("T")[0],
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === "report") {
      navigate("/faculty/attendance/view");
      return;
    }
    fetchFacultyCourses();
  }, [activeTab]);

  const fetchFacultyCourses = async () => {
    try {
      // Get faculty assignments
      const response = await api.get(
        `/faculty-student-assigning/admin/faculty/${profile.profile.id}`
      );
      const facultyAssignments: FacultyAssignment[] = response.data;
      setFacultyAssignments(facultyAssignments);
      
      // Get course details for assigned courses only
      const courseDetails = await Promise.all(
        facultyAssignments.map(async (assignment) => {
          const res = await api.get(`course/detailsbyId`, {
            params: { id: assignment.courseId }
          });
          return {
            courseId: assignment.courseId,
            courseName: res.data[0]?.courseTitle || assignment.courseId
          };
        })
      );
      setCourses(courseDetails);

      // Get all students
      const studentsRes = await api.get("/profile/student");
      const allStudentsData: StudentDetails[] = studentsRes.data.map((student: any) => ({
        stdId: student.rollNum,
        stdName: student.name,
        rollNum: student.rollNum,
        deptName: student.program,
        batch: student.year,
        sem: student.semester,
      }));
      setAllStudents(allStudentsData);

      // Update filter options based on assigned students
      updateFilterOptions(facultyAssignments, allStudentsData);
    } catch (error) {
      // console.error("Error fetching data:", error);
      toast.error("Failed to load faculty data");
    }
  };

  const updateFilterOptions = (assignments: FacultyAssignment[], students: StudentDetails[]) => {
    const assignedRollNums = assignments.reduce((acc, curr) => [...acc, ...curr.assignedRollNums], []);
    const assignedStudents = students.filter(student => assignedRollNums.includes(student.rollNum));
    
    const uniqueBatches = [...new Set(assignedStudents.map(s => s.batch))].filter(Boolean).sort();
    const uniqueDepts = [...new Set(assignedStudents.map(s => s.deptName))].filter(Boolean).sort();
    const uniqueSems = [...new Set(assignedStudents.map(s => s.sem))].filter(Boolean).sort();
    
    setBatches(uniqueBatches);
    setDepartments(uniqueDepts);
    setSemesters(uniqueSems);
  };

  const handleCourseChange = (courseId: string) => {
    setShowAttendanceTable(false);
    setFormData(prev => ({
      ...prev,
      course: courseId,
      batch: "",
      department: "",
      semester: ""
    }));

    const assignment = facultyAssignments.find(a => a.courseId === courseId);
    if (assignment) {
      const assignedStudents = allStudents.filter(student => 
        assignment.assignedRollNums.includes(student.rollNum)
      );

      const courseBatches = [...new Set(assignedStudents.map(s => s.batch))].filter(Boolean).sort();
      const courseDepts = [...new Set(assignedStudents.map(s => s.deptName))].filter(Boolean).sort();
      const courseSems = [...new Set(assignedStudents.map(s => s.sem))].filter(Boolean).sort();

      setBatches(courseBatches);
      setDepartments(courseDepts);
      setSemesters(courseSems);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setShowAttendanceTable(false);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setShowAttendanceTable(false);
    setFormData({
      batch: "",
      course: "",
      department: "",
      semester: "",
      session: "",
      date: new Date().toISOString().split("T")[0],
    });
    setStudents([]);
    setIsFormSubmitted(false);
    setAbsenteeCount(0);
    toast.info("All filters have been reset");
  };

  const validateForm = () => {
    if (!formData.course) {
      toast.error("Please select a course");
      return false;
    }
    if (!formData.batch) {
      toast.error("Please select a batch");
      return false;
    }
    if (!formData.department) {
      toast.error("Please select a department");
      return false;
    }
    if (!formData.semester) {
      toast.error("Please select a semester");
      return false;
    }
    if (!formData.date) {
      toast.error("Please select a date");
      return false;
    }
    return true;
  };

  const fetchStudentsForCourse = async () => {
    if (!validateForm()) return;

    try {
      const assignment = facultyAssignments.find(a => a.courseId === formData.course);
      if (!assignment) {
        toast.error("No students assigned for this course");
        return;
      }

      const filteredStudents = allStudents.filter(student =>
        assignment.assignedRollNums.includes(student.rollNum) &&
        student.batch === formData.batch &&
        student.deptName === formData.department &&
        student.sem === formData.semester
      );

      if (filteredStudents.length === 0) {
        toast.error("No students match the selected filters");
        return;
      }

      const studentsWithAttendance = filteredStudents.map(student => ({
        ...student,
        isPresent: true
      }));

      setStudents(studentsWithAttendance);
      setShowAttendanceTable(true);
      toast.success("Student list generated successfully");
    } catch (error) {
      // console.error("Error fetching students:", error);
      toast.error("Failed to load student list");
    }
  };

  const handleSubmitAttendance = async () => {
    if (!validateForm()) return;
    if (students.length === 0) {
      toast.error("No students to mark attendance for");
      return;
    }

    try {
      setLoading(true);
      const attendanceRecords = students.map((student) => ({
        stdId: student.stdId,
        stdName: student.stdName,
        facultyId: profile.profile.id,
        facultyName: profile.profile.name,
        courseId: formData.course,
        courseName: courses.find(c => c.courseId === formData.course)?.courseName || formData.course,
        status: student.isPresent ? 1 : 0,
        session: formData.session,
        batch: student.batch,
        deptName: student.deptName,
        sem: student.sem,
        dates: formData.date,
      }));

      await api.post("/attendance/attendanceupdate", attendanceRecords);

      const absentees = students.filter(s => !s.isPresent).length;
      setAbsenteeCount(absentees);
      setIsFormSubmitted(true);
      toast.success("Attendance marked successfully");
    } catch (error) {
      // console.error("Error submitting attendance:", error);
      toast.error("Failed to submit attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="mt-2">Manage student attendance and view reports</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab("mark")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                activeTab === "mark"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Mark Attendance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("report")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                activeTab === "report"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Attendance Report
            </button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>
                  Fill in all filters to mark attendance for students
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Course - Required */}
              <div className="space-y-2">
                <Label htmlFor="course">
                  Course <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.course}
                  onValueChange={handleCourseChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseId}>
                        {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Batch - Required */}
              <div className="space-y-2">
                <Label htmlFor="batch">
                  Batch <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) => handleFilterChange("batch", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department - Required */}
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleFilterChange("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester - Required */}
              <div className="space-y-2">
                <Label htmlFor="semester">
                  Semester <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => handleFilterChange("semester", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem} value={sem}>
                        {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Session - Required */}
              <div className="space-y-2">
                <Label htmlFor="session">
                  Session <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.session}
                  onValueChange={(value) => handleFilterChange("session", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FN">Forenoon (FN)</SelectItem>
                    <SelectItem value="AN">Afternoon (AN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date - Required */}
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10"
                    value={formData.date}
                    onChange={(e) => handleFilterChange("date", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mb-4">
              <Button
                onClick={fetchStudentsForCourse}
                disabled={!formData.course}
              >
                Generate Student List
              </Button>
            </div>
          </CardContent>
        </Card>

        {showAttendanceTable && students.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                {formData.department && `Department of ${formData.department} - `}
                {formData.batch && `Batch ${formData.batch} - `}
                {formData.semester && `Semester ${formData.semester}  - `}
                {formData.session === "FN" ? "Forenoon" : "Afternoon"} Session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-4 py-2">Roll Number</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2 text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {students.map((student) => (
                      <tr key={student.stdId}>
                        <td className="px-4 py-2">{student.rollNum}</td>
                        <td className="px-4 py-2">{student.stdName}</td>
                        <td className="px-4 py-2 text-center">
                          <Switch
                            checked={student.isPresent}
                            onCheckedChange={() => 
                              setStudents(prev =>
                                prev.map(s =>
                                  s.stdId === student.stdId
                                    ? { ...s, isPresent: !s.isPresent }
                                    : s
                                )
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Submitting..." : "Submit Attendance"}
                </Button>
              </div>

              {isFormSubmitted && (
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <div className="flex items-start">
                    <FileText className="mt-1 h-5 w-5 text-blue-600" />
                    <div className="ml-2">
                      <h4 className="font-medium">Attendance Summary</h4>
                      <p className="text-sm mt-1">
                        Total Students: {students.length}
                      </p>
                      <p className="text-sm">
                        Present: {students.length - absenteeCount}
                      </p>
                      <p className="text-sm">
                        Absent: {absenteeCount}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default FacultyAttendancePage;