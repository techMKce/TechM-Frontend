import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { Download, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/service/api";
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
  deptName: string;
  batch: string;
  sem: string;
}

interface RangeAttendanceSummary {
  session: string;
  stdId: string;
  courseId: string;
  presentcount: number;
  totaldays: number;
  percentage: number;
  stdName: string;
  batch: string;
  deptName: string;
  sem: string;
  courseName: string;
}

interface ConsolidatedRangeAttendance {
  stdId: string;
  stdName: string;
  batch: string;
  deptName: string;
  sem: string;
  courseName: string;
  totalConducted: number;
  totalAttended: number;
  percentage: number;
}

interface SingleFilters {
  singleDate: string;
  department: string;
  course: string;
  courseId: string;
  batch: string;
  semester: string;
}

interface GroupFilters {
  fromDate: string;
  toDate: string;
  department: string;
  course: string;
  courseId: string;
  batch: string;
  semester: string;
}

const PreviousAttendancePage = () => {
  const { profile } = useAuth();
  const facultyId = profile.profile.id;
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [rangeAttendanceSummary, setRangeAttendanceSummary] = useState<RangeAttendanceSummary[]>([]);
  const [consolidatedRangeAttendance, setConsolidatedRangeAttendance] = useState<ConsolidatedRangeAttendance[]>([]);
  const [singleFilters, setSingleFilters] = useState<SingleFilters>({
    singleDate: "",
    department: "",
    course: "",
    courseId: "",
    batch: "",
    semester: "",
  });
  const [groupFilters, setGroupFilters] = useState<GroupFilters>({
    fromDate: "",
    toDate: "",
    department: "",
    course: "",
    courseId: "",
    batch: "",
    semester: "",
  });
  const [attendanceMode, setAttendanceMode] = useState<"single" | "group">("single");
  const [isLoading, setIsLoading] = useState(false);
  const [allStudents, setAllStudents] = useState<StudentDetails[]>([]);
  const [facultyAssignments, setFacultyAssignments] = useState<FacultyAssignment[]>([]);
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];

  const [showSessionDetails, setShowSessionDetails] = useState<{
    fn: boolean;
    an: boolean;
  }>({ fn: false, an: false });

  const toggleSessionDetails = useCallback((session: 'fn' | 'an') => {
    setShowSessionDetails(prev => ({
      ...prev,
      [session]: !prev[session]
    }));
  }, []);

  const fetchFacultyCourses = useCallback(async () => {
    try {
      const assignmentsResponse = await api.get(`/faculty-student-assigning/admin/faculty/${facultyId}`);
      setFacultyAssignments(assignmentsResponse.data);

      const courseIds = [...new Set(assignmentsResponse.data.map((assignment: FacultyAssignment) => assignment.courseId))];
      
      const coursePromises = courseIds.map(async (courseId) => {
        const courseResponse = await api.get(`course/detailsbyId`, {
          params: { id: courseId }
        });
        return {
          courseId: String(courseId),
          courseName: String(courseResponse.data[0]?.courseTitle || courseId)
        } as Course;
      });

      const fetchedCourses: Course[] = await Promise.all(coursePromises);
      setCourses(fetchedCourses);

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

      // Get unique values for filters
      const uniqueBatches = [...new Set(allStudentsData.map(s => s.batch).filter(Boolean))] as string[];
      const uniqueDepartments = [...new Set(allStudentsData.map(s => s.deptName).filter(Boolean))] as string[];
      const uniqueSemesters = [...new Set(allStudentsData.map(s => s.sem).filter(Boolean))] as string[];

      setBatches(uniqueBatches);
      setDepartments(uniqueDepartments);
      setSemesters(uniqueSemesters);
    } catch (error) {
      // console.error("Error fetching faculty courses:", error);
      toast({title:"Failed to load faculty courses",variant:'destructive'});
    }
  }, [facultyId]);

  const resetFilters = useCallback(() => {
    if (attendanceMode === "single") {
      setSingleFilters({
        singleDate: "",
        department: "",
        course: "",
        courseId: "",
        batch: "",
        semester: "",
      });
      setAttendanceRecords([]);
    } else {
      setGroupFilters({
        fromDate: "",
        toDate: "",
        department: "",
        course: "",
        courseId: "",
        batch: "",
        semester: "",
      });
      setRangeAttendanceSummary([]);
      setConsolidatedRangeAttendance([]);
    }
    toast({title:"All filters have been reset",variant:'info'});
  }, [attendanceMode]);

  const fetchStudentsForCourse = useCallback(async (courseName: string) => {
    try {
      if (!courseName) {
        setBatches([]);
        setDepartments([]);
        setSemesters([]);
        return;
      }

      const course = courses.find(c => c.courseName === courseName);
      if (!course) return;

      const assignment = facultyAssignments.find(a => 
        a.facultyId === facultyId && a.courseId === course.courseId
      );
      if (!assignment) {
        setBatches([]);
        setDepartments([]);
        setSemesters([]);
        return;
      }

      const assignedStudents = allStudents.filter(student =>
        assignment.assignedRollNums.includes(student.rollNum)
      );

      const uniqueBatches = [...new Set(assignedStudents.map(s => s.batch).filter(Boolean))] as string[];
      const uniqueDepartments = [...new Set(assignedStudents.map(s => s.deptName).filter(Boolean))] as string[];
      const uniqueSemesters = [...new Set(assignedStudents.map(s => s.sem).filter(Boolean))] as string[];

      setBatches(uniqueBatches);
      setDepartments(uniqueDepartments);
      setSemesters(uniqueSemesters);
    } catch (error) {
      // console.error("Error fetching students:", error);
      toast({title:"Failed to load student list",variant:'destructive'});
    }
  }, [allStudents, courses, facultyAssignments, facultyId]);

  const fetchSingleDateAttendance = useCallback(async () => {
    if (!singleFilters.courseId || !singleFilters.singleDate) return;
    
    setIsLoading(true);
    try {
  

      const response = await api.get(
        `/attendance/getfacultybydate?facultyid=${facultyId}&courseid=${singleFilters.courseId}&date=${singleFilters.singleDate}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        setAttendanceRecords(response.data);
      } else {
        setAttendanceRecords([]);
        toast({title:"No attendance data found for this date",variant:'warning'});
      }
    } catch (error) {
      // console.error("Error fetching attendance:", error);
      toast({title:"Failed to load attendance records",variant:'destructive'});
      setAttendanceRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [singleFilters.courseId, singleFilters.singleDate, facultyId]);

  const fetchDateRangeAttendance = useCallback(async () => {
    if (!groupFilters.courseId || !groupFilters.fromDate || !groupFilters.toDate) return;
    
    setIsLoading(true);
    try {


      const response = await api.get(
        `/attendance/getfacultybydates?facultyid=${facultyId}&courseid=${groupFilters.courseId}&stdate=${groupFilters.fromDate}&endate=${groupFilters.toDate}`
      );
      
      if (response.data && Array.isArray(response.data)) {
        setRangeAttendanceSummary(response.data);

        const studentMap = new Map<string, ConsolidatedRangeAttendance>();
        
        response.data.forEach((record: RangeAttendanceSummary) => {
          if (!studentMap.has(record.stdId)) {
            studentMap.set(record.stdId, {
              stdId: record.stdId,
              stdName: record.stdName,
              batch: record.batch,
              deptName: record.deptName,
              sem: record.sem,
              courseName: record.courseName,
              totalConducted: 0,
              totalAttended: 0,
              percentage: 0
            });
          }
          
          const student = studentMap.get(record.stdId)!;
          student.totalConducted += record.totaldays;
          student.totalAttended += record.presentcount;
        });

        const consolidated = Array.from(studentMap.values()).map(student => ({
          ...student,
          percentage: student.totalConducted > 0 ? 
            (student.totalAttended / student.totalConducted) * 100 : 0
        }));

        setConsolidatedRangeAttendance(consolidated);
      } else {
        setRangeAttendanceSummary([]);
        setConsolidatedRangeAttendance([]);
        toast({title:"No attendance data found for this date range",variant:'warning'});
      }
    } catch (error) {
      // console.error("Error fetching attendance:", error);
      toast({title:"Failed to load attendance records",variant:'destructive'});
      setRangeAttendanceSummary([]);
      setConsolidatedRangeAttendance([]);
    } finally {
      setIsLoading(false);
    }
  }, [groupFilters.courseId, groupFilters.fromDate, groupFilters.toDate, facultyId]);

  useEffect(() => {
    fetchFacultyCourses();
  }, [fetchFacultyCourses]);

  useEffect(() => {
    if (attendanceMode === "single" && singleFilters.singleDate && singleFilters.courseId) {
      fetchSingleDateAttendance();
    }
  }, [attendanceMode, singleFilters.singleDate, singleFilters.courseId, fetchSingleDateAttendance]);

  useEffect(() => {
    if (attendanceMode === "group" && groupFilters.fromDate && groupFilters.toDate && groupFilters.courseId) {
      fetchDateRangeAttendance();
    }
  }, [attendanceMode, groupFilters.fromDate, groupFilters.toDate, groupFilters.courseId, fetchDateRangeAttendance]);

  const handleSelectChange = useCallback((name: string, value: string) => {
    if (name === "course") {
      const selectedCourse = courses.find(c => c.courseId === value);
      const courseName = selectedCourse ? selectedCourse.courseName : "";
      
      if (attendanceMode === "single") {
        setSingleFilters(prev => ({
          ...prev,
          course: courseName,
          courseId: value,
          department: "",
          batch: "",
          semester: "",
        }));
      } else {
        setGroupFilters(prev => ({
          ...prev,
          course: courseName,
          courseId: value,
          department: "",
          batch: "",
          semester: "",
        }));
      }
      fetchStudentsForCourse(courseName);
    } else {
      if (attendanceMode === "single") {
        setSingleFilters(prev => ({ ...prev, [name]: value }));
      } else {
        setGroupFilters(prev => ({ ...prev, [name]: value }));
      }
    }
  }, [attendanceMode, fetchStudentsForCourse, courses]);

  const downloadSingleDayPDF = useCallback(async (session: string) => {
  if (!singleFilters.course || !singleFilters.singleDate) {
    toast({title:"Please select all required filters",variant:'warning'});
    return;
  }

  const sessionRecords = attendanceRecords.filter(
    record => record.session.toLowerCase() === session.toLowerCase()
  );

  if (sessionRecords.length === 0) {
    toast({title:`No records found for ${session} session`,variant:"warning"});
    return;
  }

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 10;

  try {
    const logoUrl = "/Karpagam_Logo-removebg-preview.png";
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    doc.addImage(base64Image, "PNG", 60, currentY, 85, 16);
    currentY += 22;
  } catch {
    currentY += 22;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("KARPAGAM INSTITUTIONS", pageWidth / 2, currentY, { align: "center" });
  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Coimbatore - 641021, Tamil Nadu, India", pageWidth / 2, currentY, { align: "center" });
  currentY += 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(`${session.toUpperCase()} SESSION ATTENDANCE`, pageWidth / 2, currentY, { align: "center" });
  currentY += 12;

  // Course Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Course: ${singleFilters.course}`, 14, currentY); currentY += 6;
  doc.text(`Date: ${singleFilters.singleDate}`, 14, currentY); currentY += 6;
  if (singleFilters.department) { doc.text(`Department: ${singleFilters.department}`, 14, currentY); currentY += 6; }
  if (singleFilters.batch) { doc.text(`Batch: ${singleFilters.batch}`, 14, currentY); currentY += 6; }
  if (singleFilters.semester) { doc.text(`Semester: ${singleFilters.semester}`, 14, currentY); currentY += 8; }

  const headers = [["Roll Number", "Name", "Status"]];
  const tableData = sessionRecords.map(record => [
    record.stdId,
    record.stdName,
    record.status === 1 ? "Present" : "Absent"
  ]);
  
  const autoTableResult = autoTable(doc, {
    head: headers,
    body: tableData,
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [22, 78, 99],
      textColor: 255,
      fontSize: 11,
      halign: "center"
    },
    bodyStyles: {
      fontSize: 10,
      valign: "middle",
      halign: "center"
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 14, right: 14 }
  });

  const total = sessionRecords.length;
  const present = sessionRecords.filter(r => r.status === 1).length;
  const absent = total - present;

  currentY = (autoTableResult as any).finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary:", 14, currentY); currentY += 6;
  doc.setFont("helvetica", "normal");
  doc.text(`Total Students: ${total}`, 14, currentY); currentY += 6;
  doc.text(`Present: ${present}`, 14, currentY); currentY += 6;
  doc.text(`Absent: ${absent}`, 14, currentY);

  doc.save(`attendance-${singleFilters.singleDate}-${session}.pdf`);
}, [singleFilters, attendanceRecords]);

