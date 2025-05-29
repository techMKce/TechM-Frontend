
import React, { useEffect, useState, useRef } from "react";
import AssignmentCard, { Assignment } from "./AssignmentCard";
import Navbar from "@/components/StudentNavbar";
// import { Sidebar } from "@/components/layout/Sidebar";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "https://assignmentservice-2a8o.onrender.com/api";

const CourseAssignmentsPage = () => {
  const { courseId } = useParams();
  const studentName = "John Doe";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/assignments/all`);
        const rawAssignments = response.data.assignments || [];

        // Remove duplicates based on assignmentId
        const uniqueAssignments = rawAssignments
          .filter(
            (a: any, index: number, self: any[]) =>
              index === self.findIndex((b) => b.assignmentId === a.assignmentId)
          )
          .map((a: any): Assignment => ({
            id: a.assignmentId,
            title: a.title,
            description: a.description || "No description provided",
            dueDate: a.dueDate,
            status: a.status || "submit", // Use actual status if provided
            submittedFile: a.submittedFile,
            grade: a.grade,
            feedback: a.feedback,
          }));

        setAssignments(uniqueAssignments);
      } catch (err) {
        console.error(err);
        setError("Failed to load assignments.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const navItems = [
    { title: "Dashboard", href: "/student/dashboard" },
    { title: "Courses", href: "/student/courses" },
    { title: "Attendance", href: "/student/attendance" },
  ];

  if (loading) return <p className="p-4">Loading assignments...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="flex h-screen">
      {/* <Sidebar items={navItems} /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar  />
        <div className="page-container p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Assignments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.length === 0 && <p>No assignments found.</p>}
            {assignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseAssignmentsPage;
