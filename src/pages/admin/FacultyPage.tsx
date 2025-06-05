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

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
}

const FacultyPage = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    department: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFaculties();
  }, []);

  const getFaculties = async () => {
    try {
      setIsFetching(true);
      const res = await api.get('/auth/faculty/all');

      const facultyData = res.data?.faculties ?? res.data;

      if (!Array.isArray(facultyData)) {
        throw new Error("Invalid data format received from API");
      }

      setFaculties(facultyData);
    } catch (error: any) {
      toast.error("Failed to fetch faculty data");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.id || !formData.name || !formData.email || !formData.department) {
      toast.warning("Please fill all fields");
      return;
    }

    const alreadyExists = faculties.some(
      (f) => f.id === formData.id || f.email === formData.email
    );
    if (alreadyExists) {
      toast.warning("Faculty with the same ID or Email already exists");
      return;
    }

    try {
      setIsAdding(true);
      await api.post('/auth/signup', formData, {
        params: { for: "FACULTY" }
      });


      await getFaculties();
      setFormData({ id: "", name: "", email: "", department: "" });
      setIsAddDialogOpen(false);
      toast.success("Faculty added successfully");
    } catch (error) {
      // console.error(error);
      toast.error("Failed to add faculty");
    } finally {
      setIsAdding(false);
    }

  };

  const handleEdit = async () => {
    try {
      if (!selectedFaculty) return;
      setIsEditing(true);

      await api.put(`/auth/update/${selectedFaculty.id}`, formData);
      toast.success("Faculty updated successfully");

      await getFaculties();
      setSelectedFaculty(null);
      setFormData({ id: "", name: "", email: "", department: "" });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast.error("Error updating faculty");
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await api.delete(`/auth/delete/${id}`);
      toast.success("Faculty deleted successfully");
      await getFaculties();
    } catch (error) {
      toast.error("Failed to delete faculty");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setFormData({
      id: faculty.id,
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
    });
    setIsEditDialogOpen(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!isCSV && !isExcel) {
      toast.warning("Please select a valid CSV or Excel (.xlsx) file");
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

  const bulkSignupFaculty = async (facultiesToSignup: Faculty[]) => {
    try {
      const signupPromises = facultiesToSignup.map(faculty => {
        const payload = {
          id: faculty.id,
          name: faculty.name,
          email: faculty.email,
          department: faculty.department,
        };
        return api.post('/auth/signup', payload, {
          params: { for: 'FACULTY' },
        });
      });

      const results = await Promise.allSettled(signupPromises);
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          toast.error(`Faculty ${facultiesToSignup[index].email} failed:`, result.reason);
        }
      });

      const successCount = results.filter(result => result.status === "fulfilled").length;
      const failureCount = results.length - successCount;

      if (failureCount > 0) {

        toast.warning("Upload failed because you are trying to upload the existing data");

      } else {
        toast.success("All faculty signed up successfully.");
      }
    } catch (error) {
      toast.error("Bulk signup failed.");

      // console.error("Bulk signup error:", error);
    } finally {
      setIsUploading(false);

    }
  };

  const processFileData = async (headers: string[], data: any[][]) => {
    const requiredHeaders = ['id', 'name', 'email', 'department'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
      setIsUploading(false);
      return;
    }

    const newFaculties: Faculty[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      if (row.length !== headers.length) {
        toast.error(`Row ${i + 2} has incorrect number of columns`);
        setIsUploading(false);
        return;
      }

      const facultyData: any = {};
      headers.forEach((header, index) => {
        facultyData[header] = row[index];
      });

      if (!facultyData.id || !facultyData.name || !facultyData.email || !facultyData.department) {
        toast.error(`Row ${i + 1} has missing required data`);
        setIsUploading(false);
        return;
      }

      newFaculties.push({
        id: facultyData.id,
        name: facultyData.name,
        email: facultyData.email,
        department: facultyData.department,
      });
    }

    if (newFaculties.length > 0) {
      await bulkSignupFaculty(newFaculties);
      await getFaculties();
    }
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/faculty" />


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
            <h1 className="text-3xl font-bold text-gray-900">Faculty Management</h1>
            <p className="text-gray-600">Manage faculty records and information</p>
          </div>

          <div className="flex gap-4 mb-6">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Faculty
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Faculty</DialogTitle>
                  <DialogDescription>Enter faculty details to add them to the system.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">Faculty ID</Label>
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
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmit} disabled={isAdding} className="flex items-center justify-center gap-2">
                    {isAdding ? (
                      <>
                        <Oval height={20} width={20} color="#ffffff" visible={true} />
                        Adding...
                      </>
                    ) : (
                      "Add Faculty"
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
              <CardTitle>Faculty List</CardTitle>
              <CardDescription>All registered faculty members in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Faculty ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {faculties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No faculty members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    faculties.map((faculty, index) => (
                      <TableRow key={faculty.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{faculty.id}</TableCell>
                        <TableCell>{faculty.name}</TableCell>
                        <TableCell>{faculty.email}</TableCell>
                        <TableCell>{faculty.department}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(faculty)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(faculty)}>
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
                                    Are you sure you want to delete this faculty member? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(faculty.id)}
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
                <DialogTitle>Faculty Details</DialogTitle>
              </DialogHeader>
              {selectedFaculty && (
                <div className="grid gap-4 py-4">
                  <div><strong>Faculty ID:</strong> {selectedFaculty.id}</div>
                  <div><strong>Name:</strong> {selectedFaculty.name}</div>
                  <div><strong>Email:</strong> {selectedFaculty.email}</div>
                  <div><strong>Department:</strong> {selectedFaculty.department}</div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Faculty</DialogTitle>
                <DialogDescription>Update faculty information.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-id" className="text-right">Faculty ID</Label>
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

export default FacultyPage;