const downloadRangePDF = useCallback(async () => {
  if (!groupFilters.course || !groupFilters.fromDate || !groupFilters.toDate) {
    toast({title:"Please select all required filters",variant:"warning"});
    return;
  }

  if (consolidatedRangeAttendance.length === 0) {
    toast({title:"No attendance data available to download",variant:'warning'});
    return;
  }


  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 10;

  try {
    const logoUrl = "/Karpagam_Logo-removebg-preview.png";
    const response = await fetch(logoUrl);
    const blob = await response.blob();
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

    doc.addImage(base64Image, "PNG", 60, currentY, 85, 16);
    currentY += 22;
  } catch {
    currentY += 22;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("KARPAGAM INSTITUTIONS", pageWidth / 2, currentY, { align: "center" });
  currentY += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Coimbatore - 641021, Tamil Nadu, India", pageWidth / 2, currentY, { align: "center" });
  currentY += 13;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ATTENDANCE SUMMARY REPORT", pageWidth / 2, currentY, { align: "center" });
  currentY += 12;

  // Info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Course: ${groupFilters.course}`, 14, currentY); currentY += 6;
  doc.text(`Date Range: ${groupFilters.fromDate} to ${groupFilters.toDate}`, 14, currentY); currentY += 6;
  if (groupFilters.department) { doc.text(`Department: ${groupFilters.department}`, 14, currentY); currentY += 6; }
  if (groupFilters.batch) { doc.text(`Batch: ${groupFilters.batch}`, 14, currentY); currentY += 6; }
  if (groupFilters.semester) { doc.text(`Semester: ${groupFilters.semester}`, 14, currentY); currentY += 8; }

  const headers = [["Roll Number", "Name", "Conducted", "Attended", "Percentage"]];
  const tableData = consolidatedRangeAttendance.map(record => [
    record.stdId,
    record.stdName,
    `${record.totalConducted}`,
    `${record.totalAttended}`,
    `${record.percentage.toFixed(1)}%`
  ]);

  autoTable(doc, {
    head: headers,
    body: tableData,
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [22, 78, 99],
      textColor: 255,
      fontSize: 11,
      halign: "center"
    },
    bodyStyles: {
      fontSize: 10,
      valign: "middle",
      halign: "center"
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(`attendance-summary-${groupFilters.fromDate}-to-${groupFilters.toDate}.pdf`);

}, [groupFilters, consolidatedRangeAttendance]);

  const singleDayFN = useMemo(() => 
    attendanceRecords.filter(record => record.session.toLowerCase() === "fn"),
    [attendanceRecords]
  );

  const singleDayAN = useMemo(() => 
    attendanceRecords.filter(record => record.session.toLowerCase() === "an"),
    [attendanceRecords]
  );

  const { totalFNStudents, presentFNCount, absentFNCount } = useMemo(() => {
    const total = singleDayFN.length;
    const present = singleDayFN.filter(r => r.status === 1).length;
    return {
      totalFNStudents: total,
      presentFNCount: present,
      absentFNCount: total - present
    };
  }, [singleDayFN]);

  const { totalANStudents, presentANCount, absentANCount } = useMemo(() => {
    const total = singleDayAN.length;
    const present = singleDayAN.filter(r => r.status === 1).length;
    return {
      totalANStudents: total,
      presentANCount: present,
      absentANCount: total - present
    };
  }, [singleDayAN]);

  return (
    <>
      <Navbar />
      <div className="page-container max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col items-center">
          <Button
            variant="outline"
            className="self-start mb-2"
            onClick={() => navigate("/faculty/attendance")}
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-center">Attendance Records</h1>
          <p className="mt-2 text-center">View and get your attendance reports.</p>
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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Attendance Report</CardTitle>
                <CardDescription>
                  {attendanceMode === "single"
                    ? "Select the details to view attendance."
                    : "Select a date range to view overall attendance report."}
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                  value={attendanceMode === "single" ? singleFilters.courseId : groupFilters.courseId}
                  onValueChange={(value) => handleSelectChange("course", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
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
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select
                  value={attendanceMode === "single" ? singleFilters.batch : groupFilters.batch}
                  onValueChange={(value) => handleSelectChange("batch", value)}
                  disabled={!singleFilters.courseId && !groupFilters.courseId}
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
                  value={attendanceMode === "single" ? singleFilters.department : groupFilters.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                  disabled={!singleFilters.courseId && !groupFilters.courseId}
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
                  value={attendanceMode === "single" ? singleFilters.semester : groupFilters.semester}
                  onValueChange={(value) => handleSelectChange("semester", value)}
                  disabled={!singleFilters.courseId && !groupFilters.courseId}
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
                    onChange={(e) => handleSelectChange("singleDate", e.target.value)}
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
                      onChange={(e) => handleSelectChange("fromDate", e.target.value)}
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
                      onChange={(e) => handleSelectChange("toDate", e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              {isLoading ? (
                <p className="text-center">Loading attendance data...</p>
              ) : attendanceMode === "single" ? (
                !singleFilters.course || !singleFilters.singleDate ? (
                  <p className="text-center">Please select a course and date to view attendance.</p>
                ) : attendanceRecords.length === 0 ? (
                  <p className="text-center">No attendance records found for the selected filters.</p>
                ) : (
                  <div className="space-y-6">
                    {singleDayFN.length > 0 && (
                      <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                          <div>
                            <CardTitle>Forenoon (FN) Session</CardTitle>
                            <CardDescription>
                              {singleFilters.course} - {singleFilters.singleDate}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSessionDetails('fn')}
                            >
                              {showSessionDetails.fn ? 'Hide Details' : 'View Details'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadSingleDayPDF("FN")}
                              className="flex items-center gap-1"
                            >
                              <Download size={16} />
                              Export PDF
                            </Button>
                          </div>
                        </CardHeader>
                        {showSessionDetails.fn && (
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border rounded">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b text-left">Roll Number</th>
                                    <th className="py-2 px-4 border-b text-left">Name</th>
                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {singleDayFN.map((record) => (
                                    <tr key={record.id} className={record.status === 1 ? 'bg-green-50' : 'bg-red-50'}>
                                      <td className="py-3 px-4 border-b">{record.stdId}</td>
                                      <td className="py-3 px-4 border-b">{record.stdName}</td>
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
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6">
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
                                <p className="text-2xl font-bold">{totalFNStudents}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="text-sm text-gray-500 mb-1">Present</h3>
                                <p className="text-2xl font-bold text-green-600">{presentFNCount}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="text-sm text-gray-500 mb-1">Absent</h3>
                                <p className="text-2xl font-bold text-red-600">{absentFNCount}</p>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )}

                    {singleDayAN.length > 0 && (
                      <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                          <div>
                            <CardTitle>Afternoon (AN) Session</CardTitle>
                            <CardDescription>
                              {singleFilters.course} - {singleFilters.singleDate}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSessionDetails('an')}
                            >
                              {showSessionDetails.an ? 'Hide Details' : 'View Details'}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadSingleDayPDF("AN")}
                              className="flex items-center gap-1"
                            >
                              <Download size={16} /> 
                              Export PDF
                            </Button>
                          </div>
                        </CardHeader>
                        {showSessionDetails.an && (
                          <CardContent>
                            <div className="overflow-x-auto">
                              <table className="min-w-full border rounded">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="py-2 px-4 border-b text-left">Roll Number</th>
                                    <th className="py-2 px-4 border-b text-left">Name</th>
                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {singleDayAN.map((record) => (
                                    <tr key={record.id} className={record.status === 1 ? 'bg-green-50' : 'bg-red-50'}>
                                      <td className="py-3 px-4 border-b">{record.stdId}</td>
                                      <td className="py-3 px-4 border-b">{record.stdName}</td>
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
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mt-6">
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="text-sm text-gray-500 mb-1">Total Students</h3>
                                <p className="text-2xl font-bold">{totalANStudents}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="text-sm text-gray-500 mb-1">Present</h3>
                                <p className="text-2xl font-bold text-green-600">{presentANCount}</p>
                              </div>
                              <div className="bg-white p-4 rounded-lg border shadow-sm">
                                <h3 className="text-sm text-gray-500 mb-1">Absent</h3>
                                <p className="text-2xl font-bold text-red-600">{absentANCount}</p>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    )}
                  </div>
                )
              ) : !groupFilters.course || !groupFilters.fromDate || !groupFilters.toDate ? (
                <p className="text-center">Please select a course and date range to view attendance.</p>
              ) : consolidatedRangeAttendance.length === 0 ? (
                <p className="text-center">No attendance records found for the selected date range.</p>
              ) : (
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                      <CardTitle>Attendance Summary</CardTitle>
                      <CardDescription>
                        {groupFilters.course} - {groupFilters.fromDate} to {groupFilters.toDate}
                      </CardDescription>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={downloadRangePDF}
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
                            <th className="py-2 px-4 border-b text-center">Conducted</th>
                            <th className="py-2 px-4 border-b text-center">Attended</th>
                            <th className="py-2 px-4 border-b text-center">Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consolidatedRangeAttendance.map((record) => (
                            <tr key={record.stdId} className="hover:bg-gray-50">
                              <td className="py-3 px-4 border-b">{record.stdId}</td>
                              <td className="py-3 px-4 border-b">{record.stdName}</td>
                              <td className="py-3 px-4 border-b text-center">{record.totalConducted}</td>
                              <td className="py-3 px-4 border-b text-center">{record.totalAttended}</td>
                              <td className="py-3 px-4 border-b text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  record.percentage >= 75 ? 'bg-green-100 text-green-800' :
                                  record.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {record.percentage.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default React.memo(PreviousAttendancePage);
