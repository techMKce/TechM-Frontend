import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/StudentNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Calendar, Upload, ArrowLeft, X, Check, Eye, Download } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import api from '../../service/api';
import { useAuth } from "@/hooks/useAuth";

interface Assignment {
  title: string;
  dueDate: string;
  courseName: string;
  courseId: string;
  description: string;
  fileNo?: string;
  fileName?: string;
}

const AssignmentSubmitPage = () => {
  const { profile } = useAuth();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [studentName] = useState("John Doe");
  const [studentRollNumber] = useState("CS101");
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGraded, setIsGraded] = useState(false);
  const [grade, setGrade] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isDueDateOver, setIsDueDateOver] = useState(false);
  const [rejected, setRejected] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get("/assignments/id", {
          params: { assignmentId }
        });
        setAssignment(response.data.assignment);
        setError(null);
        const dueDate = new Date(response.data.assignment.dueDate);
        const currentDate = new Date();
        setIsDueDateOver(currentDate > dueDate);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to fetch assignment details.");
        toast.error("Error fetching assignment");
        console.error("Fetch assignment error:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkSubmissionStatusAndGrading = async () => {
      try {
        const response = await api.get("/gradings", {
          params: { assignmentId }
        });

        const submissions = response.data.submissions || [];
        const gradings = response.data.gradings || [];

        const userSubmission = submissions.find((sub: any) => sub.studentRollNumber === profile.profile.id);
        const userGrading = gradings.find((g: any) => g.studentRollNumber === profile.profile.id);

        setIsSubmitted(userSubmission != null);
        setRejected(userSubmission?.status === "Rejected");
        if (userSubmission) {
          setSubmittedAt(userSubmission.submittedAt);
        }
        if (userGrading) {
          setIsGraded(true);
          setGrade(userGrading.grade);
          setFeedback(userGrading.feedback);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to check submission and grading status");
        console.error("Submission/grading error:", err);
      }
    };

    if (assignmentId) {
      fetchAssignment();
      checkSubmissionStatusAndGrading();
    }

    return () => {
      if (viewerUrl) {
        window.URL.revokeObjectURL(viewerUrl);
      }
    };
  }, [assignmentId, profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isDueDateOver) {
      const fileArray = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    if (!isDueDateOver) {
      setFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    if (isDueDateOver) {
      toast.error("Cannot submit: Due date has passed.");
      return;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    const formData = new FormData();
    formData.append("assignmentId", assignmentId!);
    formData.append("studentName", studentName);
    formData.append("studentRollNumber", profile?.profile?.id || studentRollNumber);
    formData.append("file", files[0]);
    formData.append("studentDepartment", profile.profile?.department || "");
    formData.append("studentSemester", profile.profile?.year || "");

    try {
      const response = await api.post(
        "/submissions",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      toast.success("Assignment submitted successfully");
      setIsSubmitted(true);
      setSubmittedAt(response.data.submission?.submittedAt || new Date().toISOString());
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit assignment");
      console.error("Submit error:", err);
    }
  };

  const handleUnsubmit = async () => {
    if (isDueDateOver) {
      toast.error("Cannot unsubmit: Due date has passed.");
      return;
    }

    const confirmed = confirm("Are you sure you want to unsubmit this assignment?");
    if (!confirmed) return;

    try {
      await api.delete("/submissions", {
        data: {
          assignmentId,
          studentRollNumber: profile?.profile?.id || studentRollNumber,
        },
      });
      setIsSubmitted(false);
      setFiles([]);
      setSubmittedAt(null);
      setIsGraded(false);
      setGrade(null);
      setFeedback(null);
      toast.info("Assignment unsubmitted successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to unsubmit assignment");
      console.error("Unsubmit error:", err);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isDueDateOver && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      e.dataTransfer.clearData();
    }
  };

  const handleViewDocument = async () => {
    if (isViewerOpen) {
      setIsViewerOpen(false);
      if (viewerUrl) {
        window.URL.revokeObjectURL(viewerUrl);
        setViewerUrl(null);
      }
      return;
    }

    if (!assignmentId) {
      toast.error("Assignment ID not available");
      return;
    }

    try {
      const response = await api.get("/assignments/download", {
        params: { assignmentId },
        responseType: "blob",
      });

      const contentType = response.headers['content-type'] || 'application/pdf';
      if (!contentType.includes('pdf') && !contentType.includes('image')) {
        toast.error("File type not supported for viewing. Please download the file.");
        return;
      }

      const blob = new Blob([response.data], { type: contentType });
      const fileUrl = window.URL.createObjectURL(blob);
      setViewerUrl(fileUrl);
      setIsViewerOpen(true);
      toast.info("Document opened for viewing");
    } catch (err: any) {
      console.error("View error:", err);
      toast.error(err?.response?.data?.message || "Failed to view document. Try downloading it.");
    }
  };

  const handleDownloadDocument = async () => {
    if (!assignmentId) {
      toast.error("Assignment ID not available");
      return;
    }

    try {
      const response = await api.get("/assignments/download", {
        params: { assignmentId },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", assignment?.fileName || `assignment_${assignmentId}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.info("Document downloaded successfully");
    } catch (err: any) {
      console.error("Download error:", err);
      toast.error(err?.response?.data?.message || "Failed to download document");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata"
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg">Loading assignment...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">{error || "Assignment not found."}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <Link
            to={`/student/courses/${assignment.courseId}`}
            className="flex items-center text-accent hover:text-accent-dark mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Assignment
          </Link>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Assignment Details */}
            <Card className="shadow-md w-full lg:w-1/2">
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="text-2xl font-bold text-primary mb-2">{assignment.title}</h2>
                <p className="mb-4">{assignment.courseName}</p>
                <div className="flex items-center text-sm mb-6">
                  <Calendar size={16} className="mr-1" />
                  <span>Due: {formatDate(assignment.dueDate)}</span>
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p>{assignment.description}</p>
                </div>
                <div>
                  <p className="text-sm">Faculty Uploaded File</p>
                  <div className="mt-2 p-3 bg-light rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-20 bg-primary rounded flex items-center justify-center text-white text-xs">
                        {assignment.fileName ? assignment.fileName.split(".").pop()?.toUpperCase() : "DOCUMENT"}
                      </div>
                      <p className="ml-2 font-medium truncate max-w-[120px]">{assignment.fileName || "Assignment File"}</p>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleViewDocument}
                        className="h-8 w-8 p-0"
                      >
                        <Eye size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleDownloadDocument}
                        className="h-8 w-8 p-0"
                      >
                        <Download size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
                {isViewerOpen && viewerUrl && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Document Viewer</h4>
                    <div ref={viewerRef} style={{ width: "100%", maxHeight: "80vh", overflow: "auto" }}>
                      <iframe
                        src={viewerUrl}
                        style={{ width: "100%", height: "500px", border: "none" }}
                        title="Faculty Document Viewer"
                      />
                    </div>
                    <Button
                      onClick={handleViewDocument}
                      className="mt-2 bg-red-600 hover:bg-red-700"
                    >
                      Close Viewer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Your Work */}
            <Card className="shadow-md w-full lg:w-1/2">
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
                      <Check size={20} className="text-green-500 mr-3 mt-1" />
                      <div>
                        <h3 className="font-medium text-green-700">Assignment Submitted</h3>
                        <p className="text-green-600 text-sm">
                          Your assignment has been successfully submitted.
                        </p>
                        <p className="text-green-600 text-sm">
                          Submitted on: {submittedAt ? formatDate(submittedAt) : "N/A"}
                        </p>
                        {isGraded && (
                          <>
                            <p className="text-blue-600 text-sm mt-2 font-semibold">
                              Grade: {grade || "N/A"}
                            </p>
                            {feedback && (
                              <p className="text-blue-600 text-sm mt-1 max-h-32 overflow-y-auto">
                                <span className="font-semibold">Feedback:</span> {feedback}
                              </p>
                            )}
                          </>
                        )}
                        {rejected && (
                          <p className="text-yellow-700 text-sm mt-2 font-semibold">
                            Your submission was rejected. Please resubmit your assignment.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      {rejected ? (
                        <>
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragActive(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setDragActive(false);
                            }}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-md p-6 text-center transition ${
                              dragActive ? "border-blue-500 bg-blue-50" : "bg-white"
                            }`}
                          >
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={handleFileChange}
                              disabled={isDueDateOver}
                            />
                            <label
                              htmlFor="file-upload"
                              className="flex flex-col items-center justify-center cursor-pointer"
                            >
                              <Upload className="h-12 w-12 mb-2" />
                              <p className="text-sm mb-1">
                                Drag & drop files here or click to browse
                              </p>
                              <p className="text-xs">
                                Supports: PDF, DOC, DOCX, ZIP (Max: 10MB)
                              </p>
                            </label>
                          </div>

                          {files.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                              <div className="space-y-2">
                                {files.map((file, index) => (
                                  <div key={index} className="flex items-center justify-between bg-light p-2 rounded">
                                    <div className="flex items-center">
                                      <div className="flex-shrink-0 h-8 w-8 bg-primary rounded flex items-center justify-center text-white text-xs">
                                        {file.name.split(".").pop()?.toUpperCase()}
                                      </div>
                                      <div className="ml-3">
                                        <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                        <p className="text-xs">
                                          {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => removeFile(index)}
                                    >
                                      <X size={16} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mt-6">
                            <Button
                              onClick={handleSubmit}
                              className="bg-primary hover:bg-primary-dark"
                              disabled={files.length === 0 || isDueDateOver}
                            >
                              Resubmit Assignment
                            </Button>
                          </div>
                        </>
                      ) : isDueDateOver ? (
                        <span className="text-red-600 text-sm font-semibold">
                          Due Date Over: Cannot unsubmit
                        </span>
                      ) : grade === null ? (
                        <Button
                          onClick={handleUnsubmit}
                          variant="outline"
                          className="text-red-500 border-red-500 hover:bg-red-50"
                        >
                          Unsubmit
                        </Button>
                      ) : (
                        <span className="text-blue-600 text-sm font-semibold">
                          Graded: No further actions available
                        </span>
                      )}
                    </div>
                  </div>
                ) : isDueDateOver ? (
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
                      <X size={20} className="text-red-500 mr-3 mt-1" />
                      <div>
                        <h3 className="font-medium text-red-700">Due Date Over</h3>
                        <p className="text-red-600 text-sm">
                          The due date for this assignment has passed. Submissions are no longer accepted.
                        </p>
                      </div>
                    </div>
                    <Button
                      disabled
                      className="bg-gray-400 cursor-not-allowed"
                    >
                      Due Date Over
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragActive(false);
                      }}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-md p-6 text-center transition ${
                        dragActive ? "border-blue-500 bg-blue-50" : "bg-white"
                      }`}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isDueDateOver}
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload className="h-12 w-12 mb-2" />
                        <p className="text-sm mb-1">
                          Drag & drop files here or click to browse
                        </p>
                        <p className="text-xs">
                          Supports: PDF, DOC, DOCX, ZIP (Max: 10MB)
                        </p>
                      </label>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                        <div className="space-y-2">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-light p-2 rounded">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-primary rounded flex items-center justify-center text-white text-xs">
                                  {file.name.split(".").pop()?.toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                                  <p className="text-xs">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeFile(index)}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <Button
                        onClick={handleSubmit}
                        className="bg-primary hover:bg-primary-dark"
                        disabled={files.length === 0 || isDueDateOver}
                      >
                        Submit Assignment
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmitPage;