
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { FileText, Calendar, Download, Eye, Pencil, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
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
}

interface Grading {
  grade: string;
  feedback: string;
}

const ReviewStudentSubmissionPage = () => {
  const { assignmentId, studentRollNumber, submissionId } = useParams<{
    assignmentId: string;
    studentRollNumber: string;
    submissionId: string;
  }>();
  const navigate = useNavigate();
  const [facultyName] = useState("Dr. Jane Smith"); // Replace with AuthContext if available
  const [submission, setSubmission] = useState<StudentSubmission | null>(null);
  const [gradingData, setGradingData] = useState<Grading | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isViewerOpen, setIsViewerOpen] = useState(false); // Track viewer state
  const [viewerUrl, setViewerUrl] = useState<string | null>(null); // Store file URL
  const viewerRef = useRef<HTMLDivElement | null>(null); // Ref for viewer container
  const {state}=useLocation();
  useEffect(() => {
    
    const fetchData = async () => {
      if (!submissionId || !assignmentId || !studentRollNumber) {
        toast({title:"Invalid submission, assignment, or student ID.",variant:'destructive'});
        navigate(`/faculty/assignments/${assignmentId || "unknown"}/grade`,{state:state});
        setLoading(false);
        return;
      }

      try {
        // Fetch submission details
        const submissionRes = await api.get("/submissions/id", {
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
        } else {
          toast({title:"Failed to load submission details.",variant:'destructive'});
          navigate(`/faculty/assignments/${assignmentId}/grade`,{state:state});
          return;
        }

        // Fetch gradings for the assignment
        const gradingRes = await api.get("/gradings", {
          params: { assignmentId },
        });

        const gradings = Array.isArray(gradingRes.data.gradings) ? gradingRes.data.gradings : [];
        // Find grading matching studentRollNumber
        const grading = gradings.find((g: any) => g.studentRollNumber === studentRollNumber);
        if (grading) {
          setGradingData({ grade: grading.grade, feedback: grading.feedback });
          setGrade(grading.grade);
          setFeedback(grading.feedback);
        } else {
          toast({title:"No grading data found for this submission.",variant:'info'});
          navigate(`/faculty/assignments/${assignmentId}/grade`,{state:state});
        }
      } catch (err) {
        toast({title:"Error loading submission or grading data.",variant:'destructive'});
        navigate(`/faculty/assignments/${assignmentId}/grade`,{state:state});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId, assignmentId, studentRollNumber]);

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

      if (response.status === 200) {
        toast({title:"Grade deleted. You can now edit and resubmit."});
        setGradingData(null);
        setIsEditing(true);
        setGrade("");
        setFeedback("");
      } else {
        toast({title:response.data.message || "Failed to delete grade",variant:'destructive'});
      }
    } catch (error) {
      toast({title:"Network error: Could not delete grade",variant:'destructive'});
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

    const requestBody = {
      studentRollNumber: submission.studentRollNumber,
      assignmentId,
      grade,
      feedback,
    };

    try {
      const response = await api.post("/gradings", requestBody);

      if (response.status === 200) {
        toast({title:"Grade updated successfully."});
        setGradingData({ grade, feedback });
        setIsEditing(false);
        navigate(`/faculty/assignments/${assignmentId}/grade`,{state:state});
      } else {
        toast({title:response.data.message || "Failed to submit grade",variant:'destructive'});
      }
    } catch (error) {
      toast({title:"Network error: Could not submit grade",variant:'destructive'});
    }
  };

  const handleCancelEdit = () => {
    if (gradingData) {
      setGrade(gradingData.grade);
      setFeedback(gradingData.feedback);
    }
    setIsEditing(false);
  };

  const handleDownloadDocument = async () => {
    if (!submissionId) {
      toast({title:"Submission ID not available",variant:'warning'});
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = `http://localhost:8080/api/v1/submissions/download?submissionId=${submissionId}`;
      link.setAttribute("download", submission?.document || "document.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({title:"Document downloaded successfully."});
    } catch (err) {
      toast({title:"Failed to download document.",variant:'destructive'});
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
      toast({title:"Submission ID not available",variant:'warning'});
      return;
    }

    try {
      const response = await api.get("/submissions/download", {
        params: { submissionId },
        responseType: "blob",
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';
      let blob;

      // Check if the response is text (possible base64)
      if (contentType.includes('text') || contentType.includes('json')) {
        const textResponse = await api.get("/submissions/download", {
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
      toast({title:"Document opened for viewing.",variant:'info'});
    } catch (err) {
      toast({title:"Failed to view document. Try downloading instead.",variant:'destructive'});
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

  if (loading) {
    return <div className="page-container max-w-4xl mx-auto">Loading submission details...</div>;
  }

  if (!submission) {
    return null; // RouteGuard in App.tsx handles redirect
  }
  console.log(state);
  return (
    <>
      <Navbar />
      <div className="page-container max-w-4xl mx-auto max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/faculty/assignments/${assignmentId}/grade`} state={{...state}} className="text-black hover:text-grey">
            ← Back to All Submissions
          </Link>

          <h1 className="text-3xl font-bold mt-4">View Graded Submission</h1>
          {/* <h2 className="text-xl text-secondary mt-1">{submission.assignment.title}</h2> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm ">Name</p>
                  <p className="font-medium">{submission.studentName}</p>
                </div>
                <div>
                  <p className="text-sm ">Roll Number</p>
                  <p className="font-medium">{submission.studentRollNumber}</p>
                </div>
                <div>
                  <p className="text-sm ">Submitted On</p>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    <p className="font-medium">{formatDate(submission.submittedAt)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm">Submitted Document</p>
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
                {!isEditing && gradingData && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1"
                  >
                    <Pencil size={14} />
                    Edit
                  </Button>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {isEditing || !gradingData ? (
                  <>
                    <div>
                      <h3 className="font-medium mb-3">Select Grade</h3>
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
                          <div style={{cursor:'pointer'}} key={value}>
                            <RadioGroupItem value={value} id={value} className="peer sr-only"/>
                            <Label
                              htmlFor={value}
                              className="button flex flex-col items-center justify-between rounded-md border-2 border-black bg-white p-3 hover:bg-danger hover:text-accent-foreground peer-data-[state=checked]:border-accent peer-data-[state=checked]:border-accent/10"
                            >
                              {value}
                              <span className="text-xs ">{label}</span>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Feedback</h3>
                        <span className="text-xs text-secondary">{feedback.length}/500 characters</span>
                      </div>
                      <Textarea
                        placeholder="Provide feedback on the student's work..."
                        className="min-h-32"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        maxLength={500}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitGrade}
                        className="bg-primary hover:bg-primary-dark flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex items-center gap-1"
                      >
                        <X size={16} />
                        Cancel
                      </Button>
                      {isEditing && gradingData && (
                        <Button
                          onClick={handleDeleteGrade}
                          className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                        >
                          Delete Grade
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Submitted Grade</h3>
                      <p className="text-lg font-bold ">{gradingData.grade}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Faculty Feedback</h3>
                      <p className="whitespace-pre-wrap ">{gradingData.feedback}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReviewStudentSubmissionPage;