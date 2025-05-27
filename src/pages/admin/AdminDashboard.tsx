
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/AdminNavbar";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard page by default
    navigate("/admin/dashboard");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Welcome to Admin Dashboard</h2>
          <p className="text-gray-600 mt-2">Redirecting to Dashboard page...</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
