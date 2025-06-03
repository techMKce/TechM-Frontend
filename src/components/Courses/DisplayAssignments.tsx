import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/service/api';
import { useAuth } from '@/hooks/useAuth';
import { Edit, Trash, ClipboardCheck } from 'lucide-react';

interface Assignment {
  assignmentId: string;
  courseId: string;
  title: string;
  description: string;
  createdAt: string;
  dueDate?: string;
  fileno?: string;
  fileName?: string;
  resourceLink?: string;
}

interface ApiResponse {
  assignments: Assignment[];
  message: string;
}

interface DisplayAssignmentsProps {
  courseId: string | number;
  showAssignments: boolean;
}

const DisplayAssignments: React.FC<DisplayAssignmentsProps> = ({ courseId, showAssignments }) => {
  const { profile } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showAssignments) {
      fetchAssignments(courseId.toString());
    }
    // eslint-disable-next-line
  }, [showAssignments, courseId]);

  const handleSubmit = (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
    navigate(`/student/assignments/${assignmentId}/submit`);
  };

  const handleDeleteSubmission = async (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
    try {
      const response = await api.delete('/submissions', {
        data: {
          assignmentId,
          id: profile.profile.id,
        },
      });
      console.log('Success:', response.data);
      alert("Submission deleted successfully");
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert("Failed to delete submission");
    }
  };

  const handleGrade = (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
    navigate(`/faculty/assignments/${assignmentId}/grade`);
  };

  const handleEditAssignment = (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
    navigate(`/faculty/assignments/${assignmentId}/edit`);
  };

  const handleDeleteAssignment = async (id: string) => {
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
      setAssignments((prev) => prev.filter((assignment) => assignment.assignmentId !== id));
      alert("Assignment deleted successfully");
    } catch (error: any) {
      console.error("Failed to delete assignment with ID:", id);
      console.error(error.response?.data || error.message);
      alert("Error deleting assignment: " + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  const fetchAssignments = async (courseId: string): Promise<Assignment[]> => {
    setLoadingAssignments(true);
    try {
      const response = await api.get<ApiResponse>(
        '/assignments/course?',
        {
          params: { courseId }
        }
      );
      console.log('Full response:', response.data);
      console.log('Assignments array:', response.data.assignments);
      setAssignments(response.data.assignments);
      return response.data.assignments;
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
      return [];
    } finally {
      setLoadingAssignments(false);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-2xl font-bold mb-6 text-black">Assignments</h2>
      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.assignmentId}
              className="bg-white border border-gray-700 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-xl text-black">
                    <span className="text-gray-600">Title: </span>
                    {assignment.title}
                  </h3>
                  <p className="text-base text-gray-800 mt-2">
                    <span className="text-gray-600 font-semibold">Description: </span>
                    {assignment.description}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-gray-200 text-black px-5 py-2 rounded-md text-sm font-medium">
                    Due: {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString()
                      : new Date(assignment.createdAt).toLocaleDateString()}
                  </span>
                  {profile.profile.role === "FACULTY" && (
                    <>
                      <button
                        className="flex items-center space-x-1  text-blue-600 px-5 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => handleEditAssignment(assignment.assignmentId)}
                        disabled={deletingId === assignment.assignmentId}
                        title="Edit Assignment"
                      >
                        <Edit size={20} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="flex items-center space-x-1  text-red-600 px-5 py-2 rounded-md hover:bg-gray-200 disabled:opacity-50"
                        onClick={() => handleDeleteAssignment(assignment.assignmentId)}
                        disabled={deletingId === assignment.assignmentId}
                        title="Delete Assignment"
                      >
                        <Trash size={20} />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              {assignment.fileName && (
                <p className="text-sm text-gray-600 mt-3">
                  <span className="text-gray-600 font-semibold">File: </span>
                  {assignment.fileName}
                </p>
              )}
              <div className="mt-5 flex justify-between items-center">
                <span className="text-sm">
                  {assignment.resourceLink ? (
                    <a
                      href={assignment.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-gray-800 transition-colors"
                    >
                      View Resources
                    </a>
                  ) : (
                    <span className="text-gray-600">No resources available</span>
                  )}
                </span>
                <div className="flex space-x-2">
                  {profile.profile.role === "STUDENT" ? (
                    <>
                      <button
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        onClick={() => handleSubmit(assignment.assignmentId)}
                        disabled={deletingId === assignment.assignmentId}
                      >
                        Submit Assignment
                      </button>
                      <button
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        onClick={() => handleDeleteSubmission(assignment.assignmentId)}
                        disabled={deletingId === assignment.assignmentId}
                      >
                        Delete Submission
                      </button>
                    </>
                  ) : (
                    <button
                      className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                      onClick={() => handleGrade(assignment.assignmentId)}
                      disabled={deletingId === assignment.assignmentId}
                    >
                      <ClipboardCheck size={20} />
                      <span>Grade Assignment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600">
          {loadingAssignments ? 'Loading assignments...' : 'No assignments available'}
        </div>
      )}
    </div>
  );
};

export default DisplayAssignments;