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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/service/api";

interface Student {
  stdId: string;
  stdName: string;
  rollNum: string;
  deptId: string;
  deptName: string;
  batch: string;
  sem: string;
  isPresent: boolean;
}

interface Course {
  courseId: string;
  courseName: string;
}

interface FacultyAssignment {
  facultyId: string;
  courseId: string;
  rollNums: string[];
}

interface StudentDetails {
  stdId: string;
  stdName: string;
  rollNum: string;
  deptId: string;
  deptName: string;
  batch: string;
  sem: string;
}

const sessions = ["FN", "AN"];

const FacultyAttendancePage = () => {
  const [facultyName] = useState("Dr. Jane Smith");
  const [facultyId] = useState("12"); // This should come from auth context or props
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const [absenteeCount, setAbsenteeCount] = useState(0);
  const [batches, setBatches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    batch: "",
    course: "",
    department: "",
    semester: "",
    session: "FN",
    date: new Date().toISOString().split("T")[0],
  });

  const navigate = useNavigate();

  useEffect(() => {
    // Fetch faculty courses when component mounts
    const fetchFacultyCourses = async () => {
      try {
        const response = await api.get(`faculty-student-assigning/admin/faculty/${facultyId}`);
        console.log(response);
        const facultyAssignments: FacultyAssignment[] = response.data;
        
        // Get unique course IDs
        const courseIds = [...new Set(facultyAssignments.map(assignment => assignment.courseId))];
        
        // Fetch course details for each course ID
        const coursePromises = courseIds.map(async (courseId) => {
          const courseResponse = await api.get(`course-enrollment/by-course/${courseId}`);
          return {
            courseId: courseId,
            courseName: courseResponse.data.courseName || courseId // Fallback to courseId if name not available
          };
        });
        
        const fetchedCourses = await Promise.all(coursePromises);
        setCourses(fetchedCourses);
      } catch (error) {
        console.error("Error fetching faculty courses:", error);
        toast.error("Failed to load faculty courses");
      }
    };

    fetchFacultyCourses();
  }, [facultyId]);

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchStudentsForCourse = async (courseId: string) => {
    try {
      const response = await api.get(`faculty-student-assigning/admin/course/${courseId}`);
      const assignments = response.data;
      
      if (!assignments || assignments.length === 0) {
        toast.error("No students found for this course");
        return;
      }

      // Collect all roll numbers
      const allRollNums = assignments.flatMap(assignment => assignment.assignedRollNums);
      
      // Fetch student details for each roll number
      const studentPromises = allRollNums.map(async (rollNum) => {
        const studentResponse = await api.get(`profile/student/${rollNum}`);
        return studentResponse.data;
      });

      const studentDetails: StudentDetails[] = await Promise.all(studentPromises);
      
      // Update dropdown options based on student data
      const uniqueBatches = [...new Set(studentDetails.map(student => student.batch))];
      const uniqueDepartments = [...new Set(studentDetails.map(student => student.deptName))];
      const uniqueSemesters = [...new Set(studentDetails.map(student => student.sem))];
      
      setBatches(uniqueBatches);
      setDepartments(uniqueDepartments);
      setSemesters(uniqueSemesters);

      // Map student details to our Student interface
      const mappedStudents: Student[] = studentDetails.map(student => ({
        stdId: student.stdId,
        stdName: student.stdName,
        rollNum: student.rollNum,
        deptId: student.deptId,
        deptName: student.deptName,
        batch: student.batch,
        sem: student.sem,
        isPresent: true // Default to present
      }));

      setStudents(mappedStudents);
      setIsFormSubmitted(false);
      setAbsenteeCount(0);
      toast.success("Student list generated successfully");
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load student list");
    }
  };

  const handleGenerateList = () => {
    if (!formData.course) {
      toast.error("Please select a course");
      return;
    }
    fetchStudentsForCourse(formData.course);
  };

  const handleToggleAttendance = (stdId: string) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.stdId === stdId ? { ...student, isPresent: !student.isPresent } : student
      )
    );
  };

  const handleSubmitAttendance = async () => {
    if (students.length === 0) {
      toast.error("No students to mark attendance for");
      return;
    }

    try {
      const attendanceRecords = students.map(student => ({
        stdId: student.stdId,
        stdName: student.stdName,
        facultyId: facultyId,
        facultyName: facultyName,
        courseId: formData.course,
        courseName: courses.find(c => c.courseId === formData.course)?.courseName || formData.course,
        status: student.isPresent ? 1 : 0,
        session: formData.session,
        batch: student.batch,
        deptId: student.deptId,
        deptName: student.deptName,
        sem: student.sem,
        dates: formData.date
      }));

      await api.post("attupdate", attendanceRecords);

      const absentees = students.filter((student) => !student.isPresent).length;
      setAbsenteeCount(absentees);
      setIsFormSubmitted(true);

      toast.success("Attendance marked successfully");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      toast.error("Failed to submit attendance");
    }
  };

  const filteredStudents = students.filter(student => 
    (!formData.batch || student.batch === formData.batch) &&
    (!formData.department || student.deptName === formData.department) &&
    (!formData.semester || student.sem === formData.semester)
  );

  return (
    <>
      <Navbar />
      {/* <Navbar userType="faculty" userName={facultyName} /> */}

      <div className="page-container max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">Attendance Marking</h1>
          <p className=" mt-2">Mark student attendance for a specific session</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Class Details</CardTitle>
            <CardDescription>Fill in the details to generate the student list</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. Course */}
              <div className="space-y-2">
                <Label htmlFor="course">
                  Course <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleSelectChange("course", value)}
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

              {/* 2. Batch */}
              <div className="space-y-2">
                <Label htmlFor="batch">
                  Batch
                </Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) => handleSelectChange("batch", value)}
                  disabled={!formData.course}
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

              {/* 3. Department */}
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  disabled={!formData.course}
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

              {/* 4. Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester">
                  Semester
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => handleSelectChange("semester", value)}
                  disabled={!formData.course}
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

              {/* 5. Session */}
              <div className="space-y-2">
                <Label htmlFor="session">
                  Session <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.session}
                  onValueChange={(value) => handleSelectChange("session", value)}
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

              {/* 6. Date */}
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, date: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* 7. Button */}
              <div className="flex items-end">
                <Button
                  onClick={handleGenerateList}
                  className="mb-1 bg-primary hover:bg-primary-dark w-full"
                  disabled={!formData.course}
                >
                  Generate Student List
                </Button>
              </div>
              
              {/* View previous attendance */}
              <Button
                className="mb-1 bg-primary hover:bg-primary-dark w-full"
                onClick={() => navigate("/faculty/attendance/view")}
              >
                View Previous Attendance
              </Button>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mark Attendance</CardTitle>
              <CardDescription>
                {formData.department && `${formData.department} - `}
                {formData.batch && `${formData.batch} - `}
                {formData.semester && `Semester ${formData.semester} `}
                ({formData.session === "FN" ? "Forenoon" : "Afternoon"} Session)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full mb-4">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-4 py-3 text-sm font-medium text-primary">Roll Number</th>
                      <th className="px-4 py-3 text-sm font-medium text-primary">Name</th>
                      <th className="px-4 py-3 text-sm font-medium text-primary text-center">Attendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStudents.map((student) => (
                      <tr key={student.stdId}>
                        <td className="px-4 py-3 text-secondary">{student.rollNum}</td>
                        <td className="px-4 py-3 font-medium">{student.stdName}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center items-center">
                            <Label htmlFor={`attendance-${student.stdId}`} className="mr-2 text-sm">
                              {student.isPresent ? "Present" : "Absent"}
                            </Label>
                            <Switch
                              id={`attendance-${student.stdId}`}
                              checked={student.isPresent}
                              onCheckedChange={() => handleToggleAttendance(student.stdId)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate("/faculty/attendance/view")}
                >
                  View Previous Attendance
                </Button>
                <Button
                  onClick={handleSubmitAttendance}
                  className="bg-primary hover:bg-primary-dark"
                >
                  Submit Attendance
                </Button>
              </div>

              {isFormSubmitted && (
                <div className="mt-6 p-4 bg-accent-light/10 rounded-md">
                  <div className="flex items-start">
                    <FileText className="mt-1 h-5 w-5 text-accent" />
                    <div className="ml-2">
                      <h4 className="font-medium">Attendance Summary</h4>
                      <p className="text-secondary text-sm mt-1">
                        Total Students: {filteredStudents.length}
                      </p>
                      <p className="text-secondary text-sm">
                        Present: {filteredStudents.length - absenteeCount}
                      </p>
                      <p className="text-secondary text-sm">
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