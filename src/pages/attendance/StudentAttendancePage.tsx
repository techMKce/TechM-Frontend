import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/service/api";
import Navbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart4 } from "lucide-react";

interface CourseAttendanceData {
  courseId: string;
  courseName: string;
  credits: number;
  assignedSessions: number;
  conductedSessions: number;
  attendedSessions: number;
  percentage: number;
}

const StudentAttendancePage = () => {
  const { profile } = useAuth();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendanceData[]>([]);
  const [overallPercentage, setOverallPercentage] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const semesters = [
    "Semester 1", "Semester 2", "Semester 3", "Semester 4",
    "Semester 5", "Semester 6", "Semester 7", "Semester 8"
  ];

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    if (value) fetchAttendanceData(value);
  };

  const fetchAttendanceData = async (semester: string) => {
    setLoading(true);
    setError("");
    try {
      const studentId = profile.profile.id;
      const semesterNumber = parseInt(semester.split(" ")[1]);

      const [attendanceRes, courseRes] = await Promise.all([
        api.get(`/api/v1/attendance/getstudentbyid`, { params: { id: studentId } }),
        api.get("/api/v1/course/details")
      ]);

      const semesterAttendance = attendanceRes.data.filter((item: any) => item.sem === semesterNumber);
      const courseMap = new Map(courseRes.data.map((course: any) => [course.courseid, course.credits]));

      const data: CourseAttendanceData[] = semesterAttendance.map((item: any) => {
        const credits = courseMap.get(item.courseid) || 0;
        const assignedSessions = credits * 5;
        const percentage = item.totaldays > 0 ? Math.round((item.presentcount / item.totaldays) * 100) : 0;

        return {
          courseId: item.courseid,
          courseName: item.coursename,
          credits,
          assignedSessions,
          conductedSessions: item.totaldays,
          attendedSessions: item.presentcount,
          percentage
        };
      });

      const totalConducted = data.reduce((sum, d) => sum + d.conductedSessions, 0);
      const totalAttended = data.reduce((sum, d) => sum + d.attendedSessions, 0);
      const overall = totalConducted > 0 ? Math.round((totalAttended / totalConducted) * 100) : 0;

      setCourseAttendance(data);
      setOverallPercentage(overall);
    } catch (err: any) {
      setError("Failed to fetch attendance data.");
      setCourseAttendance([]);
      setOverallPercentage(null);
    }
    setLoading(false);
  };

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { text: "Excellent", color: "text-green-600" };
    if (percentage >= 80) return { text: "Good", color: "text-green-500" };
    if (percentage >= 75) return { text: "Satisfactory", color: "text-yellow-600" };
    return { text: "Needs Improvement", color: "text-red-500" };
  };

  const attendanceStatus = overallPercentage !== null ? getAttendanceStatus(overallPercentage) : null;

  return (
    <>
      <Navbar />
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
          <p className="mt-2">Track your attendance statistics</p>
        </div>

        <div className="mb-6">
          <Label htmlFor="semester">Select a semester to view your attendance details for that semester.</Label>
          <div className="max-w-xs mt-2">
            <Select value={selectedSemester} onValueChange={handleSemesterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>{semester}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {loading && <p className="mt-2">Loading attendance data...</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-3">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  <div className="h-20 w-20 rounded-full border-4 border-primary flex items-center justify-center mr-4">
                    <span className="text-2xl font-bold">{overallPercentage !== null ? `${overallPercentage}%` : "--"}</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Overall Attendance</h3>
                    <p className={`text-sm ${attendanceStatus ? attendanceStatus.color : "text-gray-500"}`}>
                      {attendanceStatus ? attendanceStatus.text : "--"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xs">Required</p>
                    <p className="text-2xl font-bold">75%</p>
                    <p className="text-xs">Minimum</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs">Current</p>
                    <p className="text-2xl font-bold">{overallPercentage !== null ? `${overallPercentage}%` : "--"}</p>
                    <p className="text-xs">Attendance</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs">Risk Status</p>
                    <p className={`text-2xl font-bold ${overallPercentage !== null ? (overallPercentage >= 75 ? "text-green-500" : "text-red-500") : "text-gray-500"}`}>
                      {overallPercentage !== null ? (overallPercentage >= 75 ? "Safe" : "At Risk") : "--"}
                    </p>
                    <p className="text-xs">Status</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart4 size={20} className="mr-2" />
                Course-wise Attendance
              </CardTitle>
              <CardDescription>Your attendance breakdown by course</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading course data...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : courseAttendance.length === 0 ? (
                <p className="text-muted-foreground">No course attendance data available.</p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4 font-semibold text-sm border-b pb-2">
                    <div className="col-span-2">Course</div>
                    <div className="text-center">Assigned</div>
                    <div className="text-center">Conducted</div>
                    <div className="text-center">Attended</div>
                    <div className="text-center">Percentage</div>
                  </div>
                  {courseAttendance.map((course) => (
                    <div key={course.courseId} className="grid grid-cols-6 gap-4 items-center">
                      <div className="col-span-2">
                        <h4 className="font-medium">{course.courseName}</h4>
                        <p className="text-sm text-muted-foreground">{course.courseId}</p>
                      </div>
                      <div className="text-center">{course.assignedSessions}</div>
                      <div className="text-center">{course.conductedSessions}</div>
                      <div className="text-center">{course.attendedSessions}</div>
                      <div className={`text-center font-bold ${
                        course.percentage >= 90 ? "text-green-600" :
                        course.percentage >= 80 ? "text-green-500" :
                        course.percentage >= 75 ? "text-yellow-600" : "text-red-500"
                      }`}>
                        {course.percentage}%
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default StudentAttendancePage;

