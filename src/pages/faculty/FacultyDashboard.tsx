import FacultyNavbar from "@/components/FacultyNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, UserCheck, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import api from "../../service/api";
import {useAuth} from '../../hooks/useAuth';

interface Course {
  course_id: number;
  courseCode: string | null;
  courseTitle: string;
  courseDescription: string;
  instructorName: string;
  dept: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  duration: number;
  credit: number;
  imageUrl: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
}

const FacultyDashboard = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0
  });
  const [formData, setFormData] = useState({
    courseId: "",
    name: "",
    description: ""
  });
  const [isCoursesModalOpen, setIsCoursesModalOpen] = useState(false);
  const [isActiveCoursesModalOpen, setIsActiveCoursesModalOpen] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [allCoursesData, setAllCoursesData] = useState<Course[]>([]);
  const [activeCoursesData, setActiveCoursesData] = useState<Course[]>([]);
  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
    fetchStudentCount();
  }, [profile?.profile?.id]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);

      // Fetch all courses (both active and inactive)
      const coursesResponse = await api.get('/course/details');
      const allCourses: Course[] = coursesResponse.data || [];

      setAllCoursesData(allCourses);


      // Filter courses for current faculty
      const facultyCourses = allCourses.filter(
        (course) => course.instructorName === profile?.profile?.name
      );
      setCourses(facultyCourses);


      // Get active courses
      const facultyActiveCourses = facultyCourses.filter(course => course.isActive);
      setActiveCoursesData(facultyActiveCourses);

      setStats(prev => ({
        ...prev,
        totalCourses: facultyCourses.length,
        activeCourses: facultyActiveCourses.length
      }));
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentCount = async () => {
    try {
      if (!profile?.profile?.id) return;

      const response = await api.get(
        `/faculty-student-assigning/admin/faculty/${profile.profile.id}/count`
      );
      const studentCount = response.data?.count || 0;

      setStats(prev => ({
        ...prev,
        totalStudents: studentCount
      }));
    } catch (error) {
      console.error("Error fetching student count:", error);
      toast.error("Failed to load student count");
    }
  };

  const fetchStudents = async () => {
    try {
      if (!profile?.profile?.id) return;

      const response = await api.get(
        `/faculty-student-assigning/admin/faculty/${profile.profile.id}/count`
      );
      const students = response.data || [];
      setStudentsData(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students data");
    }
  };

  const handleStudentsClick = async () => {
    await fetchStudents();
    setIsStudentsModalOpen(true);
  };

  const fetchActiveCourses = async () => {
    try {
      const response = await api.get('/course/details');
      const allCourses: Course[] = response.data || [];
      const activeCourses = allCourses.filter(
        course => course.isActive && course.instructorName === profile?.profile?.name
      );
      setActiveCoursesData(activeCourses);
    } catch (error) {
      console.error("Error fetching active courses:", error);
      toast.error("Failed to load active courses");
    }
  };

  const handleActiveCoursesClick = async () => {
    await fetchActiveCourses();
    setIsActiveCoursesModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.courseId || !formData.name || !formData.description) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      const newCourse = {
        course_id: formData.courseId,
        courseTitle: formData.name,
        courseDescription: formData.description,
        instructorName: profile?.profile?.name,
        isActive: true
      };

      const response = await api.post('/course/create', newCourse);
      if (response.data) {
        toast.success("Course created successfully");
        loadCourses();
        setFormData({ courseId: "", name: "", description: "" });
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      courseId: course.course_id.toString(),
      name: course.courseTitle,
      description: course.courseDescription
    });
    setIsEditDialogOpen(true);
  };


  const handleUpdate = async () => {
    if (!editingCourse || !formData.courseId || !formData.name || !formData.description) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const updatedCourse = {
        ...editingCourse,
        course_id: parseInt(formData.courseId),
        courseTitle: formData.name,
        courseDescription: formData.description
      };

      const response = await api.put(`/course/update/${editingCourse.course_id}`, updatedCourse);
      if (response.data) {
        toast.success("Course updated successfully");
        loadCourses();
        setEditingCourse(null);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update course");

    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FacultyNavbar currentPage="/faculty/dashboard" />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar currentPage="/faculty/dashboard" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
              <p className="text-gray-600">Welcome, {profile?.profile?.name}</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>Create a new course for students to enroll.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="courseId">Course ID</Label>
                    <Input
                      id="courseId"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter course description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Course</DialogTitle>
                  <DialogDescription>Update course information.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="editCourseId">Course ID</Label>
                    <Input
                      id="editCourseId"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      placeholder="e.g., CS101"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editName">Course Name</Label>
                    <Input
                      id="editName"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea
                      id="editDescription"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter course description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleUpdate}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div onClick={() => setIsCoursesModalOpen(true)} className="cursor-pointer">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                <div className="p-2 rounded-full bg-blue-500">
                  <BookOpen className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCourses}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  All courses you've created
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div onClick={handleActiveCoursesClick} className="cursor-pointer">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                <div className="p-2 rounded-full bg-green-500">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCourses}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  Courses currently active
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div onClick={handleStudentsClick} className="cursor-pointer">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <div className="p-2 rounded-full bg-purple-500">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStudents}</div>
                <CardDescription className="text-xs text-muted-foreground">
                  Students assigned to you
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={isCoursesModalOpen} onOpenChange={setIsCoursesModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>All Courses</DialogTitle>
              <DialogDescription>
                List of all your courses ({allCoursesData.length})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {allCoursesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCoursesData.map((course) => (
                      <TableRow key={course.course_id}>
                        <TableCell className="font-medium">{course.course_id}</TableCell>
                        <TableCell>{course.courseTitle}</TableCell>
                        <TableCell className="truncate max-w-xs">{course.courseDescription}</TableCell>
                        <TableCell>
                          <Badge variant={course.isActive ? "default" : "secondary"}>
                            {course.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No courses found</h3>
                  <p className="text-sm text-gray-500">
                    You haven't created any courses yet
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isActiveCoursesModalOpen} onOpenChange={setIsActiveCoursesModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Active Courses</DialogTitle>
              <DialogDescription>
                List of your currently active courses ({activeCoursesData.length})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {activeCoursesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCoursesData.map((course) => (
                      <TableRow key={course.course_id}>
                        <TableCell className="font-medium">{course.course_id}</TableCell>
                        <TableCell>{course.courseTitle}</TableCell>
                        <TableCell>{course.dept}</TableCell>
                        <TableCell>
                          <Badge variant={course.isActive ? "default" : "secondary"}>
                            {course.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No active courses</h3>
                  <p className="text-sm text-gray-500">
                    You don't have any active courses at the moment
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isStudentsModalOpen} onOpenChange={setIsStudentsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assigned Students</DialogTitle>
              <DialogDescription>
                List of students assigned to you ({stats.totalStudents})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {studentsData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">No students assigned</h3>
                  <p className="text-sm text-gray-500">
                    You don't have any students assigned at the moment
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>List of courses you have created</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <Card key={course.course_id} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{course.courseTitle}</CardTitle>
                        <Badge variant={course.isActive ? "default" : "secondary"}>
                          {course.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>Course ID: {course.course_id}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-2">
                        {course.courseDescription || 'No description available'}
                      </p>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(course)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-sm text-gray-500">
                  You haven't created any courses yet. Click "Add Course" to get started.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;