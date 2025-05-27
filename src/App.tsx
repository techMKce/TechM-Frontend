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

          <Route path="/faculty/login" element={<FacultyLogin />} />
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/courses" element={<FacultyCoursesPage />} />
          <Route path="/faculty/students" element={<FacultyStudentsPage />} />

          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/available-courses" element={<AvailableCoursesPage />} />
          <Route path="/student/enrolled-courses" element={<EnrolledCoursesPage />} />
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