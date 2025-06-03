import StudentNavbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Award } from "lucide-react";
import { useState, useEffect } from "react";
import api from '../../service/api';

import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface Enrollment {
  courseId: string;
  rollNums: string[];
  courseDetails?: Course;
}

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    availableCourses: 0,
    attendancePercentage: 0
  });

  const [availableCoursesList, setAvailableCoursesList] = useState<Course[]>([]);
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState({
    available: false,
    enrolled: false
  });

  const [showAvailableCoursesModal, setShowAvailableCoursesModal] = useState(false);
  const [showEnrolledCoursesModal, setShowEnrolledCoursesModal] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadStats();
  }, [currentUser.id]);


  const loadStats = async () => {
    try {
      setLoading(prev => ({ ...prev, available: true, enrolled: true }));


      // Fetch all courses
      const allCoursesResponse = await api.get('/course/details');
      const allCourses: Course[] = allCoursesResponse.data || [];
      const activeCourses = allCourses.filter(course => course.isActive);

      // Fetch enrolled courses
      const enrolledResponse = await api.get(`/course-enrollment/by-student/${profile.profile.id}`);
      const enrolledCoursesData: Enrollment[] = enrolledResponse.data || [];

      // Combine enrollment data with course details
      const enrichedEnrollments = enrolledCoursesData.map(enrollment => {
        const courseDetails = allCourses.find(c => c.course_id.toString() === enrollment.courseId);
        return {
          ...enrollment,
          courseDetails: courseDetails || {
            course_id: parseInt(enrollment.courseId),
            courseTitle: `Course ${enrollment.courseId}`,
            courseDescription: '',
            instructorName: 'Unknown',
            dept: '',
            createdAt: '',
            updatedAt: '',
            isActive: false,
            duration: 0,
            credit: 0,
            imageUrl: '',
            courseCode: null
          }
        };
      });

      // Update stats
      setStats({
        enrolledCourses: enrichedEnrollments.length,
        availableCourses: activeCourses.length - enrichedEnrollments.length,
        attendancePercentage: 0 // Will be updated below
      });

      setEnrolledCoursesList(enrichedEnrollments);

      // Fetch attendance data
      const attendanceResponse = await api.get('/attendance/getstudent', {
        params: { id: profile.profile.id }
      });

      const attendanceRecords = Array.isArray(attendanceResponse.data) ? attendanceResponse.data : [];
      const studentAttendance = attendanceRecords.filter(record => record.studentId === currentUser.id);

      if (studentAttendance.length > 0) {
        const attendedSessions = studentAttendance.filter(record => record.present).length;
        const attendancePercentage = Math.round((attendedSessions / studentAttendance.length) * 100);
        setStats(prev => ({ ...prev, attendancePercentage }));
      }

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading({ available: false, enrolled: false });
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(prev => ({ ...prev, enrolled: true }));

      const enrolledResponse = await api.get(`/course-enrollment/by-student/${profile.profile.id}`);
      const enrolledCoursesData: Enrollment[] = enrolledResponse.data || [];

      const allCoursesResponse = await api.get('/course/details');
      const allCourses: Course[] = allCoursesResponse.data || [];

      const enrichedEnrollments = enrolledCoursesData.map(enrollment => {
        const courseDetails = allCourses.find(c => c.course_id.toString() === enrollment.courseId);
        return {
          ...enrollment,
          courseDetails: courseDetails || {
            course_id: parseInt(enrollment.courseId),
            courseTitle: `Course ${enrollment.courseId}`,
            courseDescription: '',
            instructorName: 'Unknown',
            dept: '',
            createdAt: '',
            updatedAt: '',
            isActive: false,
            duration: 0,
            credit: 0,
            imageUrl: '',
            courseCode: null
          }
        };
      });

      setEnrolledCoursesList(enrichedEnrollments);
      setStats(prev => ({ ...prev, enrolledCourses: enrichedEnrollments.length }));

    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setLoading(prev => ({ ...prev, enrolled: false }));
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      setLoading(prev => ({ ...prev, available: true }));
      const response = await api.get('/course/details');
      const allCourses: Course[] = response.data || [];
      const activeCourses = allCourses.filter(course => course.isActive);

      const enrolledCourseIds = enrolledCoursesList.map(enrollment => enrollment.courseId);
      const availableCourses = activeCourses.filter(course =>
        !enrolledCourseIds.includes(course.course_id.toString())
      );

      setAvailableCoursesList(availableCourses);
      setStats(prev => ({ ...prev, availableCourses: availableCourses.length }));
    } catch (error) {
      console.error("Error fetching available courses:", error);
    } finally {
      setLoading(prev => ({ ...prev, available: false }));
    }
  };

  const handleEnrolledCoursesClick = async () => {
    await fetchEnrolledCourses();
    setShowEnrolledCoursesModal(true);
  };

  const handleAvailableCoursesClick = async () => {
    await fetchAvailableCourses();
    setShowAvailableCoursesModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar currentPage="/student/dashboard" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Welcome to your student portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Enrolled Courses Card */}
          <Card
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleEnrolledCoursesClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <div className="p-2 rounded-full bg-blue-500">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
              <CardDescription className="text-xs text-muted-foreground">
                Courses you're currently enrolled in
              </CardDescription>

              {loading.enrolled && (
                <p className="text-xs text-gray-500 mt-1">Loading...</p>
              )}
            </CardContent>
          </Card>


          {/* Available Courses Card */}
          <Card
            className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleAvailableCoursesClick}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
              <div className="p-2 rounded-full bg-orange-500">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableCourses}</div>
              <CardDescription className="text-xs text-muted-foreground">
                New courses available to enroll
              </CardDescription>
              {loading.available && (
                <p className="text-xs text-gray-500 mt-1">Loading...</p>
              )}
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Percentage</CardTitle>
              <div className="p-2 rounded-full bg-green-500">
                <Award className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendancePercentage}%</div>
              <CardDescription className="text-xs text-muted-foreground">
                Your overall attendance rate
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrolled Courses Modal */}
      <Dialog open={showEnrolledCoursesModal} onOpenChange={setShowEnrolledCoursesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Your Enrolled Courses</DialogTitle>
            <DialogDescription>
              List of all your enrolled courses ({enrolledCoursesList.length})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {enrolledCoursesList.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course ID</TableHead>
                    <TableHead>Title</TableHead>

                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledCoursesList.map((enrollment) => (
                    <TableRow key={enrollment.courseId}>
                      <TableCell>{enrollment.courseId}</TableCell>
                      <TableCell>{enrollment.courseDetails?.courseTitle}</TableCell>

                      {/* <TableCell>
                        <Badge variant={enrollment.courseDetails?.isActive ? "default" : "secondary"}>
                          {enrollment.courseDetails?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No enrolled courses</h3>
                <p className="text-sm text-gray-500">
                  You haven't enrolled in any courses yet
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Available Courses Modal */}
      <Dialog open={showAvailableCoursesModal} onOpenChange={setShowAvailableCoursesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Available Courses</DialogTitle>
            <DialogDescription>
              List of all available courses ({availableCoursesList.length})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {loading.available ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading available courses...</p>
              </div>
            ) : availableCoursesList.length > 0 ? (
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
                  {availableCoursesList.map((course) => (
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
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No courses available</h3>
                <p className="text-sm text-gray-500">
                  There are currently no courses available for enrollment
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;