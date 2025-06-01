import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/service/api'; // Adjust the import path as necessary
import {useAuth} from '@/hooks/useAuth'; // Adjust the import path as necessary
import { Edit, Trash, Undo } from 'lucide-react';
interface Assignment {
  assignmentId: string;
  courseId: string;
  title: string;
  description: string;
  createdAt: string;
  fileno?: string;
  resourcelink?: string;
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

  // handle Redirect to submission page
  const handleSubmit = (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
    navigate(`/student/assignments/${assignmentId}/submit`);
  }

  // handle Redirect to submission page
  const handleDeleteSubmission = async (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
     try {
    const response = await api.delete('/submissions', {
      data: {
        assignmentId,
        id: profile.profile.id
      },
    });

    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error deleting submission:', error);
  }
  }
  // handle Redirect to grade page
  const handleGrade = (assignmentId: string) => {
    if (!assignmentId) {
      alert("Invalid assignment ID");
      return;
    }
    navigate(`/faculty/assignments/${assignmentId}/grade`);
  }

  //handling Delete Assignments
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Assignments</h2>
      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <div key={assignment.assignmentId} className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{assignment.title}</h3>
                <span className="bg-gray-100 text-gray-900 px-2 py-1 rounded text-sm font-medium">
                  Due: {new Date(assignment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-600 mt-2">{assignment.description}</p>
              {assignment.fileno && (
                <p className="text-sm text-gray-500 mt-1">
                  File No: {assignment.fileno}
                </p>
              )}
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {assignment.resourcelink ? (
                    <a
                      href={assignment.resourcelink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Resources
                    </a>
                  ) : 'No resources available'}
                </span>
              <div>
              
                {(profile.profile.role=="STUDENT")?
                <>
                {/* <Undo className="inline-block mr-2 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={() => handleSubmit(assignment.assignmentId)}/> */}
                  <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors m-1"
                  onClick={() => handleSubmit(assignment.assignmentId)}
                  disabled={deletingId === assignment.assignmentId}
                >
                  Submit Assignment
                </button>
                </>
                :
                <>
                   {/* <Trash className="inline-block mr-2 text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={() => handleSubmit(assignment.assignmentId)}/> */}
                   <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors m-1"
                  onClick={() => handleGrade(assignment.assignmentId)}
                  disabled={deletingId === assignment.assignmentId}
                >
                  Grade Assignment
                </button>
                  <button
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors m-1"
                  onClick={() => handleDeleteAssignment(assignment.assignmentId)}
                  disabled={deletingId === assignment.assignmentId}
                >
                  {deletingId === assignment.assignmentId ? 'Deleting...' : 'Delete Assignment'}
                </button>
                </>
                }
                </div>
                {/* {(profile.profile.role=='FACULTY')?:
                
                } */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          {loadingAssignments ? 'Loading assignments...' : 'No assignments available'}
        </div>
      )}
    </div>
  );
};

export default DisplayAssignments;