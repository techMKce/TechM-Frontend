import React, { useState, useEffect } from "react";
import Navbar from "@/components/FacultyNavbar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { toast,Toaster } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/service/api";
import Profile from "../profile/index";
import { useAuth } from "@/hooks/useAuth";

interface AttendanceRecord {
  id: number;
  dates: string;
  deptName: string;
  batch: string;
  courseName: string;
  sem: string;
  session: string;
  stdId: string;
  stdName: string;
  rollNum: string;
  status: number;
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
  deptId: string;
  deptName: string;
  batch: string;
  sem: string;
}

interface RangeAttendanceSummary {
  session: string;
  courseId: string;
  stdId: string;
  presentcount: number;
  percentage: number;
  totaldays: number;
  courseName: string;
  facultyName: string;
  batch: string;
  stdName: string;
  deptName: string;
  sem: string;
}

const sessions = ["FN", "AN"];

const PreviousAttendancePage = () => {
  const { profile } = useAuth();
  const facultyName = profile.profile.name || "Faculty"; // Fallback to "Faculty" if name is not available
  const facultyId = profile.profile.id || ""; // This should come from auth context or props
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [rangeAttendanceSummary, setRangeAttendanceSummary] = useState<
    RangeAttendanceSummary[]
  >([]);
  const [singleFilters, setSingleFilters] = useState({
    singleDate: "",
    department: "",
    course: "",
    batch: "",
    semester: "",
  });
  const [groupFilters, setGroupFilters] = useState({
    fromDate: "",
    toDate: "",
    department: "",
    course: "",
    batch: "",
    semester: "",
  });
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<
    "all" | "present" | "absent"
  >("all");
  const [selectedDateInRange, setSelectedDateInRange] = useState<string | null>(
    null
  );
  const [attendanceMode, setAttendanceMode] = useState<"single" | "group">(
    "single"
  );
  const [showFN, setShowFN] = useState(false);
  const [showAN, setShowAN] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const isDateRange =
    attendanceMode === "group" &&
    !!groupFilters.fromDate &&
    !!groupFilters.toDate;
  const filters = attendanceMode === "single" ? singleFilters : groupFilters;
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [facultyAssignments, setFacultyAssignments] = useState<
    FacultyAssignment[]
  >([]);

  useEffect(() => {
    // Fetch faculty courses when component mounts

    fetchFacultyCourses();
    // fetchStudentsForCourse(formData.course);
  }, [facultyId]);

  const fetchFacultyCourses = async () => {
    try {
      const response = await api.get(
        `/faculty-student-assigning/admin/faculty/${profile.profile.id}`
      );

      // const courseIds = new Set(response.data.map((assignment: FacultyAssignment) => assignment.courseId));
      const facultyAssignments: FacultyAssignment[] = response.data;

      // Get unique course IDs
      const courseIds = [
        ...new Set(facultyAssignments.map((assignment) => assignment.courseId)),
      ];

      // Fetch course details for each course ID
      const coursePromises = courseIds.map(async (courseId) => {
        const courseResponse = await api.get(`course/detailsbyId`, {
          params: {
            id: courseId,
          },
        });

        return {
          courseId: courseId,
          courseName: courseResponse.data[0].courseTitle || courseId, // Fallback to courseId if name not available
        };
      });

      const fetchedCourses = await Promise.all(coursePromises);
      setCourses(fetchedCourses);

      const studentResponse = await api.get(
        `faculty-student-assigning/admin/faculty/${profile.profile.id}`
      );

      const facultyAssignmentsData: FacultyAssignment[] = studentResponse.data;
      setFacultyAssignments(facultyAssignmentsData);

      const studResponse = await api.get("/profile/student");

      const allStudents: StudentDetails[] = studResponse.data.map(
        (student: StudentDetails) => ({
          stdId: student.rollNum,
          stdName: student.name,
          rollNum: student.rollNum,
          deptId: student.program,
          deptName: student.program,
          batch: student.year,
          sem: student.semester,
        })
      );

      const assignedRollNums = facultyAssignmentsData.flatMap(
        (a) => a.assignedRollNums
      );
      const filteredStudents = allStudents.filter((student) =>
        assignedRollNums.includes(student.rollNum)
      );

      // setStudents(filteredStudents);
      setAllStudents(filteredStudents);

      // const uniqueBatches = [
      //   ...new Set(
      //     allStudents
      //       .flat()
      //       .map((student) => student.batch)
      //       .filter((batch) => batch != null && batch !== undefined)
      //   ),
      // ];
      // const uniqueDepartments = [
      //   ...new Set(
      //     allStudents
      //       .flat()
      //       .map((student) => student.deptName)
      //       .filter((dept) => dept != null && dept !== undefined)
      //   ),
      // ];
      // const uniqueSemesters = [
      //   ...new Set(
      //     allStudents
      //       .flat()
      //       .map((student) => student.sem)
      //       .filter((sem) => sem != null && sem !== undefined)
      //   ),
      // ];
      // setBatches(uniqueBatches);
      // setDepartments(uniqueDepartments);
      // setSemesters(uniqueSemesters);
    } catch (error) {
      toast.error("Failed to load faculty courses");
    }
  };

    const fetchStudentsForCourse = async (courseId: string) => {

      try {
        if (!courseId) {
          
          setBatches([]);
          setDepartments([]);
          setSemesters([]);
          return;
        }
        const course = courses.filter((course) => course.courseName === courseId);
  
        // Find the assignment for the selected course
        const assignment = facultyAssignments.find(a => a.courseId === course[0].courseId);
        if (!assignment) {
          setBatches([]);
          setDepartments([]);
          setSemesters([]);
          return;
        }
  
        // Filter students assigned to this course
        const assignedStudents = allStudents.filter(student =>
          assignment.assignedRollNums.includes(student.rollNum)
        );

  
        // Extract unique batches, departments, semesters from assigned students
        const uniqueBatches = [...new Set(assignedStudents.map(s => s.batch).filter(Boolean))];
        const uniqueDepartments = [...new Set(assignedStudents.map(s => s.deptName).filter(Boolean))];
        const uniqueSemesters = [...new Set(assignedStudents.map(s => s.sem).filter(Boolean))];
  
        setBatches(uniqueBatches);
        setDepartments(uniqueDepartments);
        setSemesters(uniqueSemesters);
  

      } catch (error) {
        toast.error("Failed to load student list");
      }
    };

  const fetchSingleDateAttendance = async (date: string) => {
    if (!date) return;
    setIsLoading(true);
    try {
      const response = await api.get(`/attendance/getfaculty?id=${facultyId}&date=${date}`);
      
      // Make sure we have data before setting it
      if (response.data && Array.isArray(response.data)) {
        // Set attendance records
        setAttendanceRecords(response.data);
        
        // Check for session data
        const hasFN = response.data.some(record => 
          record.session && (record.session.toLowerCase() === "FN" || record.session.toLowerCase() === "fn")
        );
        
        const hasAN = response.data.some(record => 
          record.session && (record.session.toLowerCase() === "AN" || record.session.toLowerCase() === "an")
        );
        
        
        // Auto show the first available session
        if (hasFN) {
          setShowFN(true);
          setShowAN(false);
        } else if (hasAN) {
          setShowFN(false);
          setShowAN(true);
        } else {
          // If no clear session found, default to showing something
          setShowFN(true);
          setShowAN(false);
        }
      } else {
        setAttendanceRecords([]);
        toast.info("No attendance data found for this date");
      }
    } catch (error) {
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDateRangeAttendance = async (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    try {
      const response = await api.get(
        `/attendance/getfacultyy?id=${facultyId}&stdate=${fromDate}&endate=${toDate}`
      );
      
      // Make sure we have data before setting it
      if (response.data && Array.isArray(response.data)) {
        setRangeAttendanceSummary(response.data);
      } else {
        setRangeAttendanceSummary([]);
        toast.info("No attendance data found for this date range");
      }
    } catch (error) {
      toast.error("Failed to load attendance records");
      setRangeAttendanceSummary([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (attendanceMode === "single" && singleFilters.singleDate) {
      fetchSingleDateAttendance(singleFilters.singleDate);
    } else if (
      attendanceMode === "group" &&
      groupFilters.fromDate &&
      groupFilters.toDate
    ) {
      fetchDateRangeAttendance(groupFilters.fromDate, groupFilters.toDate);
    }
  }, [
    attendanceMode,
    singleFilters.singleDate,
    groupFilters.fromDate,
    groupFilters.toDate,
  ]);

  // Fix the filter logic for single day attendance
  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesDepartment = !singleFilters.department || record.deptName === singleFilters.department;
    const matchesBatch = !singleFilters.batch || record.batch === singleFilters.batch;
    const matchesCourse = !singleFilters.course || record.courseName === singleFilters.course;
    const matchesSemester = !singleFilters.semester || record.sem === singleFilters.semester;
    
    return matchesDepartment && matchesBatch && matchesCourse && matchesSemester;
  });

  // Make sure we correctly identify morning and AN sessions with improved session detection
  const singleDayFN =
    attendanceMode === "single" && singleFilters.singleDate
      ? filteredRecords.filter(
          (record) => {
            if (!record.session) return false;
            const session = record.session.toLowerCase();
            return session === "FN" || session === "fn" || session === "morning";
          }
        )
      : [];
      
  const singleDayAN =
    attendanceMode === "single" && singleFilters.singleDate
      ? filteredRecords.filter(
          (record) => {
            if (!record.session) return false;
            const session = record.session.toLowerCase();
            return session === "AN" || session === "an" || session === "noon";
          }
        )
      : [];

  const getFilteredStudents = (students: AttendanceRecord[]) => {
    if (!Array.isArray(students)) return [];
    if (statusFilter === "all") return students;
    if (statusFilter === "present")
      return students.filter((s) => s.status === 1);
    return students.filter((s) => s.status === 0);
  };

  const downloadAttendancePDF = async (
    records: AttendanceRecord[],
    session: string
  ) => {
    try {
      const doc = new jsPDF();

      // Add institution info
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("KARPAGAM INSTITUTIONS", 105, 20, { align: "center" });

      // Add attendance details
      doc.setFontSize(14);
      doc.text(
        `Attendance Sheet - ${records[0]?.deptName || ""} (${
          records[0]?.batch || ""
        })`,
        14,
        40
      );
      doc.text(
        `${records[0]?.courseName || ""} - Semester ${records[0]?.sem || ""}`,
        14,
        50
      );
      doc.text(`Date: ${records[0]?.dates || ""} [${session}]`, 14, 60);

      const headers = [["Roll Number", "Name", "Status"]];
      const tableData = records.map((record) => [
        record.rollNum || record.stdId,
        record.stdName,
        record.status === 1 ? "Present" : "Absent",
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 70,
        styles: { fontSize: 10 },
      });

      doc.save(`attendance-${records[0]?.dates || "unknown"}-${session}.pdf`);
    } catch (error) {
      toast.error("Failed to generate attendance PDF");
    }
  };

  const downloadOverallAttendancePDF = async () => {
    if (!rangeAttendanceSummary.length) {
      toast.info("No attendance data available to download");
      return;
    }
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text(`Overall Attendance Summary`, 14, 20);
      doc.setFontSize(14);
      doc.text(
        `Date Range: ${groupFilters.fromDate} to ${groupFilters.toDate}`,
        14,
        30
      );

      if (
        groupFilters.department ||
        groupFilters.batch ||
        groupFilters.course
      ) {
        let infoLine = "";
        if (groupFilters.department)
          infoLine += `Department: ${groupFilters.department}`;
        if (groupFilters.batch)
          infoLine += `${infoLine ? ", " : ""}Batch: ${groupFilters.batch}`;
        if (groupFilters.course)
          infoLine += `${infoLine ? ", " : ""}Course: ${groupFilters.course}`;
        doc.text(infoLine, 14, 40);
      }

      const headers = [
        ["Roll No", "Name", "Days", "FN (P/T)", "AN (P/T)", "Attendance %"],
      ];
      const tableData = rangeAttendanceSummary.map((student) => [
        student.stdId,
        student.stdName,
        student.totaldays.toString(),
        `${student.session === "FN" ? student.presentcount : "-"}/${
          student.session === "FN" ? student.totaldays : "-"
        }`,
        `${student.session === "AN" ? student.presentcount : "-"}/${
          student.session === "AN" ? student.totaldays : "-"
        }`,
        `${student.percentage}%`,
      ]);

      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 50,
        styles: { fontSize: 9 },
      });

      doc.save(
        `overall-attendance-${groupFilters.fromDate}-to-${groupFilters.toDate}.pdf`
      );
    } catch (error) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "course") {
      // Reset dependent fields when course changes
      if (attendanceMode === "single") {
        setSingleFilters((prev) => ({
          ...prev,
          course: value,
          department: "",
          batch: "",
          semester: "",
        }));
      } else {
        setGroupFilters((prev) => ({
          ...prev,
          course: value,
          department: "",
          batch: "",
          semester: "",
        }));
      }

      if (value) {
        fetchStudentsForCourse(value);
      } else {
        // Clear student-related options if course is cleared
        setBatches([]);
        setDepartments([]);
        setSemesters([]);
      }
    } else {
      if (attendanceMode === "single") {
        setSingleFilters((prev) => ({ ...prev, [name]: value }));
      } else {
        setGroupFilters((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  //   const handleSelectChange = (name: string, value: string) => {
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };
  return (
    <>
      <Navbar />
      {/* <Navbar userType="faculty" userName={facultyName} /> */}
      <div className="page-container max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col items-center">
          <Button
            variant="outline"
            className="self-start mb-2"
            onClick={() => navigate("/faculty/attendance")}
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-center">
            Previous Attendance Records
          </h1>
          <p className=" mt-2 text-center">
            View Previous Attendance Sheets
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={attendanceMode === "single" ? "default" : "outline"}
              onClick={() => setAttendanceMode("single")}
            >
              Single Day Attendance
            </Button>
            <Button
              variant={attendanceMode === "group" ? "default" : "outline"}
              onClick={() => setAttendanceMode("group")}
            >
              Overall Attendance
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={filters.course}
                  onValueChange={(value) => {
                    handleSelectChange("course", value);
                    
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem
                        key={course.courseId}
                        value={course.courseName}
                      >
                        {course.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select
                  value={filters.batch}
                  onValueChange={(value) => handleSelectChange("batch", value)}
                  disabled={!filters.course}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
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
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={filters.department}
                  onValueChange={(value) =>
                    handleSelectChange("department", value)
                  }
                  disabled={!filters.course}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
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
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={filters.semester}
                  onValueChange={(value) =>
                    handleSelectChange("semester", value)
                  }
                  disabled={!filters.course}
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
              {attendanceMode === "single" ? (
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <Label htmlFor="singleDate">Date</Label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={singleFilters.singleDate}
                    max={todayStr}
                    onChange={(e) => {
                      setSingleFilters((prev) => ({
                        ...prev,
                        singleDate: e.target.value,
                      }));
                      setShowFN(false);
                      setShowAN(false);
                    }}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fromDate">From Date</Label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={groupFilters.fromDate}
                      max={todayStr}
                      onChange={(e) => {
                        setGroupFilters((prev) => ({
                          ...prev,
                          fromDate: e.target.value,
                          toDate:
                            prev.toDate && prev.toDate < e.target.value
                              ? ""
                              : prev.toDate,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toDate">To Date</Label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border rounded-md border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      value={groupFilters.toDate}
                      min={groupFilters.fromDate}
                      max={todayStr}
                      onChange={(e) => {
                        setGroupFilters((prev) => ({
                          ...prev,
                          toDate: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-6">
              {isLoading ? (
                <p className="text-center">Loading attendance data...</p>
              ) : attendanceMode === "single" ? (
                !singleFilters.singleDate ? (
                  <p className=" text-center">
                    Please select a date to view attendance.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {!singleDayFN?.length && !singleDayAN?.length ? (
                      <p className=" text-center">
                        No attendance records found for this date.
                      </p>
                    ) : (
                      <>
                        {singleDayFN?.length && !showFN && (
                          <Card>
                            <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                              <div>
                                <div className="font-semibold">
                                  {singleDayFN[0]?.deptName} -{" "}
                                  {singleDayFN[0]?.batch}
                                </div>
                                <div className="text-sm ">
                                  {singleDayFN[0]?.courseName} - Semester{" "}
                                  {singleDayFN[0]?.sem}
                                </div>
                                <div className="text-sm ">
                                  Date: {singleDayFN[0]?.dates} [FN]
                                </div>
                              </div>
                              <div className="mt-2 md:mt-0 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setShowFN(true);
                                    setShowAN(false);
                                  }}
                                >
                                  View Sheet
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    downloadAttendancePDF(singleDayFN, "FN")
                                  }
                                  className="flex items-center gap-1"
                                >
                                  <Download size={16} />
                                  PDF
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {singleDayAN?.length && !showAN && (
                          <Card>
                            <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                              <div>
                                <div className="font-semibold">
                                  {singleDayAN[0]?.deptName} -{" "}
                                  {singleDayAN[0]?.batch}
                                </div>
                                <div className="text-sm ">
                                  {singleDayAN[0]?.courseName} - Semester{" "}
                                  {singleDayAN[0]?.sem}
                                </div>
                                <div className="text-sm ">
                                  Date: {singleDayAN[0]?.dates} [AN]
                                </div>
                              </div>
                              <div className="mt-2 md:mt-0 flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setShowAN(true);
                                    setShowFN(false);
                                  }}
                                >
                                  View Sheet
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() =>
                                    downloadAttendancePDF(singleDayAN, "AN")
                                  }
                                  className="flex items-center gap-1"
                                >
                                  <Download size={16} />
                                  PDF
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {/* FN Attendance Sheet */}
                        {singleDayFN?.length && showFN && (
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                <div>
                                  Attendance Sheet - {singleDayFN[0]?.deptName || "Department"}{" "}
                                  ({singleDayFN[0]?.batch || "Batch"})
                                </div>
                                <div>
                                  {singleDayFN[0]?.courseName || "Course"} - Semester{" "}
                                  {singleDayFN[0]?.sem || "N/A"}
                                </div>
                                <div>Date: {singleDayFN[0]?.dates || "N/A"} [FN]</div>
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">
                                  Total Students:
                                </span>{" "}
                                {singleDayFN.length}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2 items-center">
                                  <Label>Status Filter:</Label>
                                  <Select
                                    value={statusFilter}
                                    onValueChange={(v) =>
                                      setStatusFilter(v as any)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                      <SelectItem value="present">
                                        Present
                                      </SelectItem>
                                      <SelectItem value="absent">
                                        Absent
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowFN(false)}
                                >
                                  ← Back to Selection
                                </Button>
                              </div>

                              <div>
                                {/* Single day FN attendance table */}
                                <table className="min-w-full border rounded">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 border-b text-left">
                                        Roll Number
                                      </th>
                                      <th className="py-2 px-4 border-b text-left">
                                        Name
                                      </th>
                                      <th className="py-2 px-4 border-b text-left">
                                        Status
                                      </th>
                                      <th className="py-2 px-4 border-b text-left">
                                        Details
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredStudents(singleDayFN).map((record) => (
                                      <tr 
                                        key={record.id || `${record.stdId}-${record.dates}`} 
                                        className={record.status === 1 ? 'bg-green-50' : 'bg-red-50'}
                                      >
                                        <td className="py-3 px-4 border-b font-medium">
                                          {record.rollNum || record.stdId || "N/A"}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {record.stdName || "Unknown"}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {record.status === 1 ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              Present
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              Absent
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 border-b text-sm">
                                          <div>Course: {record.courseName || "N/A"}</div>
                                          <div>Department: {record.deptName || "N/A"}</div>
                                          <div>Date: {record.dates || "N/A"}</div>
                                        </td>
                                      </tr>
                                    ))}
                                    {singleDayFN.length === 0 && (
                                      <tr>
                                        <td colSpan={4} className="py-4 text-center text-gray-500">
                                          No attendance records found for the morning session.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {/* AN Attendance Sheet */}
                        {singleDayAN?.length && showAN && (
                          <Card>
                            <CardHeader>
                              <CardTitle>
                                <div>
                                  Attendance Sheet - {singleDayAN[0]?.deptName || "Department"}{" "}
                                  ({singleDayAN[0]?.batch || "Batch"})
                                </div>
                                <div>
                                  {singleDayAN[0]?.courseName || "Course"} - Semester{" "}
                                  {singleDayAN[0]?.sem || "N/A"}
                                </div>
                                <div>Date: {singleDayAN[0]?.dates || "N/A"} [AN]</div>
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">
                                  Total Students:
                                </span>{" "}
                                {singleDayAN.length}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2 items-center">
                                  <Label>Status Filter:</Label>
                                  <Select
                                    value={statusFilter}
                                    onValueChange={(v) =>
                                      setStatusFilter(v as any)
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                      <SelectItem value="present">
                                        Present
                                      </SelectItem>
                                      <SelectItem value="absent">
                                        Absent
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowAN(false)}
                                >
                                  ← Back to Selection
                                </Button>
                              </div>
                              <div>
                                {/* Single day AN attendance table */}
                                <table className="min-w-full border rounded">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 border-b text-left">
                                        Roll Number
                                      </th>
                                      <th className="py-2 px-4 border-b text-left">
                                        Name
                                      </th>
                                      <th className="py-2 px-4 border-b text-left">
                                        Status
                                      </th>
                                      <th className="py-2 px-4 border-b text-left">
                                        Details
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredStudents(singleDayAN).map((record) => (
                                      <tr 
                                        key={record.id || `${record.stdId}-${record.dates}`} 
                                        className={record.status === 1 ? 'bg-green-50' : 'bg-red-50'}
                                      >
                                        <td className="py-3 px-4 border-b font-medium">
                                          {record.rollNum || record.stdId || "N/A"}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {record.stdName || "Unknown"}
                                        </td>
                                        <td className="py-3 px-4 border-b">
                                          {record.status === 1 ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                              Present
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                              Absent
                                            </span>
                                          )}
                                        </td>
                                        <td className="py-3 px-4 border-b text-sm">
                                          <div>Course: {record.courseName || "N/A"}</div>
                                          <div>Department: {record.deptName || "N/A"}</div>
                                          <div>Date: {record.dates || "N/A"}</div>
                                        </td>
                                      </tr>
                                    ))}
                                    {singleDayAN.length === 0 && (
                                      <tr>
                                        <td colSpan={4} className="py-4 text-center text-gray-500">
                                          No attendance records found for the AN session.
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        {/* Attendance Summary */}
                        {(singleDayFN?.length > 0 || singleDayAN?.length > 0) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            {/* Total Students */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
                              <p className="text-2xl font-bold">
                                {showFN ? singleDayFN?.length : singleDayAN?.length}
                              </p>
                            </div>
                            
                            {/* Present */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <h3 className="text-sm text-gray-500 mb-1">Present</h3>
                              <p className="text-2xl font-bold text-green-600">
                                {showFN 
                                  ? singleDayFN?.filter(r => r.status === 1).length 
                                  : singleDayAN?.filter(r => r.status === 1).length}
                              </p>
                            </div>
                            
                            {/* Absent */}
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <h3 className="text-sm text-gray-500 mb-1">Absent</h3>
                              <p className="text-2xl font-bold text-red-600">
                                {showFN 
                                  ? singleDayFN?.filter(r => r.status === 0).length 
                                  : singleDayAN?.filter(r => r.status === 0).length}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              ) : // Group Attendance
              isDateRange ? (
                !rangeAttendanceSummary.length ? (
                  <p className=" text-center">
                    No attendance records found for the selected date range.
                  </p>
                ) : (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>
                          Attendance Report: {groupFilters.fromDate} to {groupFilters.toDate}
                        </CardTitle>
                        <CardDescription>
                          {groupFilters.course && <span>Course: {groupFilters.course} | </span>}
                          {groupFilters.department && <span>Department: {groupFilters.department} | </span>}
                          {groupFilters.batch && <span>Batch: {groupFilters.batch}</span>}
                        </CardDescription>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={downloadOverallAttendancePDF}
                        className="flex items-center gap-1"
                      >
                        <Download size={16} />
                        Export PDF
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border rounded">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b text-left">Roll Number</th>
                              <th className="py-2 px-4 border-b text-left">Name</th>
                              <th className="py-2 px-4 border-b text-center">Total Days</th>
                              <th className="py-2 px-4 border-b text-center">Morning Session</th>
                              <th className="py-2 px-4 border-b text-center">AN Session</th>
                              <th className="py-2 px-4 border-b text-center">Overall</th>
                            </tr>
                          </thead>
                          <tbody>
                            {processRangeAttendanceData(rangeAttendanceSummary).map((student) => (
                              <tr key={student.studentId} className="hover:bg-gray-50">
                                <td className="py-3 px-4 border-b">{student.studentId || "N/A"}</td>
                                <td className="py-3 px-4 border-b font-medium">{student.studentName || "Unknown"}</td>
                                <td className="py-3 px-4 border-b text-center">{student.totalDays || 0}</td>
                                <td className="py-3 px-4 border-b text-center">
                                  {student.FN ? (
                                    <div>
                                      <div className="font-medium">{student.FN.present}/{student.FN.total}</div>
                                      <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block
                                        ${student.FN.percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                          student.FN.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {formatPercentage(student.FN.percentage)}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 border-b text-center">
                                  {student.AN ? (
                                    <div>
                                      <div className="font-medium">{student.AN.present}/{student.AN.total}</div>
                                      <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block
                                        ${student.AN.percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                          student.AN.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-red-100 text-red-800'}`}>
                                        {formatPercentage(student.AN.percentage)}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 border-b text-center">
                                  <div>
                                    <div className="font-medium">{student.overall.present}/{student.overall.total}</div>
                                    <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block font-medium
                                      ${student.overall.percentage >= 75 ? 'bg-green-100 text-green-800' : 
                                        student.overall.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 
                                        'bg-red-100 text-red-800'}`}>
                                      {formatPercentage(student.overall.percentage)}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )
              ) : (
                <p className=" text-center">
                  Please select a date range to view attendance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PreviousAttendancePage;

// Add these utility functions at the top of your component

// Format attendance percentage with consistent decimal places
const formatPercentage = (percentage: number) => {
  if (isNaN(percentage) || !isFinite(percentage)) {
    return "0.0%";
  }
  return percentage.toFixed(1) + "%";
};

// Group attendance records by student for better organization
const groupAttendanceByStudent = (records: AttendanceRecord[]) => {
  const grouped = new Map<string, {
    student: {
      id: string,
      name: string,
      rollNum: string,
      dept: string,
      batch: string,
      sem: string
    },
    sessions: {
      FN?: { status: number, date: string },
      AN?: { status: number, date: string }
    }
  }>();

  records.forEach(record => {
    const key = record.rollNum || record.stdId;
    
    if (!grouped.has(key)) {
      grouped.set(key, {
        student: {
          id: record.stdId,
          name: record.stdName,
          rollNum: record.rollNum || record.stdId,
          dept: record.deptName,
          batch: record.batch,
          sem: record.sem
        },
        sessions: {}
      });
    }

    const sessionKey = record.session.toLowerCase() === "FN" ? "FN" : "AN";
    grouped.get(key)!.sessions[sessionKey] = { 
      status: record.status, 
      date: record.dates 
    };
  });

  return Array.from(grouped.values());
};

// Transform range attendance data for better display
const processRangeAttendanceData = (data: RangeAttendanceSummary[]) => {
  
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }
  
  // Group by student ID
  const studentsMap = new Map();
  
  data.forEach(record => {
    const studentId = record.stdId;
    if (!studentId) return;
    
    // Determine if this is a morning or AN session
    const isFN = 
      record.session && (record.session.toLowerCase() === "FN" || 
                          record.session.toLowerCase() === "fn" || 
                          record.session.toLowerCase() === "morning");
    
    if (!studentsMap.has(studentId)) {
      // Create new student entry
      studentsMap.set(studentId, {
        studentId: studentId,
        studentName: record.stdName || "Unknown",
        batch: record.batch || "",
        deptName: record.deptName || "",
        sem: record.sem || "",
        courseName: record.courseName || "",
        totalDays: 0, // Will calculate later
        FN: null,
        AN: null,
        overall: { present: 0, total: 0, percentage: 0 }
      });
    }
    
    const student = studentsMap.get(studentId);
    
    // Update session data based on which session this record represents
    if (isFN) {
      student.FN = {
        present: Number(record.presentcount) || 0,
        total: Number(record.totaldays) || 0,
        percentage: Number(record.percentage) || 0
      };
    } else { // Assume AN/AN
      student.AN = {
        present: Number(record.presentcount) || 0,
        total: Number(record.totaldays) || 0,
        percentage: Number(record.percentage) || 0
      };
    }
  });
  
  // Calculate overall statistics for each student
  studentsMap.forEach(student => {
    const fnPresent = student.FN ? student.FN.present : 0;
    const fnTotal = student.FN ? student.FN.total : 0;
    const anPresent = student.AN ? student.AN.present : 0;
    const anTotal = student.AN ? student.AN.total : 0;
    
    const totalPresent = fnPresent + anPresent;
    const totalDays = fnTotal + anTotal;
    
    student.overall = {
      present: totalPresent,
      total: totalDays,
      percentage: totalDays > 0 ? (totalPresent / totalDays) * 100 : 0
    };
    
    student.totalDays = Math.max(fnTotal, anTotal);
  });
  
  // Convert map to array and log the result
  const result = Array.from(studentsMap.values());
  return result;
};
