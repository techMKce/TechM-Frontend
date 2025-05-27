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
import * as XLSX from 'xlsx';

interface Faculty {
  id: string;
  facultyId: string;
  name: string;
  email: string;
  department: string;
  password: string;
}

const FacultyPage = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState({
    facultyId: "",
    name: "",
    email: "",
    department: ""
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load faculty from localStorage on component mount
  useEffect(() => {
    const savedFaculty = JSON.parse(localStorage.getItem('faculty') || '[]');
    setFaculties(savedFaculty);
  }, []);

  // Save to localStorage and dispatch event when faculty change
  const updateFacultyStorage = (updatedFaculty: Faculty[]) => {
    localStorage.setItem('faculty', JSON.stringify(updatedFaculty));
    window.dispatchEvent(new CustomEvent('facultyUpdated'));
  };

  const handleSubmit = () => {
    if (!formData.facultyId || !formData.name || !formData.email || !formData.department) {
      toast.error("Please fill all fields");
      return;
    }

    const newFaculty: Faculty = {
      id: Date.now().toString(),
      ...formData,
      password: "faculty"
    };

    const updatedFaculty = [...faculties, newFaculty];
    setFaculties(updatedFaculty);
    updateFacultyStorage(updatedFaculty);
    setFormData({ facultyId: "", name: "", email: "", department: "" });
    setIsAddDialogOpen(false);
    toast.success("Faculty added successfully");
  };

  const handleEdit = () => {
    if (!selectedFaculty) return;

    const updatedFaculty = faculties.map(faculty => 
      faculty.id === selectedFaculty.id 
        ? { ...selectedFaculty, ...formData }
        : faculty
    );
    setFaculties(updatedFaculty);
    updateFacultyStorage(updatedFaculty);
    setIsEditDialogOpen(false);
    setSelectedFaculty(null);
    setFormData({ facultyId: "", name: "", email: "", department: "" });
    toast.success("Faculty updated successfully");
  };

  const handleDelete = (facultyId: string) => {
    const updatedFaculty = faculties.filter(faculty => faculty.id !== facultyId);
    setFaculties(updatedFaculty);
    updateFacultyStorage(updatedFaculty);
    toast.success("Faculty deleted successfully");
  };

  const handleView = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsViewDialogOpen(true);
  };

  const handleEditClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setFormData({
      facultyId: faculty.facultyId,
      name: faculty.name,
      email: faculty.email,
      department: faculty.department,
    });
    setIsEditDialogOpen(true);
  };

  const togglePasswordVisibility = (facultyId: string) => {
    setShowPassword(prev => ({ ...prev, [facultyId]: !prev[facultyId] }));
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

      // Get the first worksheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to array of arrays
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        toast.error("Excel file is empty");
        return;
      }

      const headers = jsonData[0].map((h: any) => String(h).trim().toLowerCase());
      const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell !== undefined && cell !== ''));

      processFileData(headers, dataRows);
    };
    reader.readAsArrayBuffer(file);
    resetFileInput();
  };

  const processFileData = (headers: string[], data: any[][]) => {
    // Expected headers: facultyid, name, email, department, mobile
    const requiredHeaders = ['facultyid', 'name', 'email', 'department'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
      return;
    }

    const newFaculties: Faculty[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      if (row.length !== headers.length) {
        toast.error(`Row ${i + 2} has incorrect number of columns`);
        return;
      }

      const facultyData: any = {};
      headers.forEach((header, index) => {
        facultyData[header] = row[index];
      });

      if (!facultyData.facultyid || !facultyData.name || !facultyData.email || !facultyData.department) {
        toast.error(`Row ${i + 1} has missing required data`);
        return;
      }

      newFaculties.push({
        id: Date.now().toString() + i,
        facultyId: facultyData.facultyid,
        name: facultyData.name,
        email: facultyData.email,
        department: facultyData.department,
        password: "faculty"
      });
    }

    if (newFaculties.length > 0) {
      const updatedFaculty = [...faculties, ...newFaculties];
      setFaculties(updatedFaculty);
      updateFacultyStorage(updatedFaculty);
      toast.success(`Successfully added ${newFaculties.length} faculty members`);
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
                  <Label htmlFor="facultyId" className="text-right">Faculty ID</Label>
                  <Input
                    id="facultyId"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
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
                <Button onClick={handleSubmit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload CSV/Excel File
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
                  <TableHead>Faculty ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculties.map((faculty) => (
                  <TableRow key={faculty.id}>
                    <TableCell>{faculty.facultyId}</TableCell>
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
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(faculty.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
                <div><strong>Faculty ID:</strong> {selectedFaculty.facultyId}</div>
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
                <Label htmlFor="edit-facultyId" className="text-right">Faculty ID</Label>
                <Input
                  id="edit-facultyId"
                  value={formData.facultyId}
                  onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
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
              <Button onClick={handleEdit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default FacultyPage;