import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { FileText, Calendar, Download, Eye, Pencil, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/service/api";

interface StudentSubmission {
  id: number;
  userId: string;
  studentName: string;
  studentRollNumber: string;
  submittedAt: string;
  document: string;
  assignment: {
    id: number;
    title: string;
  };
  status: "accepted" | "rejected";
}

interface Grading {
  grade: string;
  feedback: string | null;
}

const GradeStudentSubmissionPage = () => {
  const { assignmentId, studentRollNumber, submissionId } = useParams<{
    assignmentId: string;
    studentRollNumber: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [gradingData, setGradingData] = useState<Grading | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false); // Track viewer state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null); // Store file URL
  const viewerRef = useRef<HTMLDivElement | null>(null); // Ref for viewer container
  const isGraded = gradingData !== null;
  const [submissionStatus, setSubmissionStatus] = useState<"Accepted" | "Rejected">("Accepted");
  const [isLoading, setIsLoading] = useState(false);
  const {state}=useLocation();
  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId || !assignmentId) {
        toast({title:"Invalid submission or assignment.",variant:'warning'});
        setLoading(false);
        return;
      }


    try {
      setLoading(true);


        const sub = submissionRes.data.submission;
        if (sub) {
          setSubmission({
            id: sub.id,
            userId: sub.userId,
            studentName: sub.studentName,
            studentRollNumber: sub.studentRollNumber,
            submittedAt: sub.submittedAt,
            document: sub.document || "Unknown Document",
            assignment: {
              id: parseInt(assignmentId),
              title: sub.assignmentTitle || "Unknown Assignment",
            },
          });
          setSubmissionStatus(sub.status || "Accepted");
        } else {
          toast({title:"Failed to load submission details.",variant:'destructive'});
        }


      // Fetch current submission
      const currentSubmissionRes = await api.get("/submissions/id", {
        params: { submissionId },
      });
      const sub = currentSubmissionRes.data.submission;
      if (sub) {
        setSubmission({
          id: sub.id,
          userId: sub.userId,
          studentName: sub.studentName,
          studentRollNumber: sub.studentRollNumber,
          submittedAt: sub.submittedAt,
          document: sub.document || "Unknown Document",
          assignment: {
            id: parseInt(assignmentId),
            title: sub.assignmentTitle || "Unknown Assignment",
          },
          status: sub.status?.toLowerCase() || "accepted",
        });
      } else {
        toast.error("Failed to load submission details.");
        navigate(`/faculty/assignments/${assignmentId}/grade`);
        return;
      }


      const gradingRes = await api.get("/gradings/grade", {
        params: { studentRollNumber, assignmentId },
      });
      console.log("Fetched grading data:", gradingRes.data);
      const grading = gradingRes.data?.grading;
      if (grading && grading.grade) {
        setGradingData({
          grade: grading.grade,
          feedback: grading.feedback || "",
        });
        setGrade(grading.grade);
        setFeedback(grading.feedback || "");
        setIsEditing(false); // Graded, start in review mode
        console.log("Submission is graded, switching to review mode");
      } else {
        setGradingData(null);
        setGrade("");
        setFeedback("");
        setIsEditing(true); // Ungraded, start in grading mode
        console.log("Submission is ungraded, switching to grading mode");

      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({title:"Error loading submission or grading data.",variant:'destructive'});
      navigate(`/faculty/assignments/${assignmentId}/grade`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [submissionId, assignmentId, studentRollNumber, navigate]);

  // Cleanup viewer URL on unmount
  useEffect(() => {
    return () => {
      if (viewerUrl) {
        window.URL.revokeObjectURL(viewerUrl);
      }
    };
  }, [viewerUrl]);

  const handleDeleteGrade = async () => {
    if (!submission || !assignmentId || !submissionId) {

      toast({title:"Submission data or assignment ID not available",variant:'info'});

      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the grade for ${submission.studentName}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete("/gradings", {
        data: {
          studentRollNumber: submission.studentRollNumber,
          assignmentId,
        },
      });


          if (response.status >= 200 && response.status < 300) {
            toast({title:"Grade deleted. You can now regrade."});
            setGradingData(null);
            setIsEditing(true);
            setGrade("");
            setFeedback("");
          } else {
            toast({title:response.data.message || "Failed to delete grade",variant:'destructive'});
          }

    } catch (error) {
      toast({title:"Network error: Could not delete grade"});
    }
  };

  const handleSubmitGrade = async () => {
    if (!grade) {
      toast({title:"Please select a grade",variant:'warning'});
      return;
    }

    if (!submission || !assignmentId) {
      toast({title:"Submission or assignment data missing",variant:'warning'});

      return;
    }

    // Align request body with backend expectations
    const requestBody = {
      studentRollNumber: submission.studentRollNumber,
      assignmentId,
      grade,
      feedback,
    };

    try {
      const response = await api.post("/gradings", requestBody);
      console.log("Submit grade response:", response.data);

      if (response.status >= 200 && response.status < 300) {

        toast({title:
          `Grade ${isEditing || isGraded ? "updated" : "submitted"} successfully.`}
        );
        // Re-fetch grading data to confirm the grade was saved
        const gradingRes = await api.get("/gradings/grade", {
          params: { studentRollNumber: submission.studentRollNumber, assignmentId },
        });
        console.log("Post-submit fetched grading data:", gradingRes.data);
        const grading = gradingRes.data?.grading;
        if (grading && grading.grade) {
          setGradingData({
            grade: grading.grade,
            feedback: grading.feedback || "",
          });
          setGrade(grading.grade);
          setFeedback(grading.feedback || "");
          setIsEditing(false); // Switch to review mode
          console.log("Grade confirmed, switched to review mode");
        } else {
          toast.error("Grade submitted but could not confirm. Please refresh.");
          setGradingData({ grade, feedback }); // Fallback to local state
          setIsEditing(false);
        }
      } else {
        toast({title:response.data?.message || "Failed to submit grade"});
      }
    } catch (error) {
      toast({title:"Network error: Could not submit grade",variant:'destructive'});

    }
  };

  const handleCancelEdit = () => {
    if (gradingData) {
      setGrade(gradingData.grade);
      setFeedback(gradingData.feedback || "");
    } else {
      setGrade("");
      setFeedback("");
    }
    setIsEditing(false);
  };

  const handleDownloadDocument = async () => {
    if (!submissionId) {
      toast({title:"Submission ID not available",variant:'warning'});

      return;
    }

    try {
      const response = await api.get("/submissions/download", {
        params: { submissionId },
        responseType: "blob",
      });

      const contentDisposition = response.headers["content-disposition"];
      let filename = submission?.document || "document";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], { type: response.headers["content-type"] || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);


      toast({title:"Document downloaded successfully."});
    } catch (err) {
      toast({title:"Failed to download document.",variant:'destructive'});

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

    if (!submissionId) {
      toast({title:"Submission ID not available",variant:'warning'});

      return;
    }

    try {
      const response = await api.get("/submissions/download", {
        params: { submissionId },
        responseType: "blob",
      });

      const contentType = response.headers["content-type"] || "application/octet-stream";
      let blob;

      if (contentType.includes("text") || contentType.includes("json")) {
        const textResponse = await api.get("/submissions/download", {
          params: { submissionId },
          responseType: "text",
        });
        const textData = textResponse.data;
        if (textData.startsWith("data:") || /^[A-Za-z0-9+/=]+$/.test(textData)) {
          const base64Data = textData.startsWith("data:") ? textData.split(",")[1] : textData;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: contentType.includes("json") ? "application/pdf" : contentType });
        } else {
          throw new Error("Response is text but not base64-encoded");
        }
      } else {
        blob = new Blob([response.data], { type: contentType });
      }

      const fileUrl = window.URL.createObjectURL(blob);
      setViewerUrl(fileUrl);
      setIsViewerOpen(true);

      toast({title:"Document opened for viewing.",variant:'info'});
    } catch (err) {
      toast({title:"Failed to view document. Try downloading instead.",variant:'destructive'});

    }
  };

  const handleRejectSubmission = async () => {
    if (!submission || !assignmentId || !submissionId) {
      toast({title:"Submission data or assignment ID not available",variant:'warning'});
      return;
    }

    try {
      setIsRejecting(true);
      const response = await api.post("/submissions/status", {
        submissionId,
        assignmentId,
        status: "rejected",
      });

      if (response.status >= 200 && response.status < 300) {

        toast({title:"Submission Rejected successfully."});
        setSubmission((prev) => (prev ? { ...prev, status: "rejected" } : null));
      } else {
            toast({title:"Failed to reject submission",variant:'destructive'});

      }
    } catch (error) {
            toast({title:"Network error: Could not reject submission",variant:'destructive'});

    } finally {
      setIsRejecting(false);
            setIsLoading(false);

    }
  };

  const handleNavigateSubmission = (direction: "next" | "previous") => {
    if (!submissionsList.length || !submission) return;

    const currentIndex = submissionsList.findIndex((sub) => sub.id === submission.id);
    if (currentIndex === -1) return;

    let newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0 || newIndex >= submissionsList.length) return;

    const newSubmission = submissionsList[newIndex];
    navigate(
      `/faculty/assignments/${assignmentId}/grade/${newSubmission.studentRollNumber}/${newSubmission.id}`
    );
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="page-container max-w-7xl mx-auto py-6 px-4">Loading submission details...</div>;
  }

  if (!submission) {
    return (
      <div className="page-container max-w-7xl mx-auto py-6 px-4">
        <p>Error: Submission not found.</p>
        <Link to={`/faculty/assignments/${assignmentId}/grade`} className="text-blue-600 hover:text-blue-800">
          ← Back to All Submissions
        </Link>
      </div>
    );
  }

  const isGraded = !!gradingData;
  const currentIndex = submissionsList.findIndex((sub) => sub.id === submission.id);
  const isFirstSubmission = currentIndex === 0;
  const isLastSubmission = currentIndex === submissionsList.length - 1;

  return (
    <>
      <Navbar />
      <div className="page-container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to={`/faculty/assignments/${assignmentId}/grade`}
            className="text-base text-blue-600 hover:text-blue-800"
          >
            ← Back to All Submissions
          </Link>
          <h1 className="text-3xl font-bold mt-4">Grade Submission</h1>
          {isGraded && !isEditing && (
            <p className="text-sm text-yellow-600 mt-2">
              This submission has been graded. You can edit or delete the grade.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>

                  <p className="text-sm text-black">Name</p>
                  <p className="font-medium">{submission.studentName}</p>

                </div>
                <div>
                  <p className="text-sm text-gray-600">Roll Number</p>
                  <p className="font-medium text-base">{submission.studentRollNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted On</p>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1 text-gray-600" />
                    <p className="font-medium text-base">{formatDate(submission.submittedAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Submitted Document</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-20 bg-blue-500 rounded flex items-center justify-center text-white text-xs">
                        DOCUMENT
                      </div>
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
                <div>
                  <p className="text-sm text-gray-600">Submission Status</p>
                  <div
                    className={`mt-2 p-2 rounded-md inline-flex items-center ${
                      submission.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full mr-2 ${
                        submission.status === "accepted" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    <p className="font-medium text-base capitalize">{submission.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {isViewerOpen && viewerUrl && (
              <Card className="shadow-md mb-6">
                <CardHeader>
                  <CardTitle className="text-lg">Document Viewer</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div ref={viewerRef} style={{ width: "100%", maxHeight: "80vh", overflow: "auto" }}>
                    <iframe
                      src={viewerUrl}
                      style={{ width: "100%", height: "500px", border: "none" }}
                      title="Document Viewer"
                    />
                  </div>
                  <Button
                    onClick={handleViewDocument}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="shadow-md">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-lg">Grading</CardTitle>
                {isGraded && !isEditing && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                  >
                    <Pencil size={14} />
                    Edit Grade
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                {(isEditing || !isGraded) ? (
                  <>
                    {!isGraded && submission.status !== "rejected" && (
                      <Button
                        onClick={handleRejectSubmission}
                        className="w-auto px-4 mb-4 bg-red-600 hover:bg-red-700"
                        disabled={isRejecting}
                      >
                        {isRejecting ? "Rejecting..." : "Reject Submission"}
                      </Button>
                    )}
                    <div>
                      <h3 className="font-medium text-base mb-3">Select Grade</h3>
                      <RadioGroup
                        value={grade}
                        onValueChange={setGrade}
                        className="grid grid-cols-3 gap-2"
                      >
                        {[
                          { value: "O", label: "Outstanding" },
                          { value: "A+", label: "Excellent" },
                          { value: "A", label: "Very Good" },
                          { value: "B+", label: "Good" },
                          { value: "B", label: "Above Average" },
                          { value: "C", label: "Average" },
                        ].map(({ value, label }) => (
                          <div key={value}>
                            <RadioGroupItem value={value} id={value} className="peer sr-only" />
                            <Label
                              htmlFor={value}
                              className="flex flex-col items-center justify-between rounded-md border-2 border-gray-300 bg-white p-3 hover:bg-gray-100 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50 peer-data-[state=checked]:text-blue-700 transition-colors cursor-pointer text-sm font-medium text-center"
                            >
                              {value}
                              <span className="text-xs text-gray-600">{label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-base">Feedback</h3>
                        <span className="text-xs text-gray-600">{feedback.length}/500 characters</span>
                      </div>
                      <Textarea
                        placeholder="Provide feedback on the student's work..."
                        className="min-h-32 text-base"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={500}
                        disabled={submission.status === "rejected"}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitGrade}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-2"
                        disabled={submission.status === "rejected"}
                      >
                        <Save size={16} />
                        {isEditing && isGraded ? "Update Grade" : "Submit Grade"}
                      </Button>
                      {isEditing && isGraded && (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1"
                          >
                            <X size={16} />
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDeleteGrade}
                            className="w-auto px-4 bg-red-600 hover:bg-red-700 flex items-center gap-2"
                          >
                            Delete Grade
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-base">Submitted Grade</h3>
                      <p className="text-lg font-bold text-blue-600">{gradingData.grade}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-base">Faculty Feedback</h3>
                      <p className="whitespace-pre-wrap text-base">
                        {gradingData.feedback || "No feedback provided."}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex justify-between mt-6">
                  <Button
                    onClick={() => handleNavigateSubmission("previous")}
                    disabled={isFirstSubmission || loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => handleNavigateSubmission("next")}
                    disabled={isLastSubmission || loading}
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeStudentSubmissionPage;