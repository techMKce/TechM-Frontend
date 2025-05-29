import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudentLogin from "./pages/auth/StudentLogin";
import FacultyLogin from "./pages/auth/FacultyLogin";
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
import SchedulePage from './pages/admin/SchedulePage';

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
// import ExamTimetablePage from "./pages/attendance/ExamTimetablePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/students" element={<StudentsPage />} />
          <Route path="/admin/faculty" element={<FacultyPage />} />
          <Route path="/admin/courses" element={<AdminCoursesPage />} />
          <Route path="/admin/assign-students" element={<AssignStudentsPage />} />
          <Route path="/admin/schedule" element={<SchedulePage />} />
          
          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/courses" element={<FacultyCoursesPage />} />
          <Route path="/faculty/students" element={<FacultyStudentsPage />} />
          <Route path="/faculty/attendance" element={<FacultyAttendancePage />} />
          <Route path="/faculty/attendance/view" element={<PreviousAttendancePage />} />

          <Route path="/faculty/assignments" element={<AssignmentsPage />} />

          <Route path="/faculty/assignments/create" element={<CreateAssignmentPage />} />
          
          <Route path="/faculty/assignments/id/:assignmentId" element={<EditAssignmentPage />} />
        <Route path="/faculty/assignments/${assignment.id}/edit" element={<EditAssignmentPage  />} />
        <Route path="/assignments/edit/:assignmentId" element={<EditAssignmentPage />} />
        <Route
          path="/faculty/assignments/:assignmentId/grade"
            element={<GradeSubmissionsPage/>} />
        <Route
          path="/faculty/assignments/:assignmentId/grade/:studentId/:submissionId"
          element={<GradeStudentSubmissionPage />} />
          <Route
            path="/faculty/assignments/:assignmentId/review/:studentRollNumber/:submissionId"
            element={<ReviewStudentSubmissionPage />}
          />


          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<StudentCoursesPage />} />
          <Route path="/student/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/student/courses/:courseId/assignments" element={<CourseAssignmentsPage />} />
          <Route path="/student/assignments/:assignmentId/submit" element={<AssignmentSubmitPage />} />
          <Route path="/student/attendance" element={<StudentAttendancePage />} />
          <Route path="/student/enrolled-courses" element={<EnrolledCoursesPage/>} />
          <Route path="/student/available-courses" element={<AvailableCoursesPage/>} />
          
          {/* Auth Routes */}

          
          {/* Shared Routes */}
          <Route path="/exams/timetable" element={<ExamTimetablePage />} />
          <Route path="/update-password" element={<UpdatePasswordPage />} />
          
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/view" element={<ViewProfile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />

          {/* For the Common Forgot Password UI*/}
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/changePassword" element={<UpdatePasswordPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;