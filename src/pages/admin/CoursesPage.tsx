import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import api from "@/service/api";

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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/course/details");

        if (response.status !== 200) {
          throw new Error('Failed to fetch courses');
        }
        const data: Course[] = response.data.map((course: any) => ({
          id: course.course_id,
          courseId: course.course_id,
          name: course.courseTitle,
          description: course.courseDescription,
          facultyId: course.facultyId,
          facultyName: course.instructorName,
          isEnabled: course.isActive
        }));
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast({title:'Failed to load courses',variant:'destructive'});
      }
    };
    fetchCourses();
  }, []);

  const handleToggle = async (courseId: string) => {
    const response = await api.put(`/course/toggle/${courseId}`);

    if (response.status !== 200) {
      toast({title:'Failed to update course status',variant:'destructive'});
      return;
    }

    const updatedCourses = courses.map(course =>
      course.id === courseId ? { ...course, isEnabled: !course.isEnabled } : course
    );
    setCourses(updatedCourses);
    toast({title:`Course ${!courses.find(c => c.id === courseId)?.isEnabled ? 'enabled' : 'disabled'} successfully`});
  };

  const handleDelete = async (courseId: string) => {
    const response = await api.delete(`/course/delete`, { params: { course_id: courseId } });

    if (response.status !== 200) {
      toast({title:'Failed to delete course',variant:'destructive'});
      return;
    }

    const updatedCourses = courses.filter(course => course.id !== courseId);
    setCourses(updatedCourses);
    toast({title:"Course deleted successfully"});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/courses" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold ">Courses Management</h1>
          <p className="text-gray-600">Manage course information and assignments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Courses</CardTitle>
            <CardDescription>List of all courses created by faculty members</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Course ID</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course, index) => (
                  <TableRow key={course.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{course.courseId}</TableCell>
                    <TableCell>{course.name}</TableCell>
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
                {courses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No courses available
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