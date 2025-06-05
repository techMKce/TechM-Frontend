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
import { useAuth } from "@/hooks/useAuth";
import profileApi from "@/service/api";

export default function EditProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('basic');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isStudent = profile?.profile.role === 'STUDENT';
  const NavbarComponent = isStudent ? StudentNavbar : FacultyNavbar;

  const genderOptions = ["male", "female", "others"] as const;
  type Gender = typeof genderOptions[number];
  const firstGraduateOptions = ["yes", "no"] as const;
  const sslcBoardOptions = ["cbse", "state", "icse"] as const;

  const [formData, setFormData] = useState({
    image: "",
    name: "",
    email: "",
    department: "",
    gender: "",
    dob: "",
    phoneNum: "",
    bloodGroup: "",
    nationality: "",
    address: "",
    adharNum: "",
    fatherName: "",
    motherName: "",
    firstGraduate: "",
    institutionName: "",
    degree: "",
    program: "",
    year: "",
    semester: "",
    startYear: "",
    expectedGraduation: "",
    cgpa: "",
    githubProfile: "",
    linkedInProfile: "",
    sslcSchoolName: "",
    sslcStartYear: "",
    sslcEndYear: "",
    sslcPercentage: "",
    sslcboardOfEducation: "",
    hscSchoolName: "",
    hscStartYear: "",
    hscEndYear: "",
    hscPercentage: "",
    hscboardOfEducation: "",
    rollNumber: "",
    staffId: "",
    experience: "",
    designation: "",
    endYear: "",
    description: "",
    achievements: "",
    researchDetails: "",
  });

  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }

    fetchUserProfile();
  }, [profile, navigate]);

  const id = profile?.profile.id;

  const fetchUserProfile = async () => {
    try {
      const endpoint = isStudent
        ? `/profile/student/${id}`
        : `/profile/faculty/${id}`;

      const response = await profileApi.get(endpoint);
      const mapped = mapBackendToFrontend(response.data);
      setFormData(mapped);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      toast.error("Failed to load profile data. Please try again later.");
      if (error.response?.status === 403) {
        navigate('/login');
      }
    }
  };

  function mapBackendToFrontend(data: any) {
    return {
      image: data.image || "",
      name: data.name || "",
      email: data.email || "",
      department: data.department || "",
      gender: data.gender || "",
      dob: data.dob || "",
      phoneNum: data.phoneNum || data.mobile || "",
      bloodGroup: data.bloodGroup || "",
      nationality: data.nationality || "",
      address: data.address || "",
      adharNum: data.adharNum || data.aadharNumber || "",
      fatherName: data.fatherName || "",
      motherName: data.motherName || "",
      firstGraduate: data.firstGraduate || "",
      institutionName: data.institutionName || data.institution || "",
      degree: data.degree || "",
      program: data.program || "",
      year: data.year || "",
      semester: data.semester || "",
      startYear: data.startYear || "",
      expectedGraduation: data.gradutaionYear || data.expectedGraduation || "",
      cgpa: data.cgpa || "",
      githubProfile: data.githubProfile || "",
      linkedInProfile: data.linkedInProfile || "",
      sslcSchoolName: data.sslcSchoolName || data.school10 || "",
      sslcStartYear: data.sslcStartYear || data.startYear10 || "",
      sslcEndYear: data.sslcEndYear || data.endYear10 || "",
      sslcPercentage: data.sslcPercentage || data.percentage10 || "",
      sslcboardOfEducation: data.sslcboardOfEducation || data.board10 || "",
      hscSchoolName: data.hscSchoolName || data.school12 || "",
      hscStartYear: data.hscStartYear || data.startYear12 || "",
      hscEndYear: data.hscEndYear || data.endYear12 || "",
      hscPercentage: data.hscPercentage || data.percentage12 || "",
      hscboardOfEducation: data.hscboardOfEducation || data.board12 || "",
      rollNumber: data.rollNum || data.rollNumber || "",
      staffId: data.staffId || "",
      experience: data.experience || "",
      designation: data.designation || "",
      endYear: data.endYear || "",
      description: data.description || "",
      achievements: data.achievements || "",
      researchDetails: data.researchDetails || ""
    };
  }

  function mapFrontendToBackend(data: any) {
    const commonFields = {
      image: data.image || null,
      name: data.name || "",
      email: data.email || "",
      department: data.department || "",
      gender: data.gender || "",
      dob: data.dob || "",
      phoneNum: data.phoneNum || "",
      bloodGroup: data.bloodGroup || "",
      nationality: data.nationality || "",
      address: data.address || "",
      adharNum: data.adharNum || "",
    };

    if (isStudent) {
      return {
        ...commonFields,
        fatherName: data.fatherName || "",
        motherName: data.motherName || "",
        firstGraduate: data.firstGraduate || "",
        institutionName: data.institutionName || "",
        degree: data.degree || "",
        program: data.program || "",
        year: data.year || "",
        semester: data.semester || "",
        startYear: data.startYear || "",
        gradutaionYear: data.expectedGraduation || "",
        cgpa: data.cgpa || "",
        githubProfile: data.githubProfile || "",
        linkedInProfile: data.linkedInProfile || "",
        sslcSchoolName: data.sslcSchoolName || "",
        sslcStartYear: data.sslcStartYear || "",
        sslcEndYear: data.sslcEndYear || "",
        sslcPercentage: data.sslcPercentage || "",
        sslcboardOfEducation: data.sslcboardOfEducation || "",
        hscSchoolName: data.hscSchoolName || "",
        hscStartYear: data.hscStartYear || "",
        hscEndYear: data.hscEndYear || "",
        hscPercentage: data.hscPercentage || "",
        hscboardOfEducation: data.hscboardOfEducation || "",
        rollNum: data.rollNumber || "",
      };
    } else {
      return {
        ...commonFields,
        staffId: data.staffId || "",
        experience: data.experience || "",
        designation: data.designation || "",
        institutionName: data.institutionName || "",
        startYear: data.startYear || "",
        endYear: data.endYear || "",
        description: data.description || "",
        achievements: data.achievements || "",
        researchDetails: data.researchDetails || ""
      };
    }
  }

  function cleanFormData(data: any) {
    const cleaned = { ...data };
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === "") {
        delete cleaned[key];
      }
    });
    return cleaned;
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: imageUrl });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile) {
      toast.error("Authentication required. Please login again.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    const id = profile.profile.id;
    const endpoint = isStudent
      ? `/profile/student/${id}`
      : `/profile/faculty/${id}`;

    try {
      toast.info("Updating profile...");
      const response = await profileApi.put(
        endpoint,
        cleanFormData(mapFrontendToBackend(formData))
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully");
        navigate('/profile');
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData || !formData.email) {
    return <div>Loading...</div>;
  }

  const initials = formData.name ? formData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
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
    const nonEditableFacultyFields = ['name', 'staffId', 'email', 'department'];

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
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24 cursor-pointer bg-gray-500" onClick={handleAvatarClick}>
              {formData.image ? (
                <AvatarImage src={formData.image} alt="Profile" className="w-24 h-24" />
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
              onChange={handleChange}
              name="name"
              {...getInputProps('name')}
            />
          </div>

          {isStudent ? (
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number *</Label>
              <Input
                id="rollNumber"
                value={formData.rollNumber || ""}
                onChange={handleChange}
                name="rollNumber"
                {...getInputProps('rollNumber')}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="staffId">Faculty ID *</Label>
              <Input
                id="staffId"
                value={formData.staffId || ""}
                onChange={handleChange}
                name="staffId"
                {...getInputProps('staffId')}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={handleChange}
              name="email"
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
                  onChange={handleChange}
                  name="fatherName"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother Name</Label>
                <Input
                  id="motherName"
                  value={formData.motherName || ""}
                  onChange={handleChange}
                  name="motherName"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstGraduate">First Graduate</Label>
                <select
                  id="firstGraduate"
                  value={formData.firstGraduate || ""}
                  onChange={handleChange}
                  name="firstGraduate"
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select option</option>
                  {firstGraduateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
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
                  onChange={handleChange}
                  name="department"
                  {...getInputProps('department')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience || ""}
                  onChange={handleChange}
                  name="experience"
                  placeholder="e.g. 5 years"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="phoneNum">Mobile Number</Label>
            <Input
              id="phoneNum"
              value={formData.phoneNum || ""}
              onChange={handleChange}
              name="phoneNum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob || ""}
              onChange={handleChange}
              name="dob"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender || ""}
              onChange={handleChange}
              name="gender"
              className="border p-2 rounded w-full"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloodGroup">Blood Group</Label>
            <Input
              id="bloodGroup"
              value={formData.bloodGroup || ""}
              onChange={handleChange}
              name="bloodGroup"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adharNum">Aadhar Number</Label>
            <Input
              id="adharNum"
              value={formData.adharNum || ""}
              onChange={handleChange}
              name="adharNum"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              value={formData.nationality || ""}
              onChange={handleChange}
              name="nationality"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={handleChange}
            name="address"
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">College Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution *</Label>
              <Input
                id="institutionName"
                value={formData.institutionName || ""}
                onChange={handleChange}
                name="institutionName"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="degree">Degree *</Label>
              <Input
                id="degree"
                value={formData.degree || ""}
                onChange={handleChange}
                name="degree"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="program">Program *</Label>
              <Input
                id="program"
                value={formData.program || ""}
                onChange={handleChange}
                name="program"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year *</Label>
              <Input
                id="startYear"
                value={formData.startYear || ""}
                onChange={handleChange}
                name="startYear"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedGraduation">Expected Graduation Year *</Label>
              <Input
                id="expectedGraduation"
                value={formData.expectedGraduation || ""}
                onChange={handleChange}
                name="expectedGraduation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cgpa">CGPA or Percentage *</Label>
              <Input
                id="cgpa"
                value={formData.cgpa || ""}
                onChange={handleChange}
                name="cgpa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubProfile">Github Profile</Label>
              <Input
                id="githubProfile"
                value={formData.githubProfile || ""}
                onChange={handleChange}
                name="githubProfile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedInProfile">LinkedIn Profile</Label>
              <Input
                id="linkedInProfile"
                value={formData.linkedInProfile || ""}
                onChange={handleChange}
                name="linkedInProfile"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">10th Standard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sslcSchoolName">School Name</Label>
              <Input
                id="sslcSchoolName"
                value={formData.sslcSchoolName || ""}
                onChange={handleChange}
                name="sslcSchoolName"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcStartYear">Start Year</Label>
              <Input
                id="sslcStartYear"
                value={formData.sslcStartYear || ""}
                onChange={handleChange}
                name="sslcStartYear"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcEndYear">End Year</Label>
              <Input
                id="sslcEndYear"
                value={formData.sslcEndYear || ""}
                onChange={handleChange}
                name="sslcEndYear"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcPercentage">Percentage</Label>
              <Input
                id="sslcPercentage"
                value={formData.sslcPercentage || ""}
                onChange={handleChange}
                name="sslcPercentage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcboardOfEducation">Board of Education</Label>
              <select
                id="sslcboardOfEducation"
                value={formData.sslcboardOfEducation || ""}
                onChange={handleChange}
                name="sslcboardOfEducation"
                className="border p-2 rounded w-full"
              >
                <option value="">Select board</option>
                {sslcBoardOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">12th Standard / Diploma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hscSchoolName">School Name</Label>
              <Input
                id="hscSchoolName"
                value={formData.hscSchoolName || ""}
                onChange={handleChange}
                name="hscSchoolName"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscStartYear">Start Year</Label>
              <Input
                id="hscStartYear"
                value={formData.hscStartYear || ""}
                onChange={handleChange}
                name="hscStartYear"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscEndYear">End Year</Label>
              <Input
                id="hscEndYear"
                value={formData.hscEndYear || ""}
                onChange={handleChange}
                name="hscEndYear"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscPercentage">Percentage</Label>
              <Input
                id="hscPercentage"
                value={formData.hscPercentage || ""}
                onChange={handleChange}
                name="hscPercentage"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscboardOfEducation">Board of Education</Label>
              <select
                id="hscboardOfEducation"
                value={formData.hscboardOfEducation || ""}
                onChange={handleChange}
                name="hscboardOfEducation"
                className="border p-2 rounded w-full"
              >
                <option value="">Select board</option>
                {sslcBoardOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkExperience = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="institutionName">Organization</Label>
            <Input
              id="institutionName"
              value={formData.institutionName || ""}
              onChange={handleChange}
              name="institutionName"
              placeholder="Company/University name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              value={formData.designation || ""}
              onChange={handleChange}
              name="designation"
              placeholder="Your position/role"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startYear">Start Year</Label>
            <Input
              id="startYear"
              type="date"
              value={formData.startYear || ""}
              onChange={handleChange}
              name="startYear"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endYear">End Year</Label>
            <Input
              id="endYear"
              type="date"
              value={formData.endYear || ""}
              onChange={handleChange}
              name="endYear"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={handleChange}
            name="description"
            placeholder="Describe your responsibilities and achievements"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="achievements">Achievements</Label>
          <Textarea
            id="achievements"
            value={formData.achievements || ""}
            onChange={handleChange}
            name="achievements"
            placeholder="Notable accomplishments in this role"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="researchDetails">Research Details</Label>
          <Textarea
            id="researchDetails"
            value={formData.researchDetails || ""}
            onChange={handleChange}
            name="researchDetails"
            placeholder="Details of any research work or publications"
          />
        </div>
      </CardContent>
    </Card>
  );

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
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${activeSection === item.id
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
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}