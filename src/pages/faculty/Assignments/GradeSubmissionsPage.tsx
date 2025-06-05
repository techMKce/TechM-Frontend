import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Clock, User, Search, Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";
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
  const [facultyName] = useState("Dr. Jane Smith");
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!assignmentId) {
      toast.error("Invalid assignment ID.");
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
          toast.error("Failed to load assignment details.");
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
            (g: any) =>
              g.studentRollNumber === sub.studentRollNumber &&
              g.assignmentId === assignmentId
          )?.grade,
        }));

        setSubmissions(mergedSubmissions);
      } catch (err) {
        toast.error("Failed to fetch assignment, submissions, or gradings.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  const filteredSubmissions = submissions.filter(
    (student) =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentRollNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
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
      toast.error("Invalid assignment ID.");
      return;
    }

    setIsDownloading(true);
    try {
      const response = await api.get("/gradings/download", {
        params: { assignmentId },
        responseType: "blob",
      });

      let filename = `${assignment?.title || "assignment"}.csv`;
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "text/csv" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("CSV report downloaded successfully.");
    } catch (err: any) {
      if (err.response?.data) {
        try {
          const text = await err.response.data.text();
          const errorObj = JSON.parse(text);
          toast.error(errorObj.message || "Failed to download CSV report.");
        } catch {
          toast.error("Failed to download CSV report.");
        }
      } else {
        toast.error("Failed to download CSV report.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container max-w-7xl mx-auto py-6 px-4">
        Loading...
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container max-w-7xl mx-auto py-6 px-4 sm:px-4 lg:px-6 relative">
        <div className="absolute top-6 left-4">
          <Link
            to={
              assignment?.courseId
                ? `/faculty/courses/${assignment.courseId}`
                : "/faculty/courses"
            }
            className="inline-block bg-black text-white text-base py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
          >
            ← Back to Assignments
          </Link>
        </div>

        <div className="mt-20">
          <div className="flex flex-col md:flex-row md:justify md:items-center gap-4 mb-6 ">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl font-bold">Grade Submissions</h1>
              <h2 className="text-lg text-gray-800">
                <span className="font-semibold">Assignment Title:</span>{" "}
                {assignment ? assignment.title : "Loading..."}
              </h2>
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 text-base h-10 px-4 self-start md:self-auto"
              disabled={isDownloading}
            >
              <Download size={16} />
              {isDownloading ? "Downloading..." : "Download Report (CSV)"}
            </Button>
          </div>

          <div className="bg-white p-4 rounded-md shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-wrap items-center gap-8">
                <div>
                  <p className="text-sm text-gray-600">Due Date:</p>
                  <p className="font-medium text-base">
                    {assignment ? formatDate(assignment.dueDate) : "Loading..."}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submissions:</p>
                  <p className="font-medium text-base">{submissions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Graded:</p>
                  <p className="font-medium text-base">
                    {submissions.filter((s) => s.grade).length} /{" "}
                    {submissions.length}
                  </p>
                </div>
              </div>
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                  size={16}
                />
                <Input
                  placeholder="Search by student name or roll number..."
                  className="pl-9 text-base h-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">
                      S.No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">
                      Roll Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">
                      Submitted On
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredSubmissions.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-base text-gray-800">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={20} />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-base text-gray-800">
                              {student.studentName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-base text-gray-800">
                        {student.studentRollNumber}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-gray-600 text-base">
                          <Clock size={14} className="mr-1" />
                          {formatDate(student.submittedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/faculty/assignments/${assignmentId}/grade/${student.studentRollNumber}/${student.id}`
                            )
                          }
                          className={`text-sm flex items-center gap-1 h-10 px-4 text-white ${
                            student.grade
                              ? "bg-black hover:bg-gray-800"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
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
                <FileText
                  size={36}
                  className="mx-auto text-gray-400 opacity-40"
                />
                <p className="mt-2 text-base text-gray-600">
                  No submissions found
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeSubmissionsPage;