import { useState, useEffect } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, GraduationCap, BookOpen } from "lucide-react";
import FacultyAttendancePage from "../attendance/FacultyAttendancePage";
import api from "@/service/api";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    // Get counts from localStorage

    const getData = async () => {
      const studentResponse = await api.get("/profile/student/count");
      const facultyResponse = await api.get("/profile/faculty/count");
      const courseResponse = await api.get("/course/count");

      console.log("Student Count:", studentResponse.data);
      console.log("Faculty Count:", facultyResponse.data);
      console.log("Course Count:", courseResponse.data);
      setStats({
        totalStudents: studentResponse.data,
        totalFaculty: facultyResponse.data,
        totalCourses: courseResponse.data,
      });
    };
    getData();
  }, []);

  const dashboardCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "Active students in the system",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      title: "Total Faculty",
      value: stats.totalFaculty,
      description: "Active faculty members",
      icon: Users,
      color: "bg-green-500",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses,
      description: "Available courses",
      icon: BookOpen,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/dashboard" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your campus management system
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dashboardCards.map((card) => (
            <Card
              key={card.title}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.color}`}>
                  <card.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  • Add new students and faculty
                </p>
                <p className="text-sm text-gray-600">
                  • Manage course assignments
                </p>
                <p className="text-sm text-gray-600">• View detailed reports</p>
                <p className="text-sm text-gray-600">
                  • Upload CSV files for bulk operations
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Students Enrolled
                  </span>
                  <span className="text-sm font-medium">
                    {stats.totalStudents}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Faculty Active</span>
                  <span className="text-sm font-medium">
                    {stats.totalFaculty}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Courses Available
                  </span>
                  <span className="text-sm font-medium">
                    {stats.totalCourses}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
