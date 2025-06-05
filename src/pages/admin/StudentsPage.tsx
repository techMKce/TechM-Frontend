import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminNavbar from "@/components/AdminNavbar";
import { Upload, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Oval } from 'react-loader-spinner';
import * as XLSX from 'xlsx';
import api from "@/service/api";

interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
  year: string;
  semester: string;
}

const StudentsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    department: "",
    year: "",
    semester: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsFetching(true);
      const response = await api.get('/auth/students/all');
      setStudents(response.data);
    } catch (error) {
      // console.error("Failed to fetch students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.id || !formData.name || !formData.email || !formData.department || !formData.year || !formData.semester) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsAdding(true);
      await api.post('/auth/signup', formData, {
        params: { for: "STUDENT" }
      });

      await fetchStudents();
      setFormData({ id: "", name: "", email: "", department: "", year: "", semester: "" });
      setIsAddDialogOpen(false);
      toast.success("Student added successfully");
    } catch (error) {
      // console.error(error);
      toast.error("Failed to add student");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedStudent) return;
      setIsEditing(true);

      await api.put(`/auth/update/${selectedStudent.id}`, formData);
      toast.success("Student updated successfully");

      await fetchStudents();
      setSelectedStudent(null);
      setFormData({ id: "", name: "", email: "", department: "", year: "", semester: "" });
      setIsEditDialogOpen(false);
    } catch (error) {
      // console.error("Error updating Student:", error);
      toast.error("Error updating Student");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await api.delete(`/auth/delete/${id}`);
      toast.success("Student deleted successfully");
      await fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (student: Student) => {
    setSelectedStudent(student);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      id: student.id,
      name: student.name,
      email: student.email,
      department: student.department,
      year: student.year,
      semester: student.semester
    });
    setIsEditDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!isCSV && !isExcel) {
      toast.error("Please select a valid CSV or Excel (.xlsx) file");
      return;
    }

    setIsUploading(true);
    if (isCSV) {
      handleCSVFile(file);
    } else if (isExcel) {
      handleExcelFile(file);
    }
  };

  const handleCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const data: any[][] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        data.push(line.split(',').map(v => v.trim()));
      }

      processFileData(headers, data);
    };
    reader.readAsText(file);
    resetFileInput();
  };

  const handleExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        toast.error("Excel file is empty");
        setIsUploading(false);
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

      processFileData(headers, dataRows);
    };
    reader.readAsArrayBuffer(file);
    resetFileInput();
  };

  const processFileData = async (headers: string[], data: any[][]) => {
    const requiredHeaders = ['id', 'name', 'email', 'department', 'year', 'semester'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
      setIsUploading(false);
      return;
    }

    const newStudents: Student[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      if (row.length !== headers.length) {
        toast.error(`Row ${i + 2} has incorrect number of columns`);
        setIsUploading(false);
        return;
      }

      const studentData: any = {};
      headers.forEach((header, index) => {
        studentData[header] = String(row[index] || '').trim();
      });

      if (!studentData.id || !studentData.name || !studentData.email || !studentData.department || !studentData.year || !studentData.semester) {
        toast.error(`Row ${i + 2} has missing required data`);
        setIsUploading(false);
        return;
      }

      try {
        await api.post('/auth/signup', {
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          department: studentData.department,
          year: studentData.year,
          semester: studentData.semester
        }, {
          params: { for: "STUDENT" }
        });

        newStudents.push({
          id: studentData.id,
          name: studentData.name,
          email: studentData.email,
          department: studentData.department,
          year: studentData.year,
          semester: studentData.semester
        });
      } catch (error) {
        // console.error("Failed to register student because trying to register the existing data");
        toast.error(`Upload failed because you are trying to upload the existing data`);
      }
    }

    if (newStudents.length > 0) {
      setStudents(prev => [...prev, ...newStudents]);
      toast.success(`Successfully added ${newStudents.length} students`);
    }
    setIsUploading(false);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/students" />

      {/* Full page loader for initial fetch */}
      {isFetching && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
          <Oval height={80} width={80} color="#4F46E5" />
        </div>
      )}

      {/* Main content */}
      {!isFetching && (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
            <p className="text-gray-600">Manage student records and information</p>
          </div>

          <div className="flex gap-4 mb-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>Enter student details to add them to the system.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">Roll Number</Label>
                    <Input
                      id="id"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="department" className="text-right">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="year" className="text-right">Batch</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="semester" className="text-right">Semester</Label>
                    <Input
                      id="semester"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} disabled={isAdding} className="flex items-center justify-center gap-2">
                    {isAdding ? (
                      <>
                        <Oval height={20} width={20} color="#ffffff" visible={true} />
                        Adding...
                      </>
                    ) : (
                      "Add Student"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Oval height={16} width={16} color="#4F46E5" visible={true} />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload CSV/Excel File
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Students List</CardTitle>
              <CardDescription>All registered students in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, index) => (
                      <TableRow key={student.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.year}</TableCell>
                        <TableCell>{student.semester}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(student)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(student)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirm Delete</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this student? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(student.id)}
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? (
                                      <>
                                        <Oval height={20} width={20} color="#ffffff" visible={true} />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete"
                                    )}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* View Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Student Details</DialogTitle>
              </DialogHeader>
              {selectedStudent && (
                <div className="grid gap-4 py-4">
                  <div><strong>Roll Number:</strong> {selectedStudent.id}</div>
                  <div><strong>Name:</strong> {selectedStudent.name}</div>
                  <div><strong>Email:</strong> {selectedStudent.email}</div>
                  <div><strong>Department:</strong> {selectedStudent.department}</div>
                  <div><strong>Batch:</strong> {selectedStudent.year}</div>
                  <div><strong>Semester:</strong> {selectedStudent.semester}</div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogDescription>Update student information.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-id" className="text-right">Roll Number</Label>
                  <Input
                    id="edit-id"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-department" className="text-right">Department</Label>
                  <Input
                    id="edit-department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-year" className="text-right">Batch</Label>
                  <Input
                    id="edit-year"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-semester" className="text-right">Semester</Label>
                  <Input
                    id="edit-semester"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleEdit} disabled={isEditing} className="flex items-center justify-center gap-2">
                  {isEditing ? (
                    <>
                      <Oval height={20} width={20} color="#ffffff" visible={true} />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default StudentsPage;