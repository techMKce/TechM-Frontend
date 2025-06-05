import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import api from '@/service/api';
import LoadingSpinner from "@/components/LoadingSpinner";
import FacultyNavbar from "@/components/FacultyNavbar";

interface Assignment {
  assignmentId: string;
  courseId: string;
  title: string;
  description: string;
  dueDate?: string;
  fileNo?: string;
  fileName?: string;
  resourceLink?: string;
}

const EditAssignmentPage: React.FC = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    courseId: "",
    title: "",
    description: "",
    dueDate: "",
    resourceLink: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      if (!assignmentId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Invalid assignment ID",
        });
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/assignments/id', {
          params: { assignmentId },
        });
        const found: Assignment = response.data.assignment;

        if (found) {
          setAssignment(found);
          setFormData({
            courseId: found.courseId || "",
            title: found.title || "",
            description: found.description || "",
            dueDate: found.dueDate ? new Date(found.dueDate).toISOString().slice(0, 16) : "",
            resourceLink: found.resourceLink || "",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Assignment not found",
          });
        }
      } catch (error: any) {
        console.error("Error fetching assignment:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Failed to fetch assignment",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid assignment ID",
      });
      return;
    }

    setSubmitting(true);
    const form = new FormData();
    form.append("assignmentId", assignmentId);
    form.append("courseId", formData.courseId);
    form.append("title", formData.title);
    form.append("description", formData.description);
    if (formData.dueDate) form.append("dueDate", formData.dueDate);
    if (formData.resourceLink) form.append("resourceLink", formData.resourceLink);
    if (file) form.append("file", file);

    try {
      await api.put('/assignments', form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      // Add 2-second delay before navigating back
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update assignment",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!assignment) {
    return <div className="text-center py-10 text-lg text-gray-600">Assignment not found</div>;
  }

  return (
    <>
      <FacultyNavbar />
      <div className="max-w-4xl mx-auto mt-12 p-6">
        {/* Header Section with Back Button and Heading */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-gray-800 hover:bg-gray-200 p-2 rounded-full"
              title="Go Back"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-3xl font-bold text-gray-800">Edit Assignment</h1>
          </div>
        </div>

        {/* Card Section */}
        <Card className="border border-gray-300 shadow-lg">
          <CardContent className="space-y-8 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="courseId" className="text-lg font-medium text-gray-700">
                  Course ID
                </Label>
                <Input
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  disabled
                  required
                  className="mt-2 text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-lg font-medium text-gray-700">
                  Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-2 text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-lg font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="mt-2 text-base min-h-[150px] border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="text-lg font-medium text-gray-700">
                  Due Date
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="mt-2 text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="resourceLink" className="text-lg font-medium text-gray-700">
                  Resource Link
                </Label>
                <Input
                  id="resourceLink"
                  name="resourceLink"
                  value={formData.resourceLink}
                  onChange={handleInputChange}
                  className="mt-2 text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <div>
                <Label htmlFor="file" className="text-lg font-medium text-gray-700">
                  Replace File (optional)
                </Label>
                {assignment.fileName && (
                  <p className="text-base text-gray-500 mt-2">
                    Current file: {assignment.fileName}
                  </p>
                )}
                <Input
                  id="file"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-2 text-base border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-900 text-lg py-6"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EditAssignmentPage;