import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {toast} from 'sonner';
import {
  Plus,
  Calendar,
  Users,
  CheckCircle,
  FileEdit,
  Trash2,
  Edit,
} from "lucide-react";
import api from "../../../service/api";
interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  course?: string;
  submissionCount: number;
  gradedCount: number;
}

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [facultyName] = useState("Dr. Jane Smith");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);



  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/assignments/all`);

        const fetchedAssignments: Assignment[] = (response.data.assignments || []).map((a: any) => ({
          id: a.assignmentId,
          title: a.title,
          dueDate: a.dueDate,
          course: a.course,
          submissionCount: a.submissionCount,
          gradedCount: a.gradedCount,
        }));

        setAssignments(fetchedAssignments);
      } catch (err) {
        setError("Failed to load assignments.");
        toast.error("Failed To Load Assignments",{description:"please Check Internet Connection"});
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleDelete = async (id: string) => {
   

    if (!id) {
      alert("Invalid assignment ID");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this assignment?");
    if (!confirmDelete) return;

    try {
      setDeletingId(id);

      await api.delete(`/assignments`, {
        params: { assignmentId: id },
      });

      setAssignments((prev) => prev.filter((assignment) => assignment.id !== id));
    } catch (error: any) {
      toast.error(`Failed to delete assignment with ID: ${id}`);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <Navbar />

      <div className="page-container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className=" mt-2">
              Manage and grade student assignments
            </p>
          </div>

          <Link to="/faculty/assignments/create">
            <Button className="mt-4 md:mt-0 bg-primary hover:bg-primary-dark flex items-center gap-2">
              <Plus size={18} />
              Create New Assignment
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading assignments...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="overflow-hidden card-hover relative"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-primary">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/faculty/assignments/id/${assignment.id}`}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Assignment"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50"
                          title="Delete Assignment"
                          disabled={deletingId === assignment.id}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-black mb-4">
                      <Calendar size={14} className="mr-1" />
                      <span>Due: {formatDate(assignment.dueDate)}</span>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-sm">
                        <Users size={14} className="mr-1 text-secondary" />
                        <span className="text-grey">
                          Submitted: {assignment.submissionCount}
                        </span>
                      </div>

                      <div className="flex items-center text-sm">
                        <CheckCircle
                          size={14}
                          className="mr-1 text-secondary"
                        />
                        <span className="text-secondary">
                          Graded: {assignment.gradedCount}
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/faculty/assignments/${assignment.id}/grade`}
                      className="flex items-center justify-center w-full py-2 mt-2 bg-accent hover:bg-accent-dark text-white rounded transition-colors"
                    >
                      <FileEdit size={16} className="mr-2" />
                      Grade Submissions
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-light rounded-lg">
            <FileEdit size={48} className="mx-auto text-secondary opacity-40" />
            <h3 className="mt-4 text-xl font-semibold text-primary">
              No assignments found
            </h3>
            <p className="mt-2 text-secondary">Try creating a new assignment</p>
          </div>
        )}
      </div>
    </>
  );
};

export default AssignmentsPage;