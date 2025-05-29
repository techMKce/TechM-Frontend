import { useState } from "react";
import Navbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart4 } from "lucide-react";
import api from "@/service/api";

// Define interface for the API response data
interface AttendanceData {
  session: string;
  stdId: string;
  deptName: string;
  sem: number;
  stdName: string;
  batch: string;
  deptId: string;
  totaldays: number;
  presentcount: number;
  percentage: number;
}

const StudentAttendancePage = () => {
  // State variables
  const [studentId] = useState("l302"); // Hardcoded for now, can be made dynamic later
  const [studentName, setStudentName] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Session data for the selected semester
  const [fnSessionData, setFnSessionData] = useState({ conducted: 0, attended: 0, percentage: 0 });
  const [anSessionData, setAnSessionData] = useState({ conducted: 0, attended: 0, percentage: 0 });

  // Function to handle semester selection
  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    fetchAttendanceData(value);
  };

  // Function to fetch attendance data from API
  const fetchAttendanceData = async (semester: string) => {
    if (!semester) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await api.get<AttendanceData[]>(`/getstudent?id=${studentId}`);
      setAttendanceData(response.data);
      
      // Set student name from the first record if available
      if (response.data.length > 0) {
        setStudentName(response.data[0].stdName);
      }
      
      // Filter data for the selected semester
      const semNumber = parseInt(semester.split(" ")[1]);
      const semesterData = response.data.filter(item => item.sem === semNumber);
      
      // Check if data exists for this semester
      if (semesterData.length === 0) {
        setError(`No attendance data found for ${semester}`);
        setFnSessionData({ conducted: 0, attended: 0, percentage: 0 });
        setAnSessionData({ conducted: 0, attended: 0, percentage: 0 });
        return;
      }
      
      // Process FN (forenoon) session data
      const fnData = semesterData.find(item => item.session.toLowerCase() === "forenoon");
      if (fnData) {
        setFnSessionData({
          conducted: fnData.totaldays,
          attended: fnData.presentcount,
          percentage: fnData.percentage
        });
      } else {
        setFnSessionData({ conducted: 0, attended: 0, percentage: 0 });
      }
      
      // Process AN (afternoon) session data
      const anData = semesterData.find(item => item.session.toLowerCase() === "afternoon");
      if (anData) {
        setAnSessionData({
          conducted: anData.totaldays,
          attended: anData.presentcount,
          percentage: anData.percentage
        });
      } else {
        setAnSessionData({ conducted: 0, attended: 0, percentage: 0 });
      }
      
    } catch (err) {
      console.error("Error fetching attendance data:", err);
      setError("Failed to fetch attendance data. Please try again later.");
      setFnSessionData({ conducted: 0, attended: 0, percentage: 0 });
      setAnSessionData({ conducted: 0, attended: 0, percentage: 0 });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate overall percentage
  const getOverallPercentage = () => {
    if (fnSessionData.conducted === 0 && anSessionData.conducted === 0) return 0;
    if (fnSessionData.conducted === 0) return Math.round(anSessionData.percentage);
    if (anSessionData.conducted === 0) return Math.round(fnSessionData.percentage);
    
    return Math.round((fnSessionData.percentage + anSessionData.percentage) / 2);
  };
  
  const dynamicOverallPercentage = getOverallPercentage();

  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 90) return { text: "Excellent", color: "text-green-600" };
    if (percentage >= 80) return { text: "Good", color: "text-green-500" };
    if (percentage >= 75) return { text: "Satisfactory", color: "text-yellow-600" };
    return { text: "Needs Improvement", color: "text-red-500" };
  };

  const attendanceStatus = getAttendanceStatus(dynamicOverallPercentage);

  const semesters = [
    "Semester 1",
    "Semester 2",
    "Semester 3",
    "Semester 4",
    "Semester 5",
    "Semester 6",
    "Semester 7",
    "Semester 8",
  ];

  return (
    <>
      {/* <Navbar userType="student" userName={studentName || "Student"} /> */}
      <Navbar  />
      <div className="page-container max-w-5xl mx-auto m-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
          <p className="mt-2">Track your attendance statistics</p>
        </div>

        <div className="mb-6">
          <Label htmlFor="semester">Select a semester to view your attendance details for that semester.</Label>
          <div>
            <br />
          </div>
          <div className="max-w-xs">
            <Select value={selectedSemester} onValueChange={handleSemesterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((semester) => (
                  <SelectItem key={semester} value={semester}>
                    {semester}
                  </SelectItem>
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
                    <span className="text-2xl font-bold">
                      {!selectedSemester || error ? "--" : `${dynamicOverallPercentage}%`}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Overall Attendance</h3>
                    <p className={`text-sm ${!selectedSemester || error ? "text-gray-500" : attendanceStatus.color}`}>
                      {!selectedSemester || error ? "--" : attendanceStatus.text}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center gap-6">
                  <div className="text-center">
                    <p className="text-xs ">Required</p>
                    <p className="text-2xl ">75%</p>
                    <p className="text-xs">Minimum</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs">Current</p>
                    <p className="text-2xl font-bold">
                      {loading ? "Loading..." : !selectedSemester || error ? "--" : `${dynamicOverallPercentage}%`}
                    </p>
                    <p className="text-xs">Attendance</p>
                  </div>

                  <div className="text-center">
                    <p className="text-xs">Risk Status</p>
                    <p className={`text-2xl font-bold ${!selectedSemester || error ? "text-yellow-500" : dynamicOverallPercentage >= 75 ? "text-green-500" : "text-red-500"}`}>
                      {loading ? "Loading..." : !selectedSemester || error ? "--" : dynamicOverallPercentage >= 75 ? "Safe" : "At Risk"}
                    </p>
                    <p className="text-xs">Status</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FN & AN Session */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart4 size={20} className="mr-2" />
                Session-Based Attendance Overview
              </CardTitle>
              <CardDescription>Breakdown by FN & AN session</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading session data...</p>
              ) : !selectedSemester ? (
                <p className="text-sm text-muted-foreground">Please select a semester to view session data.</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : (
                <div className="space-y-4">
                  <div className="border rounded-md p-4 bg-muted/30">
                    <h4 className="font-semibold mb-1">FN Session (Forenoon)</h4>
                    <p>
                      Total FN Sessions Conducted:{" "}
                      <strong>{fnSessionData.conducted}</strong>
                    </p>
                    <p>
                      Total FN Sessions Attended:{" "}
                      <strong>{fnSessionData.attended}</strong>
                    </p>
                    <p>
                      Attendance %:{" "}
                      <strong className="text-green-600">
                        {fnSessionData.percentage.toFixed(2)}%
                      </strong>
                    </p>
                  </div>

                  <div className="border rounded-md p-4 bg-muted/30">
                    <h4 className="font-semibold mb-1">AN Session (Afternoon)</h4>
                    <p>
                      Total AN Sessions Conducted:{" "}
                      <strong>{anSessionData.conducted}</strong>
                    </p>
                    <p>
                      Total AN Sessions Attended:{" "}
                      <strong>{anSessionData.attended}</strong>
                    </p>
                    <p>
                      Attendance %:{" "}
                      <strong className="text-yellow-600">
                        {anSessionData.percentage.toFixed(2)}%
                      </strong>
                    </p>
                  </div>
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