import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileText, Calendar, Download, Eye } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import axios from "axios";
import api from '../../../service/api';
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
}

interface Grading {
  grade: string;
  feedback: string;
}

const GradeStudentSubmissionPage = () => {
  const { assignmentId, submissionId } = useParams<{
    assignmentId: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const [facultyName] = useState("Dr. Jane Smith");
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [gradingData, setGradingData] = useState<Grading | null>(null);
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
        toast.error("Invalid submission or assignment.");
        setLoading(false);
        return;
      }

      try {
        const submissionRes = await api("/submissions/id", {
          params: { submissionId },
        });

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
          toast.error("Failed to load submission details.");
        }

        const gradingRes = await api("/gradings", {
          params: { submissionId, assignmentId },
        });

        const grading = gradingRes.data?.grading;
        if (grading) {
          setGradingData({ grade: grading.grade, feedback: grading.feedback });
          setGrade(grading.grade);
          setFeedback(grading.feedback);
          setIsEditing(false);
          // Set submission status if it exists in the grading data
          if (grading.status) {
            setSubmissionStatus(grading.status);
          }
        }
      } catch (err) {
        toast.error("Error loading submission or grading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId, assignmentId]);

  useEffect(() => {
    // Cleanup viewer URL on component unmount
    return () => {
      if (viewerUrl) {
        window.URL.revokeObjectURL(viewerUrl);
      }
    };
  }, [viewerUrl]);

  const handleDeleteGrade = async () => {
    if (!submission || !assignmentId || !submissionId) {
      toast.info("Submission data or assignment ID not available");
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
            toast.success("Grade deleted. You can now regrade.");
            setGradingData(null);
            setIsEditing(true);
            setGrade("");
            setFeedback("");
          } else {
            toast.error(response.data.message || "Failed to delete grade");
          }
    } catch (error) {
      toast.error("Network error: Could not delete grade");
    }
  };

  const handleSubmitGrade = async () => {
    if (!grade) {
      toast.warning("Please select a grade");
      return;
    }

    if (!submission || !assignmentId) {
      toast.warning("Submission or assignment data missing");
      return;
    }

    const requestBody = {
      submissionId,
      assignmentId,
      grade,
      feedback,
      studentRollNumber: submission.studentRollNumber,
    };

    try {
      const response = await api.post("/gradings", requestBody);

      if (response.status >= 200 && response.status < 300) {
        toast.success(
          `Grade ${isEditing || isGraded ? "updated" : "submitted"} successfully.`
        );
        setGradingData({ grade, feedback });
        setIsEditing(false);
        navigate(`/faculty/assignments/${assignmentId}/grade`);
      } else {
        toast.error(response.data?.message || "Failed to submit grade");
      }
    } catch (error) {
      toast.error("Network error: Could not submit grade");
    }
  };

  const handleDownloadDocument = async () => {
    if (!submissionId) {
      toast.warning("Submission ID not available");
      return;
    }

    try {
      const response = await api("/submissions/download", {
        params: { submissionId },
        responseType: "blob",
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = "document";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.info("Document downloaded successfully.");
    } catch (err) {
      toast.error("Failed to download document.");
    }
  };

  const handleViewDocument = async () => {
    if (isViewerOpen) {
      // Close the viewer
      setIsViewerOpen(false);
      if (viewerUrl) {
        window.URL.revokeObjectURL(viewerUrl);
        setViewerUrl(null);
      }
      return;
    }

    if (!submissionId) {
      toast.warning("Submission ID not available");
      return;
    }

    try {
      const response = await api("/submissions/download", {
        params: { submissionId },
        responseType: "blob",
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let blob;

      // Check if the response is text (possible base64)
      if (contentType.includes('text') || contentType.includes('json')) {
        const textResponse = await api("/submissions/download", {
          params: { submissionId },
          responseType: "text",
        });

        const textData = textResponse.data;
        if (textData.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(textData)) {
          const base64Data = textData.startsWith('data:') 
            ? textData.split(',')[1] 
            : textData;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: contentType.includes('json') ? 'application/pdf' : contentType });
        } else {
          throw new Error("Response is text but not base64-encoded");
        }
      } else {
        blob = new Blob([response.data], { type: contentType });
      }

      // Create a temporary URL for the Blob
      const fileUrl = window.URL.createObjectURL(blob);
      setViewerUrl(fileUrl);
      setIsViewerOpen(true);
      toast.info("Document opened for viewing.");
    } catch (err) {
      toast.error("Failed to view document. Try downloading instead.");
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Only handle rejection, as submissions are accepted by default
  const handleStatusChange = async () => {
    if (!submission || !assignmentId || !submissionId) {
      toast.error("Submission data or assignment ID not available");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/submissions/status", {
        submissionId,
        assignmentId,
        status: "Rejected",
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Submission Rejected successfully.");
        setSubmissionStatus("Rejected");
        navigate(-1);

      } else {
        toast.error("Failed to reject submission");
      }
    } catch (error) {
      toast.error("Network error: Could not reject submission");
    }finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="page-container max-w-4xl mx-auto">Loading submission details...</div>;
  }

  if (!submission) {
    return (
      <div className="page-container max-w-4xl mx-auto">
        <p>Error: Submission not found.</p>
        <Link to={`/faculty/assignments/${assignmentId}/grade`} state={{course:state}} className="text-accent hover:text-accent-dark">
          ← Back to All Submissions
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-container max-w-4xl mx-auto max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/faculty/assignments/${assignmentId}/grade`} className=" hover:text-accent-dark">
            ← Back to All Submissions
          </Link>
          <h1 className="text-3xl font-bold mt-4">Grade Submission</h1>
          
          {isGraded && !isEditing && (
            <p className="text-sm text-yellow-600 mt-2">
              This submission has already been graded. You can view the grade or delete it to regrade.
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
                  <p className="text-sm  ">Name</p>
                  <p className="font-medium">{submission.studentName}</p>
                </div>
                <div>
                  <p className="text-sm  ">Roll Number</p>
                  <p className="font-medium">{submission.studentRollNumber}</p>
                </div>
                <div>
                  <p className="text-sm  ">Submitted On</p>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1  " />
                    <p className="font-medium">{formatDate(submission.submittedAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm  ">Submitted Document</p>
                  <div className="mt-2 p-3 bg-light rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-20 bg-primary rounded flex items-center justify-center text-white text-xs">
                      DOCUMENT
                      </div>
                      {/* <p className="ml-2 font-medium truncate max-w-[120px]">{submission.document}</p> */}
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

                {/* Add submission status indicator */}
                <div>
                  <p className="text-sm">Submission Status</p>
                  <div className={`mt-2 p-2 rounded-md inline-flex items-center ${
                    submissionStatus === "Accepted" ? "bg-green-100 text-green-800" :
                    submissionStatus === "Rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    <div className={`h-2 w-2 rounded-full mr-2 ${
                      submissionStatus === "Accepted" ? "bg-green-500" :
                      submissionStatus === "Rejected" ? "bg-red-500" :
                      "bg-yellow-500"
                    }`}></div>
                    <p className="font-medium capitalize">{submissionStatus}</p>
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
              <CardHeader>
                <CardTitle className="text-lg">Grading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <Button
                    onClick={() => handleStatusChange()}
                    className={`flex-1 ${
                      submissionStatus === "Rejected" 
                        ? "bg-red-700 hover:bg-red-800" 
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                    disabled={submissionStatus === "Rejected" || isLoading}
                  >
                    {isLoading
                      ? "Rejecting..."
                      : submissionStatus === "Rejected"
                        ? "Rejected ✗"
                        : "Reject Submission"}
                  </Button>

                {isGraded && !isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Submitted Grade</h3>
                      <p className="text-lg font-bold text-accent">{gradingData?.grade}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Faculty Feedback</h3>
                      <p className="whitespace-pre-wrap">{gradingData?.feedback}</p>
                    </div>
                    <Button
                      onClick={handleDeleteGrade}
                      className="w-full bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                      Delete Grade and Regrade
                    </Button>
                  </div>
                ) : (
                  <>

                    <div>
                      <h3 className="font-medium mb-3">Select Grade</h3>
                      <RadioGroup value={grade} onValueChange={setGrade} className="grid grid-cols-3 gap-2">
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
                              className="flex flex-col items-center justify-between rounded-md border-2 border-black bg-white p-3 hover:bg-light hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-accent-foreground transition-colors cursor-pointer text-center text-sm font-medium"
                            >
                              {value}
                              <span className="text-xs  ">{label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Feedback</h3>
                        <span className="text-xs  ">{feedback.length}/500 characters</span>
                      </div>
                      <Textarea
                        placeholder="Provide feedback on the student's work..."
                        className="min-h-32"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={500}
                      />
                    </div>

                    <Button
                      onClick={handleSubmitGrade}
                      className="w-full bg-primary hover:bg-primary-dark flex items-center gap-2"
                      disabled={submissionStatus === "Rejected"}
                    >
                      <FileText size={16} />
                      {isEditing || isGraded ? "Update Grade" : "Submit Grade"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradeStudentSubmissionPage;