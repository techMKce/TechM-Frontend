// import { useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Navbar from "@/components/FacultyNavbar";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Calendar, Upload, Link as LinkIcon, AlertCircle } from "lucide-react";
// import { toast } from "@/components/ui/sonner";
// import api from "@/service/api";
// import "react-datepicker/dist/react-datepicker.css";
// import { useAuth } from "@/hooks/useAuth";

// const CreateAssignmentPage = () => {
//   const {profile} = useAuth();
//   const location = useLocation();
//   const { course_id, courseTitle } = location.state || {};
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: "",
//     courseId: course_id || "",
//     courseTitle: courseTitle || "",
//     dueTimestamp: null as Date | null,
//     description: "",
//     resourceLink: "",
//   });
//   const [files, setFiles] = useState<File[]>([]);
//   const [facultyName] = profile.profile.name;

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const fileArray = Array.from(e.target.files);
//       setFiles((prev) => [...prev, ...fileArray]);
//     }
//   };

//   const removeFile = (index: number) => {
//     setFiles((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.title || !formData.courseId || !formData.dueTimestamp || !formData.description || files.length === 0) {
//       toast.error("Please fill all required fields and upload at least one file.");
//       return;
//     }

//     const formattedDueDate = formData.dueTimestamp
//   ? new Date(formData.dueTimestamp).toLocaleString("sv-SE").replace(" ", "T")
//   : "";


//     try {
//       const formPayload = new FormData();
//       formPayload.append("title", formData.title);
//       formPayload.append("courseId", formData.courseId);
//       formPayload.append("courseName", formData.courseTitle);
//       formPayload.append("courseFaculty", profile.profile.name);
//       formPayload.append("dueDate", formattedDueDate);
//       formPayload.append("description", formData.description);
//       formPayload.append("resourceLink", formData.resourceLink);

//       files.forEach((file) => {
//         formPayload.append("file", file);
//       });

//       const response = await api.post("/assignments", formPayload, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       if (response.status >= 200 && response.status < 300) {
//         toast.success("Assignment created successfully!");
//         navigate(-1);
//       } else {
//         throw new Error("Unexpected response status: " + response.status);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("Something went wrong while creating the assignment.");
//     }
//   };

//   return (
//     <>
//       <Navbar />
//       <div className="page-container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto">
//           <h1 className="text-3xl font-bold mb-2">Create New Assignment</h1>
//           <p className="mb-6">Add a new assignment for your students</p>

//           <Card className="shadow-md">
//             <CardHeader>
//               <CardTitle>Assignment Details</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">
//                     Assignment Title <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="title"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleChange}
//                     placeholder="e.g., Final Project Submission"
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="courseId">
//                     Course ID <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="courseId"
//                     name="courseId"
//                     value={formData.courseId}
//                     disabled
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="dueTimestamp">
//                     Due Date & Time <span className="text-red-500">*</span>
//                   </Label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <DatePicker
//                       selected={formData.dueTimestamp}
//                       onChange={(date: Date | null) =>
//                         setFormData((prev) => ({ ...prev, dueTimestamp: date }))
//                       }
//                       showTimeSelect
//                       timeFormat="HH:mm"
//                       timeIntervals={15}
//                       dateFormat="yyyy-MM-dd HH:mm"
//                       placeholderText="Select due date and time"
//                       className="pl-10 py-2 px-3 border border-gray-300 rounded-md w-full"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="description">
//                     Assignment Description <span className="text-red-500">*</span>
//                   </Label>
//                   <Textarea
//                     id="description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     placeholder="Provide detailed instructions for the assignment..."
//                     rows={6}
//                     required
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <Label>File Uploads <span className="text-red-500">*</span></Label>
//                   <div className="border-2 border-dashed border-secondary/30 rounded-md p-6 text-center">
//                     <Input
//                       id="files"
//                       type="file"
//                       multiple
//                       className="hidden"
//                       onChange={handleFileChange}
//                     />
//                     <label
//                       htmlFor="files"
//                       className="flex flex-col items-center justify-center cursor-pointer"
//                     >
//                       <Upload className="h-12 w-12 mb-2" />
//                       <p className="text-sm mb-1">Drag & drop files here or click to browse</p>
//                       <p className="text-xs">Supports: PDF, DOC, DOCX, PPT, PPTX, ZIP (Max: 10MB)</p>
//                     </label>
//                   </div>

//                   {files.length > 0 && (
//                     <div className="mt-4">
//                       <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
//                       <div className="space-y-2">
//                         {files.map((file, index) => (
//                           <div
//                             key={index}
//                             className="flex items-center justify-between bg-light p-2 rounded"
//                           >
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-8 w-8 bg-primary rounded flex items-center justify-center text-white text-xs">
//                                 {file.name.split(".").pop()?.toUpperCase()}
//                               </div>
//                               <div className="ml-3">
//                                 <p className="text-sm font-medium truncate max-w-[200px]">
//                                   {file.name}
//                                 </p>
//                                 <p className="text-xs text-secondary">
//                                   {(file.size / 1024).toFixed(1)} KB
//                                 </p>
//                               </div>
//                             </div>
//                             <Button
//                               type="button"
//                               variant="ghost"
//                               size="sm"
//                               className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                               onClick={() => removeFile(index)}
//                             >
//                               Remove
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}

