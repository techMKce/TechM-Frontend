import AdminNavbar from "@/components/AdminNavbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input"; // ✅ NEW: For search input
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Course {
  id: string;
  courseId: string;
  name: string;
  description: string;
  facultyId: string;
  facultyName: string;
  isEnabled: boolean;
}

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // ✅ NEW: Search term

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem("courses") || "[]");
    setCourses(savedCourses);
  }, []);

  const handleToggle = (courseId: string) => {
    const updatedCourses = courses.map((course) =>
      course.id === courseId
        ? { ...course, isEnabled: !course.isEnabled }
        : course
    );
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    toast.success(
      `Course ${
        !courses.find((c) => c.id === courseId)?.isEnabled
          ? "enabled"
          : "disabled"
      } successfully`
    );
  };

  const handleDelete = (courseId: string) => {
    const updatedCourses = courses.filter((course) => course.id !== courseId);
    setCourses(updatedCourses);
    localStorage.setItem("courses", JSON.stringify(updatedCourses));
    window.dispatchEvent(new CustomEvent("coursesUpdated"));
    toast.success("Course deleted successfully");
  };

  // ✅ NEW: Filtered course list
  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/courses" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Courses Management</h1>
          <p className="text-gray-600">Manage course information and assignments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>List of all courses created by faculty members</CardDescription>

            {/* ✅ Search Input */}
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Search by course name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Faculty Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.courseId}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.facultyName}</TableCell>
                    <TableCell>
                      <Switch
                        checked={course.isEnabled}
                        onCheckedChange={() => handleToggle(course.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No courses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoursesPage;
