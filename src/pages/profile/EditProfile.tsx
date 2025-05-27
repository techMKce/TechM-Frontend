import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { User, GraduationCap, Briefcase, ArrowLeft, Camera } from "lucide-react";
import StudentNavbar from "@/components/StudentNavbar";
import FacultyNavbar from "@/components/FacultyNavbar";

export default function EditProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [formData, setFormData] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.id) {
      navigate('/');
      return;
    }
    setCurrentUser(user);
    setFormData(user);
  }, [navigate]);

  const handleImageChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profileImage: imageUrl });
      toast.success("Profile picture updated!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to update profile picture.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = () => {
    const storageKey = currentUser.role === 'student' ? 'students' : 'faculty';
    const users = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const updatedUsers = users.map((user: any) => 
      user.id === currentUser.id 
        ? { ...user, ...formData }
        : user
    );

    localStorage.setItem(storageKey, JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, ...formData }));

    toast.success("Profile updated successfully");
    navigate('/profile');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const isStudent = currentUser.role === 'student';
  const NavbarComponent = isStudent ? StudentNavbar : FacultyNavbar;
  const initials = currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  const sidebarItems = isStudent 
    ? [
        { id: 'basic', label: 'Basic Details', icon: User },
        { id: 'education', label: 'Education Details', icon: GraduationCap }
      ]
    : [
        { id: 'basic', label: 'Basic Details', icon: User },
        { id: 'work', label: 'Work Experience', icon: Briefcase }
      ];

    const getInputProps = (fieldName: string) => {
        const nonEditableStudentFields = ['name', 'rollNumber', 'email'];
        const nonEditableFacultyFields = ['name', 'facultyId', 'email', 'department'];
        
        const nonEditableFields = isStudent ? nonEditableStudentFields : nonEditableFacultyFields;
        const isEditable = !nonEditableFields.includes(fieldName);
        
        return {
            readOnly: !isEditable,
            style: {
                backgroundColor: isEditable ? 'white' : '#f5f5f5',
                cursor: isEditable ? 'auto' : 'not-allowed',
                opacity: isEditable ? 1 : 0.7,
            },
        };
    };

  const renderBasicDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Basic Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Image Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24 cursor-pointer" onClick={handleAvatarClick}>
              {formData.profileImage ? (
                <AvatarImage src={formData.profileImage} alt="Profile" className="w-24 h-24" />
              ) : (
                <AvatarFallback className="bg-blue-500 text-white w-24 h-24 text-2xl">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-1 -right-1 rounded-full bg-white shadow-md hover:bg-gray-50 w-8 h-8"
              onClick={handleAvatarClick}
              disabled={isUploading}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Upload</span>
            </Button>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              {...getInputProps('name')}
            />
          </div>

          {isStudent ? (
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber || ""}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                {...getInputProps('rollNumber')}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="facultyId">Faculty ID *</Label>
              <Input
                id="facultyId"
                value={formData.facultyId || ""}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                {...getInputProps('facultyId')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                {...getInputProps('email')}
              />
          </div>

          {isStudent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father Name</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName || ""}
                  onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                  {...getInputProps('fatherName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother Name</Label>
                <Input
                  id="motherName"
                  value={formData.motherName || ""}
                  onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                  {...getInputProps('motherName')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstGraduate">First Graduate</Label>
                <Input
                  id="firstGraduate"
                  value={formData.firstGraduate || ""}
                  onChange={(e) => setFormData({ ...formData, firstGraduate: e.target.value })}
                  {...getInputProps('firstGraduate')}
                />
              </div>
            </>
          )}

          {!isStudent && (
            <>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  {...getInputProps('department')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience || ""}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  {...getInputProps('experience')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  value={formData.designation || ""}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  {...getInputProps('designation')}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
                id="mobile"
                value={formData.mobile || ""}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                {...getInputProps('mobile')}
              />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ""}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              {...getInputProps('dob')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              value={formData.gender || ""}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              {...getInputProps('gender')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Input
              id="bloodGroup"
              value={formData.bloodGroup || ""}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              {...getInputProps('bloodGroup')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aadharNumber">Aadhar Number</Label>
            <Input
              id="aadharNumber"
              value={formData.aadharNumber || ""}
              onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
              {...getInputProps('aadharNumber')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality || ""}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              {...getInputProps('nationality')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderEducationDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* College Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">College Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institution">Institution *</Label>
              <Input
                id="institution"
                value={formData.institution || ""}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                {...getInputProps('institution')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={formData.degree || ""}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                {...getInputProps('degree')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <Input
                id="program"
                value={formData.program || ""}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                {...getInputProps('program')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year *</Label>
              <Input
                id="startYear"
                value={formData.startYear || ""}
                onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                {...getInputProps('startYear')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedGraduation">Expected Graduation Year *</Label>
              <Input
                id="expectedGraduation"
                value={formData.expectedGraduation || ""}
                onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
                {...getInputProps('expectedGraduation')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA or Percentage *</Label>
              <Input
                id="cgpa"
                value={formData.cgpa || ""}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                {...getInputProps('cgpa')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubProfile">Github Profile</Label>
              <Input
                id="githubProfile"
                value={formData.githubProfile || ""}
                onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
                {...getInputProps('githubProfile')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
              <Input
                id="linkedinProfile"
                value={formData.linkedinProfile || ""}
                onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                {...getInputProps('linkedinProfile')}
              />
            </div>
          </div>
        </div>

        {/* 10th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">10th Standard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school10">School Name</Label>
              <Input
                id="school10"
                value={formData.school10 || ""}
                onChange={(e) => setFormData({ ...formData, school10: e.target.value })}
                {...getInputProps('school10')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear10">Start Year</Label>
              <Input
                id="startYear10"
                value={formData.startYear10 || ""}
                onChange={(e) => setFormData({ ...formData, startYear10: e.target.value })}
                {...getInputProps('startYear10')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear10">End Year</Label>
              <Input
                id="endYear10"
                value={formData.endYear10 || ""}
                onChange={(e) => setFormData({ ...formData, endYear10: e.target.value })}
                {...getInputProps('endYear10')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage10">Percentage</Label>
              <Input
                id="percentage10"
                value={formData.percentage10 || ""}
                onChange={(e) => setFormData({ ...formData, percentage10: e.target.value })}
                {...getInputProps('percentage10')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board10">Board of Education</Label>
              <Input
                id="board10"
                value={formData.board10 || ""}
                onChange={(e) => setFormData({ ...formData, board10: e.target.value })}
                {...getInputProps('board10')}
              />
            </div>
          </div>
        </div>

        {/* 12th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">12th Standard / Diploma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school12">School Name</Label>
              <Input
                id="school12"
                value={formData.school12 || ""}
                onChange={(e) => setFormData({ ...formData, school12: e.target.value })}
                {...getInputProps('school12')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear12">Start Year</Label>
              <Input
                id="startYear12"
                value={formData.startYear12 || ""}
                onChange={(e) => setFormData({ ...formData, startYear12: e.target.value })}
                {...getInputProps('startYear12')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear12">End Year</Label>
              <Input
                id="endYear12"
                value={formData.endYear12 || ""}
                onChange={(e) => setFormData({ ...formData, endYear12: e.target.value })}
                {...getInputProps('endYear12')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentage12">Percentage</Label>
              <Input
                id="percentage12"
                value={formData.percentage12 || ""}
                onChange={(e) => setFormData({ ...formData, percentage12: e.target.value })}
                {...getInputProps('percentage12')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="board12">Board of Education</Label>
              <Input
                id="board12"
                value={formData.board12 || ""}
                onChange={(e) => setFormData({ ...formData, board12: e.target.value })}
                {...getInputProps('board12')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkExperience = () => {
    const workExperiences = formData.workExperiences || [{}];

    const addExperience = () => {
      const newExperiences = [...workExperiences, {}];
      setFormData({ ...formData, workExperiences: newExperiences });
    };

    const deleteExperience = (index: number) => {
      const newExperiences = workExperiences.filter((_, i) => i !== index);
      setFormData({ ...formData, workExperiences: newExperiences });
    };

    const updateExperience = (index: number, field: string, value: string) => {
      const newExperiences = [...workExperiences];
      newExperiences[index] = { ...newExperiences[index], [field]: value };
      setFormData({ ...formData, workExperiences: newExperiences });
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Work Experience
            </div>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={addExperience}
              className="flex items-center gap-2"
            >
              <span className="text-lg">+</span>
              Add Experience
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {workExperiences.map((experience: any, index: number) => (
            <div key={index} className="border rounded-lg p-4 space-y-6 relative">
              {workExperiences.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExperience(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <span className="text-lg">×</span>
                </Button>
              )}
              
              <h3 className="text-lg font-semibold">Experience {index + 1}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`organizationName-${index}`}>Organization Name *</Label>
                  <Input
                    id={`organizationName-${index}`}
                    value={experience.organizationName || ""}
                    onChange={(e) => updateExperience(index, 'organizationName', e.target.value)}
                    {...getInputProps('organizationName')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`workStartYear-${index}`}>Start Year *</Label>
                  <Input
                    id={`workStartYear-${index}`}
                    value={experience.workStartYear || ""}
                    onChange={(e) => updateExperience(index, 'workStartYear', e.target.value)}
                    {...getInputProps('workStartYear')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`workEndYear-${index}`}>End Year *</Label>
                  <Input
                    id={`workEndYear-${index}`}
                    value={experience.workEndYear || ""}
                    onChange={(e) => updateExperience(index, 'workEndYear', e.target.value)}
                    {...getInputProps('workEndYear')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`workDescription-${index}`}>Description *</Label>
                <Textarea
                  id={`workDescription-${index}`}
                  value={experience.workDescription || ""}
                  onChange={(e) => updateExperience(index, 'workDescription', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`achievements-${index}`}>Achievements</Label>
                <Textarea
                  id={`achievements-${index}`}
                  value={experience.achievements || ""}
                  onChange={(e) => updateExperience(index, 'achievements', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`researchDetails-${index}`}>Research Details</Label>
                <Textarea
                  id={`researchDetails-${index}`}
                  value={experience.researchDetails || ""}
                  onChange={(e) => updateExperience(index, 'researchDetails', e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'basic':
        return renderBasicDetails();
      case 'education':
        return renderEducationDetails();
      case 'work':
        return renderWorkExperience();
      default:
        return renderBasicDetails();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarComponent currentPage="/profile" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-600">Update your profile information</p>
        </div>

        <div className="flex gap-6">
          {/* Vertical Sidebar */}
          <div className="w-64 bg-white rounded-lg shadow p-4">
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}

            <div className="mt-6 flex justify-end gap-4">
              <Button variant="outline" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}