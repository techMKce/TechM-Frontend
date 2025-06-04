import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/StudentNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Calendar,
  Upload,
  ArrowLeft,
  X,
  Check,
  Download,
  Eye,
} from "lucide-react";

import api from "../../service/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Assignment {
  title: string;
  dueDate: string;
  courseName: string;
  courseId: string;
  description: string;
  fileNo?: string;
  fileName?: string;
}

interface SubmittedFile {
  name: string;
  size: number; // Size in KB
}

const AssignmentSubmitPage = () => {
  const { profile } = useAuth();
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const [studentName] = useState(profile.profile.name);
  const [studentRollNumber] = useState(profile.profile.id);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [submittedFiles, setSubmittedFiles] = useState<SubmittedFile[]>([]);
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewable, setIsPreviewable] = useState(false);

  const checkSubmissionStatusAndGrading = async () => {
    try {
      const response = await api.get("/gradings", {
        params: { assignmentId },
      });

      const submissions = response.data.submissions || [];
      const gradings = response.data.gradings || [];

      const userSubmission = submissions.find(
        (sub: any) => sub.studentRollNumber === profile.profile.id
      );
      const userGrading = gradings.find(
        (g: any) => g.studentRollNumber === profile.profile.id
      );

      setIsSubmitted(userSubmission != null);
      setRejected(userSubmission?.status === "Rejected");
      if (userSubmission) {
        setSubmittedAt(userSubmission.submittedAt);
        setSubmittedFiles([
          {
            name: userSubmission.fileName || "Unknown",
            size: userSubmission.fileSize ? userSubmission.fileSize / 1024 : 0,
          },
        ]);
      }
      if (userGrading) {
        setIsGraded(true);
        setGrade(userGrading.grade);
        setFeedback(userGrading.feedback);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.response?.data?.message ||
          "Failed to check submission and grading status",
      });
      console.error("Submission/grading error:", err);
    }
  };

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await api.get("/assignments/id", {
          params: { assignmentId },
        });

        setAssignment(response.data.assignment);
        setError(null);
        const dueDate = new Date(response.data.assignment.dueDate);
        const currentDate = new Date();
        setIsDueDateOver(currentDate > dueDate);
      } catch (err: any) {

        setError(
          err?.response?.data?.message || "Failed to fetch assignment details."
        );
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error fetching assignment",
        });
        console.error("Fetch assignment error:", err);

      } finally {
        setLoading(false);
      }
    };


    if (assignmentId) {
      fetchAssignment();
      checkSubmissionStatusAndGrading();
    }
  }, [assignmentId, profile]);

  const handleSubmit = async () => {
    if (isDueDateOver) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot submit: Due date has passed.",
      });
      return;
    }

    if (files.length === 0) {

      toast({
        variant: "destructive",
        title: "Error",
        description: "Please upload a file",
      });

      return;
    }

    if (files[0].size > 15 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size exceeds 15MB limit.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("assignmentId", assignmentId!);
    formData.append("studentName", studentName);
    formData.append(
      "studentRollNumber",
      profile?.profile?.id || studentRollNumber
    );
    formData.append("file", files[0]);
    formData.append("studentDepartment", profile.profile?.department || "");
    formData.append("studentSemester", profile.profile?.year || "");
    if (profile.profile?.email) {
      formData.append("studentEmail", profile.profile.email);
    }

    try {
      const response = await api.post("/submissions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({
        title: "Success",
        description: "Assignment submitted successfully",
      });
      setIsSubmitted(true);
      setSubmittedAt(
        response.data.submission?.submittedAt || new Date().toISOString()
      );
      setSubmittedFiles([{ name: files[0].name, size: files[0].size / 1024 }]);
      setFiles([]);
      setRejected(false); // Reset rejected state
      await checkSubmissionStatusAndGrading(); // Refresh submission status
    } catch (err: any) {

      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to submit assignment",
      });

    }
  };

  const handlePreviewDocument = async () => {
    if (!assignmentId || !assignment?.fileName) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No file available for preview",
      });
      return;
    }

    const fileExtension = assignment.fileName.split(".").pop()?.toLowerCase();
    const isPdf = fileExtension === "pdf";
    setIsPreviewable(isPdf);

    try {
      const response = await api.get("/assignments/download", {
        params: { assignmentId },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (err: any) {
      console.error("Preview error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.response?.data?.message || "Failed to load preview",
      });

    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isDueDateOver && e.target.files[0]) {
      setFiles([e.target.files[0]]);
    }
  };

  const removeFile = () => {
    if (!isDueDateOver) {
      setFiles([]);
    }
  };

  const handleUnsubmit = async () => {
    if (isDueDateOver) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot unsubmit: Due date has passed.",
      });
      return;
    }

    toast({
      title: "Confirm Unsubmit",
      description: "Are you sure you want to unsubmit this assignment?",
      action: (
        <Button
          onClick={async () => {
            try {
              await api.delete("/submissions", {
                data: {
                  assignmentId,
                  studentRollNumber: profile?.profile?.id || studentRollNumber,
                },
              });
              setIsSubmitted(false);
              setFiles([]);
              setSubmittedFiles([]);
              setSubmittedAt(null);
              setIsGraded(false);
              setGrade(null);
              setFeedback(null);
              toast({
                title: "Success",
                description: "Assignment unsubmitted successfully",
              });
              await checkSubmissionStatusAndGrading(); // Refresh status
            } catch (err: any) {
              toast({
                variant: "destructive",
                title: "Error",
                description:
                  err?.response?.data?.message ||
                  "Failed to unsubmit assignment",
              });
              console.error("Unsubmit error:", err);
            }
          }}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Unsubmit
        </Button>
      ),
      duration: 10000, // 10 seconds for confirmation
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!isDueDateOver && e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles([e.dataTransfer.files[0]]);
      e.dataTransfer.clearData();
    }
  };

  const handleDownloadDocument = async () => {
    if (!assignmentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Assignment ID not available",
      });
      return;
    }

    try {
      const response = await api.get("/assignments/download", {
        params: { assignmentId },
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        assignment?.fileName || `assignment_${assignmentId}`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Document downloaded successfully",
      });
    } catch (err: any) {
      console.error("Download error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to download document",
      });

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
      timeZone: "Asia/Kolkata",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-gray-600">Loading assignment...</p>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">
          {error || "Assignment not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="flex items-center justify-between mb-6">
            <Link
              to={`/student/courses/${assignment.courseId}`}
              className="flex items-center text-primary hover:text-primary-dark text-lg font-semibold transition-all duration-200"
            >
              <ArrowLeft size={24} className="mr-2" />
              Back to Course
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Assignment Details */}
            <Card className="shadow-xl w-full lg:w-1/2 bg-white rounded-lg">
              <CardHeader className="p-8 text-center">
                <CardTitle className="text-3xl font-bold text-primary">
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 bg-gray-00 rounded-b-lg space-y-6">
                <div>
                  <span className="text-lg font-semibold text-gray-600">
                    Assignment Title:{" "}
                  </span>
                  <span className="text-lg text-black">{assignment.title}</span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-600">
                    Course Title:{" "}
                  </span>
                  <span className="text-lg text-black">
                    {assignment.courseName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-gray-600">
                    Due Date:{" "}
                  </span>
                  <Calendar size={20} className="ml-2 mr-1 text-gray-600" />
                  <span className="text-lg text-black">
                    {formatDate(assignment.dueDate)}
                  </span>
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-600">
                    Description:{" "}
                  </span>
                  <div className="bg-gray-50 p-3 rounded-md mt-1">
                    <p className="text-lg text-gray-800 font-medium">
                      {assignment.description}
                    </p>
                  </div>
                </div>
                {assignment.fileName && (
                  <div>
                    <p className="text-lg font-semibold text-gray-600">
                      Faculty Uploaded File:
                    </p>
                    <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-8 w-20 bg-primary rounded flex items-center justify-center text-white text-xs">
                          {assignment.fileName
                            .split(".")
                            .pop()
                            ?.toUpperCase() || "FILE"}
                        </div>
                        <p className="ml-2 text-lg font-medium truncate max-w-[200px] text-gray-800">
                          {assignment.fileName}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={handlePreviewDocument}
                          className="flex items-center space-x-1 text-base text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye size={20} />
                          <span>Preview</span>
                        </Button>
                        <Button
                          onClick={handleDownloadDocument}
                          className="flex items-center space-x-1 text-base text-white"
                        >
                          <Download size={20} />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Your Work / Your Submission */}
            <Card className="shadow-xl w-full lg:w-1/2 bg-white rounded-lg">
              <CardHeader className="p-8 text-center">
                <CardTitle className="text-3xl font-bold text-primary">
                  {isSubmitted ? "Your Submission" : "Submit Your Work"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {isSubmitted && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-6 shadow-sm animate-pulse-once">
                    <div className="flex items-center mb-2">
                      <div className="bg-green-200 rounded-full p-1">
                        <Check size={28} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-green-800 ml-2">
                        Assignment Submitted
                      </h3>
                    </div>
                    <p className="text-lg text-green-700">
                      Your assignment was successfully submitted.
                    </p>
                    {submittedAt && (
                      <p className="text-base text-green-600 mt-2">
                        Submitted on: {formatDate(submittedAt)}
                      </p>
                    )}
                    {submittedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-base font-bold text-green-700">
                          Submitted File:
                        </p>
                        <div className="space-y-1 mt-1">
                          {submittedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center text-base text-gray-600"
                            >
                              <span className="truncate max-w-[200px]">
                                {file.name}
                              </span>
                              <span className="ml-2">
                                ({file.size.toFixed(1)} KB)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {isGraded && (
                      <>
                        <p className="text-base text-blue-600 font-bold mt-2">
                          Grade: {grade || "N/A"}
                        </p>
                        {feedback && (
                          <p className="text-base text-blue-600 mt-1 max-h-32 overflow-y-auto">
                            <span className="font-bold">Feedback:</span>{" "}
                            {feedback}
                          </p>
                        )}
                      </>
                    )}
                    {rejected && (
                      <p className="text-base text-yellow-700 font-bold mt-2">
                        Your submission was rejected. Please resubmit your
                        assignment.
                      </p>
                    )}
                  </div>
                )}

                {isSubmitted ? (
                  rejected ? (
                    <>
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragActive(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          setDragActive(false);
                        }}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 shadow-sm hover:shadow-md ${
                          dragActive
                            ? "border-primary bg-blue-100"
                            : "bg-gray-50"
                        }`}
                      >
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isDueDateOver}
                        />
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center cursor-pointer"
                        >
                          <Upload size={32} className="text-gray-500 mb-2" />
                          <p className="text-base font-medium text-gray-700">
                            Drag & drop a file or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Supports: PDF, DOC, DOCX, ZIP (Max: 15MB)
                          </p>
                        </label>
                      </div>

                      {files.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-base font-medium text-gray-700 mb-2">
                            Selected File:
                          </h4>
                          <div className="bg-gray-50 p-2 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white text-xs">
                                  {files[0].name
                                    .split(".")
                                    .pop()
                                    ?.toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="text-base font-medium text-green-600 truncate max-w-[200px]">
                                    {files[0].name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {(files[0].size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                                onClick={() => removeFile()}
                              >
                                <X size={20} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Updated to remove Unsubmit button */}
                      <div className="mt-6">
                        <Button
                          onClick={handleSubmit}
                          className="w-full bg-primary hover:bg-primary-dark rounded-lg hover:scale-105 transition-all duration-200"
                          disabled={files.length === 0 || isDueDateOver}
                        >
                          Resubmit Assignment
                        </Button>
                      </div>
                    </>
                  ) : isDueDateOver ? (
                    <p className="text-base text-red-600 font-bold">
                      Due Date Over: No further actions available
                    </p>
                  ) : grade === null ? (
                    <Button
                      onClick={handleUnsubmit}
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50 rounded-lg hover:scale-105 transition-all duration-200"
                    >
                      Unsubmit
                    </Button>
                  ) : (
                    <p className="text-base text-blue-600 font-bold">
                      Graded: No further actions available
                    </p>
                  )
                ) : isDueDateOver ? (
                  <div className="space-y-6">
                    <div className="bg-red-100 border border-red-300 rounded-lg p-6 shadow-sm flex items-start">
                      <X size={24} className="text-red-600 mr-3 mt-1" />
                      <div>
                        <h3 className="text-xl font-bold text-red-800">
                          Due Date Over
                        </h3>
                        <p className="text-base text-red-700">
                          The due date for this assignment has passed.
                          Submissions are no longer accepted.
                        </p>
                      </div>
                    </div>
                    <Button
                      disabled
                      className="w-full bg-gray-400 cursor-not-allowed rounded-lg"
                    >
                      Due Date Over
                    </Button>
                  </div>
                ) : (
                  <>
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                      }}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 shadow-sm hover:shadow-md ${
                        dragActive ? "border-primary bg-blue-100" : "bg-gray-50"
                      }`}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isDueDateOver}
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center cursor-pointer"
                      >
                        <Upload size={32} className="text-gray-500 mb-2" />
                        <p className="text-base font-medium text-gray-700">
                          Drag & drop a file or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Supports: PDF, DOC, DOCX, ZIP (Max: 15MB)
                        </p>
                      </label>
                    </div>

                    {files.length > 0 ? (
                      <div className="mt-4">
                        <h4 className="text-base font-medium text-gray-700 mb-2">
                          Selected File:
                        </h4>
                        <div className="bg-gray-50 p-2 rounded-lg shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-primary rounded flex items-center justify-center text-white text-xs">
                                {files[0].name.split(".").pop()?.toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-base font-medium text-green-600 truncate max-w-[200px]">
                                  {files[0].name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {(files[0].size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
                              onClick={() => removeFile()}
                            >
                              <X size={20} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-base text-gray-500 mt-4 text-center">
                        No file selected. Upload a file to submit.
                      </p>
                    )}

                    <div className="mt-6">
                      <Button
                        onClick={handleSubmit}
                        className="w-full bg-primary hover:bg-primary-dark rounded-lg hover:scale-105 transition-all duration-200"
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

      {/* Added Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Preview: {assignment?.fileName || "File"}
              </h3>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsPreviewOpen(false);
                  setPreviewUrl(null);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <X size={24} />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {isPreviewable && previewUrl ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title="File Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <p className="text-lg text-gray-600">
                    Preview not available for this file type. Please download to
                    view.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentSubmitPage;
