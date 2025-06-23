import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
        toast({ title: "assignment ID Not Found", variant: "warning" });
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
          toast({ title: "Assignment not found", variant: "warning" });
        }
      } catch (error: any) {
        toast({ title: "Failed to fetch assignment", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

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
      toast({ title: "Assignment ID Not Found", variant: "warning" });
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
      toast({ title: "Assignment updated successfully", variant: "default" });
      navigate(-1);
    } catch (error: any) {
      toast({ title: "Failed to update assignment", variant: "destructive" });
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
    return <div className="text-center py-10">Assignment not found</div>;
  }

  return (
    <>
      <FacultyNavbar />
      <div className="max-w-3xl mx-auto mt-10 p-4">
        <Card>
          <CardContent className="space-y-6 pt-6">
            <h2 className="text-xl font-semibold">Edit Assignment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="courseId">Course ID</Label>
                <Input
                  id="courseId"
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleInputChange}
                  disabled
                  required
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="resourceLink">Resource Link</Label>
                <Input
                  id="resourceLink"
                  name="resourceLink"
                  value={formData.resourceLink}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="file">Replace File (optional)</Label>
                {assignment.fileName && (
                  <p className="text-sm text-gray-500 mt-1">
                    Current file: {assignment.fileName}
                  </p>
                )}
                <Input
                  id="file"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-900"
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