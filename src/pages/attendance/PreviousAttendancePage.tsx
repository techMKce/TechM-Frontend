import React, { useState, useEffect } from "react";
import Navbar from "@/components/FacultyNavbar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/service/api";

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
  const [facultyName] = useState("Dr. Jane Smith");
  const [facultyId] = useState("s421"); // This should come from auth context or props
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [rangeAttendanceSummary, setRangeAttendanceSummary] = useState<RangeAttendanceSummary[]>([]);
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
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent">("all");
  const [selectedDateInRange, setSelectedDateInRange] = useState<string | null>(null);
  const [attendanceMode, setAttendanceMode] = useState<"single" | "group">("single");
  const [showFN, setShowFN] = useState(false);
  const [showAN, setShowAN] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split("T")[0];
  const isDateRange = attendanceMode === "group" && !!groupFilters.fromDate && !!groupFilters.toDate;
  const filters = attendanceMode === "single" ? singleFilters : groupFilters;

  useEffect(() => {
    // Fetch faculty courses when component mounts
    const fetchFacultyCourses = async () => {
      try {
        const response = await api.get(`faculty-student-assigning/admin/assign/${facultyId}`);
        const facultyAssignments: FacultyAssignment[] = response.data;
        
        // Get unique course IDs
        const courseIds = [...new Set(facultyAssignments.map(assignment => assignment.courseId))];
        
        // Fetch course details for each course ID
        const coursePromises = courseIds.map(async (courseId) => {
          const courseResponse = await api.get(`course-enrollment/by-course/${courseId}`);
          return {
            courseId: courseId,
            courseName: courseResponse.data.courseName || courseId
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
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load student list");
    }
  };

  const fetchSingleDateAttendance = async (date: string) => {
    if (!date) return;
    setIsLoading(true);
    try {
      const response = await api.get(`getfaculty?id=${facultyId}&date=${date}`);
      setAttendanceRecords(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDateRangeAttendance = async (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return;
    setIsLoading(true);
    try {
      const response = await api.get(`getfacultyy?id=${facultyId}&stdate=${fromDate}&endate=${toDate}`);
      setRangeAttendanceSummary(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast.error("Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (attendanceMode === "single" && singleFilters.singleDate) {
      fetchSingleDateAttendance(singleFilters.singleDate);
    } else if (attendanceMode === "group" && groupFilters.fromDate && groupFilters.toDate) {
      fetchDateRangeAttendance(groupFilters.fromDate, groupFilters.toDate);
    }
  }, [attendanceMode, singleFilters.singleDate, groupFilters.fromDate, groupFilters.toDate]);

  const filteredRecords = attendanceRecords.filter((record) => {
    return (
      (!singleFilters.department || record.deptName === singleFilters.department) &&
      (!singleFilters.batch || record.batch === singleFilters.batch) &&
      (!singleFilters.course || record.courseName === singleFilters.course) &&
      (!singleFilters.semester || record.sem === singleFilters.semester)
    );
  });

  const singleDayFN = attendanceMode === "single" && singleFilters.singleDate
    ? filteredRecords.filter(record => record.session.toLowerCase() === "forenoon")
    : null;
  const singleDayAN = attendanceMode === "single" && singleFilters.singleDate
    ? filteredRecords.filter(record => record.session.toLowerCase() === "afternoon")
    : null;

  const getFilteredStudents = (students: AttendanceRecord[]) => {
    if (statusFilter === "all") return students;
    if (statusFilter === "present") return students.filter((s) => s.status === 1);
    return students.filter((s) => s.status === 0);
  };

  const downloadAttendancePDF = async (records: AttendanceRecord[], session: string) => {
    try {
      const doc = new jsPDF();
      
      // Add institution info
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text('KARPAGAM INSTITUTIONS', 105, 20, { align: 'center' });
      
      // Add attendance details
      doc.setFontSize(14);
      doc.text(`Attendance Sheet - ${records[0]?.deptName || ''} (${records[0]?.batch || ''})`, 14, 40);
      doc.text(`${records[0]?.courseName || ''} - Semester ${records[0]?.sem || ''}`, 14, 50);
      doc.text(`Date: ${records[0]?.dates || ''} [${session}]`, 14, 60);
      
      const headers = [['Roll Number', 'Name', 'Status']];
      const tableData = records.map(record => [
        record.rollNum || record.stdId,
        record.stdName,
        record.status === 1 ? 'Present' : 'Absent'
      ]);
      
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 70,
        styles: { fontSize: 10 }
      });
      
      doc.save(`attendance-${records[0]?.dates || 'unknown'}-${session}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate attendance PDF");
    }
  };
  
  const downloadOverallAttendancePDF = async () => {
    if (!rangeAttendanceSummary.length) {
      toast.error("No attendance data available to download");
      return;
    }
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(`Overall Attendance Summary`, 14, 20);
      doc.setFontSize(14);
      doc.text(`Date Range: ${groupFilters.fromDate} to ${groupFilters.toDate}`, 14, 30);
      
      if (groupFilters.department || groupFilters.batch || groupFilters.course) {
        let infoLine = "";
        if (groupFilters.department) infoLine += `Department: ${groupFilters.department}`;
        if (groupFilters.batch) infoLine += `${infoLine ? ', ' : ''}Batch: ${groupFilters.batch}`;
        if (groupFilters.course) infoLine += `${infoLine ? ', ' : ''}Course: ${groupFilters.course}`;
        doc.text(infoLine, 14, 40);
      }
      
      const headers = [['Roll No', 'Name', 'Days', 'FN (P/T)', 'AN (P/T)', 'Attendance %']];
      const tableData = rangeAttendanceSummary.map(student => [
        student.stdId,
        student.stdName,
        student.totaldays.toString(),
        `${student.session === 'forenoon' ? student.presentcount : '-'}/${student.session === 'forenoon' ? student.totaldays : '-'}`,
        `${student.session === 'afternoon' ? student.presentcount : '-'}/${student.session === 'afternoon' ? student.totaldays : '-'}`,
        `${student.percentage}%`
      ]);
      
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 50,
        styles: { fontSize: 9 }
      });
      
      doc.save(`overall-attendance-${groupFilters.fromDate}-to-${groupFilters.toDate}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "course") {
      // Reset dependent fields when course changes
      if (attendanceMode === "single") {
        setSingleFilters(prev => ({
          ...prev,
          course: value,
          department: "",
          batch: "",
          semester: ""
        }));
      } else {
        setGroupFilters(prev => ({
          ...prev,
          course: value,
          department: "",
          batch: "",
          semester: ""
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
        setSingleFilters(prev => ({ ...prev, [name]: value }));
      } else {
        setGroupFilters(prev => ({ ...prev, [name]: value }));
      }
    }
  };

  return (
    <>
      {/* <Navbar userType="faculty" userName={facultyName} /> */}
      <Navbar />
      <div className="page-container max-w-4xl mx-auto">
        <div className="mb-6 flex flex-col items-center">
          <Button variant="outline" className="self-start mb-2" onClick={() => navigate("/faculty/attendance")}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-center">Previous Attendance Records</h1>
          <p className="mt-2 text-center">View Previous Attendance Sheets</p>
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
                  onValueChange={(value) => handleSelectChange("course", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.courseId} value={course.courseName}>
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
                  onValueChange={(value) => handleSelectChange("department", value)}
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
                  onValueChange={(value) => handleSelectChange("semester", value)}
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
                      setSingleFilters(prev => ({ ...prev, singleDate: e.target.value }));
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
                        setGroupFilters(prev => ({
                          ...prev,
                          fromDate: e.target.value,
                          toDate: prev.toDate && prev.toDate < e.target.value ? "" : prev.toDate,
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
                        setGroupFilters(prev => ({ ...prev, toDate: e.target.value }));
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
                  <p className="text-secondary text-center">Please select a date to view attendance.</p>
                ) : (
                  <div className="space-y-4">
                    {(!singleDayFN?.length && !singleDayAN?.length) ? (
                      <p className="text-secondary text-center">No attendance records found for this date.</p>
                    ) : (
                      <>
                        {singleDayFN?.length && !showFN && (
                          <Card>
                            <CardContent className="flex flex-col md:flex-row md:justify-between md:items-center py-4">
                              <div>
                                <div className="font-semibold">{singleDayFN[0]?.deptName} - {singleDayFN[0]?.batch}</div>
                                <div className="text-sm text-secondary">{singleDayFN[0]?.courseName} - Semester {singleDayFN[0]?.sem}</div>
                                <div className="text-sm text-secondary">Date: {singleDayFN[0]?.dates} [FN]</div>
                              </div>
                              <div className="mt-2 md:mt-0 flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => { setShowFN(true); setShowAN(false); }}
                                >
                                  View Sheet
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => downloadAttendancePDF(singleDayFN, "FN")}
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
                                <div className="font-semibold">{singleDayAN[0]?.deptName} - {singleDayAN[0]?.batch}</div>
                                <div className="text-sm text-secondary">{singleDayAN[0]?.courseName} - Semester {singleDayAN[0]?.sem}</div>
                                <div className="text-sm text-secondary">Date: {singleDayAN[0]?.dates} [AN]</div>
                              </div>
                              <div className="mt-2 md:mt-0 flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => { setShowAN(true); setShowFN(false); }}
                                >
                                  View Sheet
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm" 
                                  onClick={() => downloadAttendancePDF(singleDayAN, "AN")}
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
                                <div>Attendance Sheet - {singleDayFN[0]?.deptName} ({singleDayFN[0]?.batch})</div>
                                <div>{singleDayFN[0]?.courseName} - Semester {singleDayFN[0]?.sem}</div>
                                <div>Date: {singleDayFN[0]?.dates} [FN]</div>
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">Total Students:</span> {singleDayFN.length}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2 items-center">
                                  <Label>Status Filter:</Label>
                                  <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                      <SelectItem value="present">Present</SelectItem>
                                      <SelectItem value="absent">Absent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button variant="outline" onClick={() => setShowFN(false)}>
                                  ← Back to View Sheet
                                </Button>
                              </div>
                              
                              <div>
                                <table className="min-w-full border rounded">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 border-b text-left">Roll Number</th>
                                      <th className="py-2 px-4 border-b text-left">Name</th>
                                      <th className="py-2 px-4 border-b text-left">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredStudents(singleDayFN).map((record) => (
                                      <tr key={record.id}>
                                        <td className="py-2 px-4 border-b">{record.rollNum || record.stdId}</td>
                                        <td className="py-2 px-4 border-b">{record.stdName}</td>
                                        <td className="py-2 px-4 border-b">
                                          {record.status === 1 ? (
                                            <span className="text-green-600">Present</span>
                                          ) : (
                                            <span className="text-red-600">Absent</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
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
                                <div>Attendance Sheet - {singleDayAN[0]?.deptName} ({singleDayAN[0]?.batch})</div>
                                <div>{singleDayAN[0]?.courseName} - Semester {singleDayAN[0]?.sem}</div>
                                <div>Date: {singleDayAN[0]?.dates} [AN]</div>
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">Total Students:</span> {singleDayAN.length}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex gap-2 items-center">
                                  <Label>Status Filter:</Label>
                                  <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="all">All</SelectItem>
                                      <SelectItem value="present">Present</SelectItem>
                                      <SelectItem value="absent">Absent</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button variant="outline" onClick={() => setShowAN(false)}>
                                  ← Back to View Sheet
                                </Button>
                              </div>
                              <div>
                                <table className="min-w-full border rounded">
                                  <thead>
                                    <tr className="bg-gray-100">
                                      <th className="py-2 px-4 border-b text-left">Roll Number</th>
                                      <th className="py-2 px-4 border-b text-left">Name</th>
                                      <th className="py-2 px-4 border-b text-left">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {getFilteredStudents(singleDayAN).map((record) => (
                                      <tr key={record.id}>
                                        <td className="py-2 px-4 border-b">{record.rollNum || record.stdId}</td>
                                        <td className="py-2 px-4 border-b">{record.stdName}</td>
                                        <td className="py-2 px-4 border-b">
                                          {record.status === 1 ? (
                                            <span className="text-green-600">Present</span>
                                          ) : (
                                            <span className="text-red-600">Absent</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </>
                    )}
                  </div>
                )
              ) : (
                // Group Attendance
                isDateRange ? (
                  !rangeAttendanceSummary.length ? (
                    <p className="text-secondary text-center">No attendance records found for the selected date range.</p>
                  ) : (
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle>
                            Attendance Sheet (Date Range: {groupFilters.fromDate} to {groupFilters.toDate})
                          </CardTitle>
                          <CardDescription>
                            <span className="font-semibold">Combined attendance for all sessions in given range</span>
                          </CardDescription>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={downloadOverallAttendancePDF}
                          className="flex items-center gap-1"
                        >
                          <Download size={16} />
                          PDF
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <table className="min-w-full border rounded">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="py-2 px-4 border-b text-left">Roll Number</th>
                              <th className="py-2 px-4 border-b text-left">Name</th>
                              <th className="py-2 px-4 border-b text-left">Days</th>
                              <th className="py-2 px-4 border-b text-left">FN Present / Total</th>
                              <th className="py-2 px-4 border-b text-left">AN Present / Total</th>
                              <th className="py-2 px-4 border-b text-left">Attendance %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rangeAttendanceSummary.map((student) => (
                              <tr key={`${student.stdId}-${student.session}`}>
                                <td className="py-2 px-4 border-b">{student.stdId}</td>
                                <td className="py-2 px-4 border-b">{student.stdName}</td>
                                <td className="py-2 px-4 border-b">{student.totaldays}</td>
                                <td className="py-2 px-4 border-b">
                                  {student.session === 'forenoon' ? `${student.presentcount}/${student.totaldays}` : '-'}
                                </td>
                                <td className="py-2 px-4 border-b">
                                  {student.session === 'afternoon' ? `${student.presentcount}/${student.totaldays}` : '-'}
                                </td>
                                <td className="py-2 px-4 border-b">{student.percentage}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <p className="text-secondary text-center">Please select a date range to view attendance.</p>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PreviousAttendancePage;