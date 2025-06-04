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
  const [submissionStatus, setSubmissionStatus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    if (showAssignments) {
      fetchAssignments(courseId.toString());
    }
    // eslint-disable-next-line
  }, [showAssignments, courseId]);

  const fetchAssignments = async (courseId: string): Promise<Assignment[]> => {
    setLoadingAssignments(true);
    try {
      const response = await api.get<ApiResponse>('/assignments/course?', {
        params: { courseId },
      });
      console.log('Full response:', response.data);
      console.log('Assignments array:', response.data.assignments);
      setAssignments(response.data.assignments);

      // Check submission status for students
      if (profile.profile.role === 'STUDENT' && response.data.assignments.length > 0) {
        const status: Record<string, boolean> = {};
        for (const assignment of response.data.assignments) {
          try {
            const gradingResponse = await api.get('/gradings', {
              params: { assignmentId: assignment.assignmentId },
            });
            const submissions = gradingResponse.data.submissions || [];
            const hasSubmitted = submissions.some(
              (sub: any) => sub.studentRollNumber === profile.profile.id
            );
            status[assignment.assignmentId] = hasSubmitted;
          } catch (err) {
            console.error(`Error checking submission for assignment ${assignment.assignmentId}:`, err);
            status[assignment.assignmentId] = false;
          }
        }
        setSubmissionStatus(status);
      }

      return response.data.assignments;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
      return [];
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleSubmit = (assignmentId: string) => {
    if (!assignmentId) {
      alert('Invalid assignment ID');
      return;
    }
    navigate(`/student/assignments/${assignmentId}/submit`);
  };

  const handleGrade = (assignmentId: string) => {
    if (!assignmentId) {
      alert('Invalid assignment ID');
      return;
    }
    navigate(`/faculty/assignments/${assignmentId}/grade`);
  };

  const handleEditAssignment = (assignmentId: string) => {
    if (!assignmentId) {
      alert('Invalid assignment ID');
      return;
    }
    navigate(`/faculty/assignments/${assignmentId}/edit`);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!id) {
      alert('Invalid assignment ID');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) return;

    try {
      setDeletingId(id);
      await api.delete(`/assignments`, {
        params: { assignmentId: id },
      });
      setAssignments((prev) => prev.filter((assignment) => assignment.assignmentId !== id));
      alert('Assignment deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete assignment with ID:', id);
      console.error(error.response?.data || error.message);
      alert('Error deleting assignment: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4">
      <h2 className="text-3xl font-bold mb-6 text-black">Assignments</h2>
      {assignments.length > 0 ? (
        <div className="space-y-6">
          {assignments.map((assignment) => (
            <div
              key={assignment.assignmentId}
              className="bg-white border border-gray-700 rounded-xl p-8 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-1xl text-black">
                    <span className="text-lg font-semibold text-gray-600">Title: </span>
                    {assignment.title}
                  </h3>
                  <p className="text-lg text-gray-800 mt-2">
                    <span className="text-lg font-semibold text-gray-600">Description: </span>
                    {assignment.description}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="bg-gray-200 text-black px-6 py-3 rounded-md text-base font-medium shadow-sm">
                    Due:{' '}
                    {assignment.dueDate
                      ? new Date(assignment.dueDate).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : new Date(assignment.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                  </span>
                  {profile.profile.role === 'FACULTY' && (
                    <>
                      <button
                        className="flex items-center space-x-2 text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200"
                        onClick={() => handleEditAssignment(assignment.assignmentId)}
                        disabled={deletingId === assignment.assignmentId}
                        title="Edit Assignment"
                      >
                        <Edit size={24} />
                        <span className="text-base">Edit</span>
                      </button>
                      <button
                        className="flex items-center space-x-2 text-red-600 px-6 py-3 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200"
                        onClick={() => handleDeleteAssignment(assignment.assignmentId)}
                        disabled={deletingId === assignment.assignmentId}
                        title="Delete Assignment"
                      >
                        <Trash size={24} />
                        <span className="text-base">Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
              {assignment.fileName && (
                <p className="text-base text-gray-600 mt-3">
                  <span className="text-lg font-semibold text-gray-600">File: </span>
                  {assignment.fileName}
                </p>
              )}
              <div className="mt-6 flex justify-between items-center">
                <span className="text-base">
                  {assignment.resourceLink ? (
                    <a
                      href={assignment.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-all duration-200 text-base"
                    >
                      View Resources
                    </a>
                  ) : (
                    <span className="text-gray-600">No resources available</span>
                  )}
                </span>
                <div className="flex space-x-4">
                  {profile.profile.role === 'STUDENT' ? (
                    <button
                      className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 text-base"
                      onClick={() => handleSubmit(assignment.assignmentId)}
                      disabled={deletingId === assignment.assignmentId}
                    >
                      {submissionStatus[assignment.assignmentId] ? 'View Assignment' : 'Submit Assignment'}
                    </button>
                  ) : (
                    <button
                      className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 text-base"
                      onClick={() => handleGrade(assignment.assignmentId)}
                      disabled={deletingId === assignment.assignmentId}
                    >
                      <ClipboardCheck size={24} />
                      <span>Grade Assignment</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-600 text-lg">
          {loadingAssignments ? 'Loading assignments...' : 'No assignments available'}
        </div>
      )}
    </div>
  );
};

export default DisplayAssignments;