// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";

// const API_BASE = "https://assignmentservice-2a8o.onrender.com/api";

// const EditAssignmentPage = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   const [assignment, setAssignment] = useState<any>(null);
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [deadline, setDeadline] = useState("");
//   const [file, setFile] = useState<File | null>(null);

//   useEffect(() => {
//     const fetchAssignment = async () => {
//       try {
//         const res = await axios.get(`${API_BASE}/assignments`, {
//           params: { id },
//         });
//         const found = res.data.assignment;

//         if (found) {
//           setAssignment(found);
//           setTitle(found.title);
//           setDescription(found.description);
//           setDeadline(found.deadline?.slice(0, 16)); // Format: YYYY-MM-DDTHH:mm
//         }
//       } catch (error) {
//         console.error("Error fetching assignment:", error);
//       }
//     };

//     fetchAssignment();
//   }, [id]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const formData = new FormData();
//     formData.append("assignmentId", id || "");
//     formData.append("title", title);
//     formData.append("description", description);
//     formData.append("deadline", deadline);

//     if (file) {
//       formData.append("file", file);
//     }

//     try {
//       await axios.put(`${API_BASE}/assignments`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       alert("Assignment updated successfully");
//       navigate(-1); // Go back
//     } catch (error) {
//       console.error("Error updating assignment:", error);
//       alert("Failed to update assignment");
//     }
//   };

//   if (!assignment) return <div>Loading...</div>;

//   return (
//     <div className="max-w-3xl mx-auto mt-10 p-4">
//       <Card>
//         <CardContent className="space-y-6 pt-6">
//           <h2 className="text-xl font-semibold">Edit Assignment</h2>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <Label htmlFor="title">Title</Label>
//               <Input
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="deadline">Deadline</Label>
//               <Input
//                 id="deadline"
//                 type="datetime-local"
//                 value={deadline}
//                 onChange={(e) => setDeadline(e.target.value)}
//                 required
//               />
//             </div>
//             <div>
//               <Label htmlFor="file">Replace File (optional)</Label>
//               <Input
//                 id="file"
//                 type="file"
//                 onChange={(e) => {
//                   if (e.target.files?.length) setFile(e.target.files[0]);
//                 }}
//               />
//             </div>
//             <Button type="submit" className="w-full">
//               Save Changes
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default EditAssignmentPage;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import api from '../../../service/api'
const API_BASE = "https://assignmentservice-2a8o.onrender.com/api/assignments";

interface Assignment {
  assignmentiId: string;
  title: string;
  description: string;
  dueDate: string;
  fileUrl?: string;
}

const EditAssignmentPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setdueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await api(`/id`, {
          params: { assignmentId },
        });
        const found: Assignment = res.data.assignment;

        if (found) {
          setAssignment(found);
          setTitle(found.title);
          setDescription(found.description);
      
          
          // Format deadline to datetime-local (YYYY-MM-DDTHH:MM)
          if (found.dueDate) {
            const date = new Date(found.dueDate);
            const formatted = date.toISOString().slice(0, 16);
            setdueDate(formatted);
          }
        }
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };

    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("assignmentId", assignmentId || "");
    formData.append("title", title);
    formData.append("description", description);
    formData.append("dueDate", dueDate);

    if (file) {
      formData.append("file", file);
    }

    try {
      await axios.put(`${API_BASE}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Assignment updated successfully");
      navigate(-1); 
    } catch (error) {
      console.error("Error updating assignment:", error);
      alert("Failed to update assignment");
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardContent className="space-y-6 pt-6">
          <h2 className="text-xl font-semibold">Edit Assignment</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">DueDate</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setdueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="file">Replace File (optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  if (e.target.files?.length) setFile(e.target.files[0]);
                }}
              />
            </div>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAssignmentPage;
