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
import { toast } from "sonner";

interface Course {
  course_id: number;
  courseCode: string | null;
  courseTitle: string;
  courseDescription: string;
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

interface AttendanceData {
  session: string | null;
  stdId: string;
  sem: number;
  batch: string;
  stdName: string;
  deptName: string;
  deptId: string;
  totaldays: number;
  presentcount: number;
  percentage: number;
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
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState({
    available: false,
    enrolled: false,
    courseDetails: false,
    attendance: false
  });

  const [showAvailableCoursesModal, setShowAvailableCoursesModal] = useState(false);
  const [showEnrolledCoursesModal, setShowEnrolledCoursesModal] = useState(false);
  const [showCourseDetailsModal, setShowCourseDetailsModal] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  useEffect(() => {
    loadStats();
  }, [currentUser.id]);

  const loadStats = async () => {
    try {
      setLoading(prev => ({ ...prev, available: true, enrolled: true, attendance: true }));

      // First fetch the enrolled course IDs for the student
      const enrolledResponse = await api.get(`/course-enrollment/by-student/${profile.profile.id}`);
      const enrolledCourseIds: string[] = enrolledResponse.data || [];

      // Then fetch all course details
      const allCoursesResponse = await api.get('/course/details');
      const allCourses: Course[] = allCoursesResponse.data || [];
      const activeCourses = allCourses.filter(course => course.isActive);

      // Now fetch details for each enrolled course
      const enrichedEnrollments: Enrollment[] = [];

      for (const courseId of enrolledCourseIds) {
        try {
          const courseDetailsResponse = await api.get(`/course/details/${courseId}`);
          enrichedEnrollments.push({
            courseId,
            rollNums: [], // This might need to be populated if you have this data
            courseDetails: courseDetailsResponse.data
          });
        } catch (error) {
          // console.error(`Error fetching details for course ${courseId}:`, error);
          // Fallback to basic course info if details fetch fails
          const fallbackCourse = allCourses.find(c => c.course_id.toString() === courseId) || {
            course_id: parseInt(courseId),
            courseTitle: `Course ${courseId}`,
            courseDescription: '',
            dept: '',
            createdAt: '',
            updatedAt: '',
            isActive: false,
            duration: 0,
            credit: 0,
            imageUrl: '',
            courseCode: null
          };
          enrichedEnrollments.push({
            courseId,
            rollNums: [],
            courseDetails: fallbackCourse
          });
        }
      }

      // Update stats
      setStats(prev => ({
        ...prev,
        enrolledCourses: enrichedEnrollments.length,
        availableCourses: activeCourses.length - enrichedEnrollments.length
      }));

      setEnrolledCoursesList(enrichedEnrollments);

      // Fetch attendance data from the new endpoint
      const attendanceResponse = await api.get('/attendance/allattendancepercentage');
      const attendanceData: AttendanceData[] = attendanceResponse.data || [];

      // Find the attendance record for the current student
      const studentAttendance = attendanceData.find(record => record.stdId === profile.profile.id);

      if (studentAttendance) {
        setStats(prev => ({
          ...prev,
          attendancePercentage: Math.round(studentAttendance.percentage)
        }));
      }

    } catch (error) {
      // console.error("Error loading dashboard data:", error);
    } finally {
      setLoading({ available: false, enrolled: false, courseDetails: false, attendance: false });
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      setLoading(prev => ({ ...prev, enrolled: true }));

      // First fetch the enrolled course IDs for the student
      const enrolledResponse = await api.get(`/course-enrollment/by-student/${profile.profile.id}`);
      const enrolledCourseIds: string[] = enrolledResponse.data || [];

      // Then fetch all course details
      const allCoursesResponse = await api.get('/course/details');
      const allCourses: Course[] = allCoursesResponse.data || [];

      // Now fetch details for each enrolled course
      const enrichedEnrollments: Enrollment[] = [];

      for (const courseId of enrolledCourseIds) {
        try {
          const courseDetailsResponse = await api.get(`/course/details/${courseId}`);
          enrichedEnrollments.push({
            courseId,
            rollNums: [], // This might need to be populated if you have this data
            courseDetails: courseDetailsResponse.data
          });
        } catch (error) {
          // console.error(`Error fetching details for course ${courseId}:`, error);
          // Fallback to basic course info if details fetch fails
          const fallbackCourse = allCourses.find(c => c.course_id.toString() === courseId) || {
            course_id: parseInt(courseId),
            courseTitle: `Course ${courseId}`,
            courseDescription: '',
            dept: '',
            createdAt: '',
            updatedAt: '',
            isActive: false,
            duration: 0,
            credit: 0,
            imageUrl: '',
            courseCode: null
          };
          enrichedEnrollments.push({
            courseId,
            rollNums: [],
            courseDetails: fallbackCourse
          });
        }
      }

      setEnrolledCoursesList(enrichedEnrollments);
      setStats(prev => ({ ...prev, enrolledCourses: enrichedEnrollments.length }));

    } catch (error) {
      // console.error("Error fetching enrolled courses:", error);
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
      // console.error("Error fetching available courses:", error);
    } finally {
      setLoading(prev => ({ ...prev, available: false }));
    }
  };

  const fetchCourseDetails = async (courseId: string) => {
    try {
      setLoading(prev => ({ ...prev, courseDetails: true }));
      const response = await api.get(`/course/details/${courseId}`);
      setSelectedCourse(response.data);
      setShowCourseDetailsModal(true);
    } catch (error) {
      toast.error("Failed to load course details. Please try again later.");
    } finally {
      setLoading(prev => ({ ...prev, courseDetails: false }));
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

  const handleCourseClick = (courseId: string) => {
    fetchCourseDetails(courseId);
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
              {loading.attendance && (
                <p className="text-xs text-gray-500 mt-1">Loading...</p>
              )}
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
            {loading.enrolled ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading enrolled courses...</p>
              </div>
            ) : enrolledCoursesList.length > 0 ? (
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
                  {enrolledCoursesList.map((enrollment) => (
                    <TableRow
                      key={enrollment.courseId}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCourseClick(enrollment.courseId)}
                    >
                      <TableCell>{enrollment.courseId}</TableCell>
                      <TableCell>{enrollment.courseDetails?.courseTitle}</TableCell>
                      <TableCell>{enrollment.courseDetails?.dept}</TableCell>
                      <TableCell>
                        <Badge variant={enrollment.courseDetails?.isActive ? "default" : "secondary"}>
                          {enrollment.courseDetails?.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
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

      {/* Course Details Modal */}
      <Dialog open={showCourseDetailsModal} onOpenChange={setShowCourseDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Detailed information about the course
            </DialogDescription>
          </DialogHeader>
          {loading.courseDetails ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading course details...</p>
            </div>
          ) : selectedCourse ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Course ID</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.course_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Course Code</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.courseCode || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Title</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.courseTitle}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Department</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.dept}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <Badge variant={selectedCourse.isActive ? "default" : "secondary"} className="mt-1">
                    {selectedCourse.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.duration} weeks</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Credits</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedCourse.credit}</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-sm text-gray-900">{selectedCourse.courseDescription}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No course details available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDashboard;