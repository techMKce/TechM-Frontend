
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Clock, User, Search, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/service/api";
interface StudentSubmission {
  id: number;
  studentName: string;
  studentRollNumber: string;
  submittedAt: string;
  grade?: string;
}

interface Assignment {
  assignmentId: string;
  title: string;
  dueDate: string;
  description: string;
  courseId: string;
}

const GradeSubmissionsPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  // const [facultyName] = useState("Dr. Jane Smith");
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false); // Track download state
  const navigate = useNavigate();
  const {state}=useLocation()
  useEffect(() => {
    if (!assignmentId) {
      toast({ title: "Invalid assignment ID.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [assignmentRes, submissionRes, gradingRes] = await Promise.all([
          api.get("/assignments/id", {
            params: { assignmentId },
          }),
          api.get("/submissions", {
            params: { assignmentId },
          }),
          api.get("/gradings", {
            params: { assignmentId },
          }),
        ]);

        if (assignmentRes.data.assignment) {
          setAssignment(assignmentRes.data.assignment);
        } else {
          toast({ title: "Failed to load assignment details.", variant: "destructive" });
        }

        const submissionsData = Array.isArray(submissionRes.data.submissions)
          ? submissionRes.data.submissions
          : [];
        const gradingsData = Array.isArray(gradingRes.data.gradings)
          ? gradingRes.data.gradings
          : [];


        const mergedSubmissions = submissionsData.map((sub: any) => ({
          id: sub.id,
          studentName: sub.studentName,
          studentRollNumber: sub.studentRollNumber,
          submittedAt: sub.submittedAt,
          grade: gradingsData.find(
            (g: any) => g.studentRollNumber === sub.studentRollNumber && g.assignmentId === assignmentId
          )?.grade,
        }));

        setSubmissions(mergedSubmissions);
      } catch (err) {
        toast({ title: "Failed to fetch assignment, submissions, or gradings.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  const filteredSubmissions = submissions.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentRollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDownloadCSV = async () => {
    if (!assignmentId) {
      toast({ title: "Invalid assignment ID.", variant: "destructive" });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await api.get("/gradings/download", {
        params: { assignmentId },
        responseType: "blob",
      });

      // Extract filename from Content-Disposition header
      let filename = `${assignment?.title || "assignment"}.csv`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up
      toast({ title: "CSV report downloaded successfully.", variant: "default" });
    } catch (err: any) {
      // Attempt to parse error response for more specific message
      if (err.response?.data) {
        try {
          const text = await err.response.data.text();
          const errorObj = JSON.parse(text);
          toast({ title: errorObj.message || "Failed to download CSV report.", variant: "destructive" });
        } catch {
          toast({ title: "Failed to download CSV report.", variant: "destructive" });
        }
      } else {
        toast({ title: "Failed to download CSV report.", variant: "destructive" });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return <div className="page-container max-w-4xl mx-auto">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="page-container max-w-4xl mx-auto max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
         <Link
            to={assignment?.courseId ? `/faculty/courses/${assignment.courseId}` : "/faculty/courses"}
            state={state}
          >
            ← Back to Assignments
          </Link>

 

          <div className="flex flex-col md:flex-row md:justify-between md:items-center mt-4">
            <div>
              <h1 className="text-3xl font-bold">Grade Submissions</h1>
              <h2 className="text-xl text-dark mt-1">
                {assignment ? assignment.title : "Loading..."}
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={handleDownloadCSV}
                className="flex items-center gap-2"
                disabled={isDownloading}
              >
                <Download size={16} />
                {isDownloading ? "Downloading..." : "Download Report (CSV)"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-10">
              <div>
                <p className="text-sm text-dark">Due Date :</p>
                <p className="font-medium">
                  {assignment ? formatDate(assignment.dueDate) : "Loading..."}
                </p>
              </div>

              <div>
                <p className="text-sm text-dark">Submissions</p>
                <p className="font-medium">{submissions.length}</p>
              </div>

              <div>
                <p className="text-sm text-dark">Graded</p>
                <p className="font-medium">
                  {submissions.filter((s) => s.grade).length} / {submissions.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark"
              size={18}
            />
            <Input
              placeholder="Search by student name or roll number..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-light">
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary">
                    Student
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary">
                    Roll Number
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary">
                    Submitted On
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredSubmissions.map((student) => (
                  <tr key={student.id} className="hover:bg-dark">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-light/20 flex items-center justify-center text-primary">
                          <User size={20} />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-primary-dark">
                            {student.studentName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-primary-dark">
                      {student.studentRollNumber}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-dark">
                        <Clock size={14} className="mr-1" />
                        {formatDate(student.submittedAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            student.grade
                              ? `/faculty/assignments/${assignmentId}/review/${student.studentRollNumber}/${student.id}`
                              : `/faculty/assignments/${assignmentId}/grade/${student.studentRollNumber}/${student.id}`,
                              {state:state}
                          )
                        }
                        className="text-sm flex items-center gap-1 bg-black hover:bg-black"
                      >
                        <FileText size={14} />
                        {student.grade ? "Review" : "Grade"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8">
              <FileText size={36} className="mx-auto text-secondary opacity-40" />
              <p className="mt-2 ">No submissions found</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default GradeSubmissionsPage;