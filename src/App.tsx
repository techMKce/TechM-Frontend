import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyCoursesPage from "./pages/faculty/CoursesPage";
import FacultyStudentsPage from "./pages/faculty/StudentsPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import AvailableCoursesPage from "./pages/student/AvailableCoursesPage";
import EnrolledCoursesPage from "./pages/student/EnrolledCoursesPage";

import CreateAssignmentPage from "./pages/faculty/Assignments/CreateAssignmentPage";

import DashboardPage from "./pages/admin/DashboardPage";
import StudentsPage from "./pages/admin/StudentsPage";
import FacultyPage from "./pages/admin/FacultyPage";
import AdminCoursesPage from "./pages/admin/CoursesPage";
import AssignStudentsPage from "./pages/admin/AssignStudentsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProfilePage from "@/pages/profile";
import EditProfile from "@/pages/profile/EditProfile";
import ViewProfile from "./pages/profile/ViewProfile";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/auth/UpdatePasswordPage";
// import AssignmentManager from "./pages/faculty/AssignmentManager";
import SchedulePage from "./pages/admin/SchedulePage";

import FacultyAttendancePage from "./pages/attendance/FacultyAttendancePage";
import StudentAttendancePage from "./pages/attendance/StudentAttendancePage";
import GradeSubmissionsPage from "./pages/faculty/Assignments/GradeSubmissionsPage";
import EditAssignmentPage from "./pages/faculty/Assignments/EditAssignmentPage";
import AssignmentsPage from "./pages/faculty/Assignments/AssignmentsPage";
import GradeStudentSubmissionPage from "./pages/faculty/Assignments/GradeStudentSubmissionPage";
import ReviewStudentSubmissionPage from "./pages/faculty/Assignments/ReviewStudentSubmissionPage";
import StudentCoursesPage from "./pages/student/StudentCoursesPage";
import CourseDetailPage from "./pages/student/CourseDetailPage";
import CourseAssignmentsPage from "./pages/student/CourseAssignmentsPage";
import AssignmentSubmitPage from "./pages/student/AssignmentSubmitPage";
import ExamTimetablePage from "./pages/attendance/ExamTimetablePage";
import PreviousAttendancePage from "./pages/attendance/PreviousAttendancePage";
import LoadingSpinner from "./components/LoadingSpinner";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import { AuthProvider } from "./context/AuthProvider";
// import ExamTimetablePage from "./pages/attendance/ExamTimetablePage";

const queryClient = new QueryClient();

import { Outlet, Navigate } from "react-router-dom";
import CourseList from "./components/Courses/CourseList";
import ViewCourse from "./components/Courses/ViewCourse";

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

const DashboardSelector = () => {
  const { profile } = useAuth();
  console.log("At dbSelector : Profile:", profile);
  switch (profile?.profile.role) {
    case "STUDENT":
      return <StudentDashboard />;
    case "FACULTY":
      return <FacultyDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

const RoleProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { profile } = useAuth();

  if (!profile || !allowedRoles.includes(profile?.profile.role)) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public routes - no protection needed */}
    <Route path="/login" element={<Login />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/changePassword" element={<UpdatePasswordPage />} />

    {/* Protected routes - require authentication */}
    <Route element={<ProtectedRoute />}>
      {/* Default route with role-based routing */}
      <Route index element={<DashboardSelector />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminDashboard />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <DashboardPage />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <StudentsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/faculty" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <FacultyPage />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <AdminCoursesPage />
          {/* <CourseList /> */}
        </RoleProtectedRoute>
      } />
      <Route path="/admin/courses/:courseId" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          {/* <CourseDetailPage /> */}
          <ViewCourse />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/assign-students" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <AssignStudentsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/admin/schedule" element={
        <RoleProtectedRoute allowedRoles={["ADMIN"]}>
          <SchedulePage />
        </RoleProtectedRoute>
      } />

      {/* Faculty routes */}
      <Route path="/faculty/dashboard" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <FacultyDashboard />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/courses" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          {/* <FacultyCoursesPage /> */}
          <CourseList />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/courses/:courseId" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          {/* <CourseDetailPage /> */}
          <ViewCourse />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/students" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <FacultyStudentsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/attendance" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <FacultyAttendancePage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/attendance/view" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <PreviousAttendancePage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <AssignmentsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments/create" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <CreateAssignmentPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments/id/:assignmentId" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <EditAssignmentPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments/:assignmentId/edit" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <EditAssignmentPage />
        </RoleProtectedRoute>
      } />
      <Route path="/assignments/edit/:assignmentId" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <EditAssignmentPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments/:assignmentId/grade" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <GradeSubmissionsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments/:assignmentId/grade/:studentId/:submissionId" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <GradeStudentSubmissionPage />
        </RoleProtectedRoute>
      } />
      <Route path="/faculty/assignments/:assignmentId/review/:studentRollNumber/:submissionId" element={
        <RoleProtectedRoute allowedRoles={["FACULTY"]}>
          <ReviewStudentSubmissionPage />
        </RoleProtectedRoute>
      } />

      {/* Student routes */}
      <Route path="/student/dashboard" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          <StudentDashboard />
        </RoleProtectedRoute>
      } />
      <Route path="/student/courses" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          
         <CourseList />
         {/* <StudentCoursesPage/> */}
        </RoleProtectedRoute>
      } />
      <Route path="/student/courses/:courseId" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          {/* <CourseDetailPage /> */}
          <ViewCourse />
        </RoleProtectedRoute>
      } />
      <Route path="/student/courses/:courseId/assignments" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          <CourseAssignmentsPage />
        </RoleProtectedRoute>
      } />
      <Route path="/student/assignments/:assignmentId/submit" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          <AssignmentSubmitPage />
        </RoleProtectedRoute>
      } />
      <Route path="/student/attendance" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          <StudentAttendancePage />
        </RoleProtectedRoute>
      } />
      <Route path="/student/enrolled-courses" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          <EnrolledCoursesPage />
        </RoleProtectedRoute>
      } />
      <Route path="/student/available-courses" element={
        <RoleProtectedRoute allowedRoles={["STUDENT"]}>
          <AvailableCoursesPage />
        </RoleProtectedRoute>
      } />

      {/* Shared routes - accessible to all authenticated users */}
      <Route path="/exams/timetable" element={<ExamTimetablePage />} />
      <Route path="/update-password" element={<UpdatePasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/edit" element={<EditProfile />} />
      <Route path="/profile/view" element={<ViewProfile />} />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
