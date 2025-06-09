import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AdminNavbar from "@/components/AdminNavbar";
import { Upload, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const facultiesPerPage = 15;

  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    department: ""
  });

  const [emailError, setEmailError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getFaculties();
  }, []);

  // Reset form when add dialog opens
  useEffect(() => {
    if (isAddDialogOpen) {
      setFormData({
        id: "",
        name: "",
        email: "",
        department: ""
      });
      setEmailError("");
    }
  }, [isAddDialogOpen]);

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
      toast({ title: "Failed to fetch faculty data", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    if (!formData.id || !formData.name || !formData.email || !formData.department) {
      toast({ title: "Please fill all fields", variant: "warning" });
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    const alreadyExists = faculties.some(
      (f) => f.id === formData.id || f.email === formData.email
    );
    if (alreadyExists) {
      toast({ title: "Faculty with the same ID or Email already exists", variant: "warning" });
      return;
    }

    try {
      setIsAdding(true);
      await api.post('/auth/signup', formData, {
        params: { for: "FACULTY" }
      });

      await getFaculties();
      setIsAddDialogOpen(false);
      toast({ title: "Faculty added successfully", variant: "default" });
    } catch (error) {
      toast({ title: "Failed to add faculty", variant: "destructive" });

    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async () => {
    try {
      if (!selectedFaculty) return;
      setIsEditing(true);
      
      if (!validateEmail(formData.email)) {
        setEmailError("Please enter a valid email address");
        return;
      }

     await api.put(`/auth/update/${selectedFaculty.id}`, {
        name: formData.name,
        email: formData.email,
        department: formData.department
      });
      toast({ title: "Faculty updated successfully", variant: "default" });


      await getFaculties();
      setSelectedFaculty(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({ title: "Error updating faculty", variant: "destructive" });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      await api.delete(`/auth/delete/${id}`);
      toast({ title: "Faculty deleted successfully", variant: "default" });
      await getFaculties();
      // Reset to first page if current page becomes empty
      if (faculties.length % facultiesPerPage === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      toast({ title: "Failed to delete faculty", variant: "destructive" });
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
    setEmailError("");
    setIsEditDialogOpen(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    if (email && !validateEmail(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    if (!isCSV && !isExcel) {
      toast({ title: "Please select a valid CSV or Excel (.xlsx) file", variant: "warning" });
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

        toast({ title: "Excel file is empty", variant: "destructive" });

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
          toast({ title: `Faculty ${facultiesToSignup[index].email} failed: ${result.reason}`, variant: "destructive" });
        }
      });

      const successCount = results.filter(result => result.status === "fulfilled").length;
      const failureCount = results.length - successCount;

      if (failureCount > 0) {

        toast({ title: "Upload failed because you are trying to upload the existing data", variant: "warning" });
      } else {
        toast({ title: "All faculty signed up successfully.", variant: "default" });
      }
    } catch (error) {

      toast({ title: "Bulk signup failed.", variant: "destructive" });

    } finally {
      setIsUploading(false);
    }
  };

  const processFileData = async (headers: string[], data: any[][]) => {
    const requiredHeaders = ['id', 'name', 'email', 'department'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast({ title: `Missing required columns: ${missingHeaders.join(', ')}`, variant: "destructive" });
      setIsUploading(false);
      return;
    }

    const newFaculties: Faculty[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      if (row.length !== headers.length) {
        toast({ title: `Row ${i + 2} has incorrect number of columns`, variant: "destructive" });
        setIsUploading(false);
        return;
      }

      const facultyData: any = {};
      headers.forEach((header, index) => {
        facultyData[header] = row[index];
      });

      if (!facultyData.id || !facultyData.name || !facultyData.email || !facultyData.department) {
        toast({ title: `Row ${i + 1} has missing required data`, variant: "warning" });
        setIsUploading(false);
        return;
      }

      if (!validateEmail(facultyData.email)) {
        toast.error(`Row ${i + 1} has invalid email address`);
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

  // Pagination logic
  const indexOfLastFaculty = currentPage * facultiesPerPage;
  const indexOfFirstFaculty = indexOfLastFaculty - facultiesPerPage;
  const currentFaculties = faculties.slice(indexOfFirstFaculty, indexOfLastFaculty);
  const totalPages = Math.ceil(faculties.length / facultiesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
                      onChange={handleEmailChange}
                      className="col-span-3"
                    />
                    {emailError && (
                      <p className="col-span-3 col-start-2 text-sm text-red-500">{emailError}</p>
                    )}
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
                  {currentFaculties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No faculty members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentFaculties.map((faculty, index) => (
                      <TableRow key={faculty.id}>
                        <TableCell>{indexOfFirstFaculty + index + 1}</TableCell>
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

              {/* Pagination */}
              {faculties.length > facultiesPerPage && (
                <div className="flex items-center justify-end space-x-2 py-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <Button
                        key={number}
                        variant={currentPage === number ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(number)}
                      >
                        {number}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
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
                    readOnly
                    className="col-span-3 bg-gray-100"
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
                    onChange={handleEmailChange}
                    className="col-span-3"
                  />
                  {emailError && (
                    <p className="col-span-3 col-start-2 text-sm text-red-500">{emailError}</p>
                  )}
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