//                   {files.length === 0 && (
//                     <div className="flex items-center text-amber-600 mt-2">
//                       <AlertCircle className="h-4 w-4 mr-1" />
//                       <span className="text-xs">At least one file upload is required</span>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="resourceLink">Resource Link (Optional)</Label>
//                   <div className="relative">
//                     <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       id="resourceLink"
//                       name="resourceLink"
//                       value={formData.resourceLink}
//                       onChange={handleChange}
//                       className="pl-10"
//                       placeholder="e.g., https://example.com/resource"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex justify-end space-x-4 pt-4">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => navigate("/faculty/assignments")}
//                   >
//                     Cancel
//                   </Button>
//                   <Button type="submit" className="bg-primary hover:bg-primary-dark">
//                     Create Assignment
//                   </Button>
//                 </div>
//               </form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CreateAssignmentPage;
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "@/components/FacultyNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Upload, Link as LinkIcon, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import api from "@/service/api";
import { useAuth } from "@/hooks/useAuth";

const CreateAssignmentPage = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const { course_id, courseTitle } = location.state || {};
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    courseId: course_id || "",
    courseTitle: courseTitle || "",
    dueTimestamp: null as Date | null,
    description: "",
    resourceLink: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false); // State to track drag status
  const [facultyName] = profile.profile.name;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); // Reset drag state

    const droppedFiles = Array.from(e.dataTransfer.files);
    // Optional: Filter files by type or size
    const validFiles = droppedFiles.filter((file) =>
      ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip"].includes(file.type) &&
      file.size <= 10 * 1024 * 1024 // 10MB limit
    );

    if (validFiles.length < droppedFiles.length) {
      toast.error("Some files were rejected. Only PDF, DOC, DOCX, PPT, PPTX, ZIP files up to 10MB are allowed.");
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); // Set drag state to true
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false); // Reset drag state
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.courseId || !formData.dueTimestamp || !formData.description || files.length === 0) {
      toast.error("Please fill all required fields and upload at least one file.");
      return;
    }

    const formattedDueDate = formData.dueTimestamp
      ? new Date(formData.dueTimestamp).toLocaleString("sv-SE").replace(" ", "T")
      : "";

    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("courseId", formData.courseId);
      formPayload.append("courseName", formData.courseTitle);
      formPayload.append("courseFaculty", profile.profile.name);
      formPayload.append("dueDate", formattedDueDate);
      formPayload.append("description", formData.description);
      formPayload.append("resourceLink", formData.resourceLink);

      files.forEach((file) => {
        formPayload.append("file", file);
      });

      const response = await api.post("/assignments", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success("Assignment created successfully!");
        navigate(-1);
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong while creating the assignment.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="page-container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Create New Assignment</h1>
          <p className="mb-6">Add a new assignment for your students</p>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Assignment Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Final Project Submission"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="courseId">
                    Course ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="courseId"
                    name="courseId"
                    value={formData.courseId}
                    disabled
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueTimestamp">
                    Due Date & Time <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <DatePicker
                      selected={formData.dueTimestamp}
                      onChange={(date: Date | null) =>
                        setFormData((prev) => ({ ...prev, dueTimestamp: date }))
                      }
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="yyyy-MM-dd HH:mm"
                      placeholderText="Select due date and time"
                      className="pl-10 py-2 px-3 border border-gray-300 rounded-md w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Assignment Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed instructions for the assignment..."
                    rows={6}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>File Uploads <span className="text-red-500">*</span></Label>
                  <div
                    className={`border-2 border-dashed border-secondary/30 rounded-md p-6 text-center transition-colors ${
                      isDragging ? "bg-primary/10 border-primary" : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Input
                      id="files"
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                    />
                    <label
                      htmlFor="files"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <Upload className="h-12 w-12 mb-2" />
                      <p className="text-sm mb-1">
                        {isDragging ? "Drop files here" : "Drag & drop files here or click to browse"}
                      </p>
                      <p className="text-xs">Supports: PDF, DOC, DOCX, PPT, PPTX, ZIP (Max: 10MB)</p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Uploaded Files:</h4>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-light p-2 rounded"
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary rounded flex items-center justify-center text-white text-xs">
                                {file.name.split(".").pop()?.toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium truncate max-w-[200px]">
                                  {file.name}
                                </p>
                                <p className="text-xs text-secondary">
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
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {files.length === 0 && (
                    <div className="flex items-center text-amber-600 mt-2">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span className="text-xs">At least one file upload is required</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resourceLink">Resource Link (Optional)</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resourceLink"
                      name="resourceLink"
                      value={formData.resourceLink}
                      onChange={handleChange}
                      className="pl-10"
                      placeholder="e.g., https://example.com/resource"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/faculty/assignments")}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary hover:bg-primary-dark">
                    Create Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default CreateAssignmentPage;