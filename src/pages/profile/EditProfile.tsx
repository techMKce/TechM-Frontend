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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
// import axios from "axios";
import profileApi from "@/service/api";

export default function EditProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  // const [currentUser, setCurrentUser] = useState<any>(null);
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
    // endYear: "",
    // description: "",
    // achievements: "",
    // researchDetails: ""
    workExperiences: [] as Array<{
      organizationName?: string;
      designation?: string;
      startYear?: string;
      endYear?: string;
      description?: string;
      achievements?: string;
      researchDetails?: string;
    }>,









  });

  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }

    const id = profile.profile.id;
    fetchUserProfile();
  }, [profile, navigate]);

  const id = profile.profile.id;

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


  if (!formData || !formData.email) {
    return <div>Loading...</div>;
  }







  // function mapBackendToFrontend(data) {
  //   return {
  //     name: data.name || "",
  //     email: data.email || "",
  //     department: data.department || "",
  //     gender: data.gender || "",
  //     dob: data.dob || "",
  //     phoneNum: data.phoneNum || "",
  //     bloodGroup: data.bloodGroup || "",
  //     nationality: data.nationality || "",
  //     address: data.address || "",
  //     adharNum: data.adharNum || "",
  //     fatherName: data.fatherName || "",
  //     motherName: data.motherName || "",
  //     firstGraduate: data.firstGraduate || "",
  //     institution: data.institutionName || "",
  //     degree: data.degree || "",
  //     program: data.program || "",
  //     startYear: data.startYear || data.year || "",
  //     expectedGraduation: data.gradutaionYear || "",
  //     cgpa: data.cgpa || "",
  //     githubProfile: data.githubProfile || "",
  //     linkedInProfile: data.linkedInProfile || "",
  //     sslcSchoolName: data.sslcSchoolName || "",
  //     sslcStartYear: data.sslcStartYear || "",
  //     sslcEndYear: data.sslcEndYear || "",
  //     sslcPercentage: data.sslcPercentage || "",
  //     sslcboardOfEducation: data.sslcboardOfEducation || "",
  //     hscSchoolName: data.hscSchoolName || "",
  //     hscStartYear: data.hscStartYear || "",
  //     hscEndYear: data.hscEndYear || "",
  //     hscPercentage: data.hscPercentage || "",
  //     hscboardOfEducation: data.hscboardOfEducation || "",
  //     rollNumber: data.rollNum || "",
  //     staffId: data.staffId || "",
  //     experience: data.experience || "",
  //     designation: data.designation || "",
  //     endYear: data.endYear || "",
  //     description: data.description || "",
  //     achievements: data.achievements || "",
  //     researchDetails: data.researchDetails || ""
  //   };
  // }

  function mapBackendToFrontend(data: any) {
    // Always return all fields expected by formData, with defaults if missing
    return {
      image: data.image || "",
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
      fatherName: data.fatherName || "",
      motherName: data.motherName || "",
      firstGraduate: data.firstGraduate || "",
      institutionName: data.institutionName || "",
      degree: data.degree || "",
      program: data.program || "",
      year: data.year || data.startYear || "",
      semester: data.semester || "",
      startYear: data.startYear || "",
      expectedGraduation: data.gradutaionYear || data.expectedGraduation || "",
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
      rollNumber: data.rollNum || data.rollNumber || "",
      staffId: data.staffId || "",
      experience: data.experience || "",
      designation: data.designation || "",
      workExperiences: data.workExperiences || [],
    };
  }

  // Map frontend formData back to backend format for update
  function mapFrontendToBackend(data) {
    // Common fields for both student and faculty
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

    if (profile?.profile.role === 'STUDENT') {
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
        workExperiences: data.workExperiences?.map(exp => ({
          organizationName: exp.organizationName || "",
          designation: exp.designation || "",
          startYear: exp.startYear || "",
          endYear: exp.endYear || "",
          description: exp.description || "",
          achievements: exp.achievements || "",
          researchDetails: exp.researchDetails || ""
        })) || [],
      };
    }
  }

  function cleanFormData(data) {
    const cleaned = { ...data };
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === "") {
        delete cleaned[key];
      }
    });
    return cleaned;
  }



  const handleImageChange = async (e: any) => {
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

  const handleChange = (e) => {
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
      // Error handling remains the same
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData || !formData.email) {
    return <div>Loading...</div>;
  }

  // const initials = currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';
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
              <Label htmlFor="staffId">Faculty ID *</Label>
              <Input
                id="staffId"
                value={formData.staffId || ""}
                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
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

              {/* <div className="space-y-2">
                <Label htmlFor="firstGraduate">First Graduate</Label>
                <Input
                  id="firstGraduate"
                  value={formData.firstGraduate || ""}
                  onChange={(e) => setFormData({ ...formData, firstGraduate: e.target.value })}
                  {...getInputProps('firstGraduate')}
                />
              </div> */}
              <div className="space-y-2">
                <Label htmlFor="firstGraduate">First Graduate</Label>
                <select
                  id="firstGraduate"
                  value={formData.firstGraduate || ""}
                  onChange={(e) => setFormData({ ...formData, firstGraduate: e.target.value })}
                  className="border p-2 rounded w-full"
                  {...getInputProps('firstGraduate')}
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
              value={formData.phoneNum || ""}
              onChange={(e) => setFormData({ ...formData, phoneNum: e.target.value })}
              {...getInputProps('phoneNum')}
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
            <select
              id="gender"
              value={formData.gender || ""}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="border p-2 rounded w-full" // Add styling if needed
              {...getInputProps('gender')}
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
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              {...getInputProps('bloodGroup')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adharNum">Aadhar Number</Label>
            <Input
              id="adharNum"
              value={formData.adharNum || ""}
              onChange={(e) => setFormData({ ...formData, adharNum: e.target.value })}
              {...getInputProps('adharNum')}
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
                value={formData.institutionName || ""}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
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
                id="linkedInProfile"
                value={formData.linkedInProfile || ""}
                onChange={(e) => setFormData({ ...formData, linkedInProfile: e.target.value })}
                {...getInputProps('linkedInProfile')}
              />
            </div>
          </div>
        </div>

        {/* 10th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">10th Standard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sslcSchoolName">School Name</Label>
              <Input
                id="sslcSchoolName"
                value={formData.sslcSchoolName || ""}
                onChange={(e) => setFormData({ ...formData, sslcSchoolName: e.target.value })}
                {...getInputProps('sslcSchoolName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcStartYear">Start Year</Label>
              <Input
                id="sslcStartYear"
                value={formData.sslcStartYear || ""}
                onChange={(e) => setFormData({ ...formData, sslcStartYear: e.target.value })}
                {...getInputProps('sslcStartYear')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcEndYear">End Year</Label>
              <Input
                id="sslcEndYear"
                value={formData.sslcEndYear || ""}
                onChange={(e) => setFormData({ ...formData, sslcEndYear: e.target.value })}
                {...getInputProps('sslcEndYear')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcPercentage">Percentage</Label>
              <Input
                id="sslcPercentage"
                value={formData.sslcPercentage || ""}
                onChange={(e) => setFormData({ ...formData, sslcPercentage: e.target.value })}
                {...getInputProps('sslcPercentage')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscboardOfEducation">Board of Education</Label>
              <select
                id="hscboardOfEducation"
                value={formData.hscboardOfEducation || ""}
                onChange={(e) => setFormData({ ...formData, hscboardOfEducation: e.target.value })}
                className="border p-2 rounded w-full"
                {...getInputProps('hscboardOfEducation')}
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

        {/* 12th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">12th Standard / Diploma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hscSchoolName">School Name</Label>
              <Input
                id="hscSchoolName"
                value={formData.hscSchoolName || ""}
                onChange={(e) => setFormData({ ...formData, hscSchoolName: e.target.value })}
                {...getInputProps('hscSchoolName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscStartYear">Start Year</Label>
              <Input
                id="hscStartYear"
                value={formData.hscStartYear || ""}
                onChange={(e) => setFormData({ ...formData, hscStartYear: e.target.value })}
                {...getInputProps('hscStartYear')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscEndYear">End Year</Label>
              <Input
                id="hscEndYear"
                value={formData.hscEndYear || ""}
                onChange={(e) => setFormData({ ...formData, hscEndYear: e.target.value })}
                {...getInputProps('hscEndYear')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hscPercentage">Percentage</Label>
              <Input
                id="hscPercentage"
                value={formData.hscPercentage || ""}
                onChange={(e) => setFormData({ ...formData, hscPercentage: e.target.value })}
                {...getInputProps('hscPercentage')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sslcboardOfEducation">Board of Education</Label>
              <select
                id="sslcboardOfEducation"
                value={formData.sslcboardOfEducation || ""}
                onChange={(e) => setFormData({ ...formData, sslcboardOfEducation: e.target.value })}
                className="border p-2 rounded w-full"
                {...getInputProps('sslcboardOfEducation')}
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

  const renderWorkExperience = () => {
    // Initialize workExperiences as an array, defaulting to empty array if undefined
    const workExperiences = formData.workExperiences || [];

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
                  <Label htmlFor={`organizationName-${index}`}>Organization Name</Label>
                  <Input
                    id={`organizationName-${index}`}
                    value={experience.organizationName || ""}
                    onChange={(e) => updateExperience(index, 'organizationName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`designation-${index}`}>Designation</Label>
                  <Input
                    id={`designation-${index}`}
                    value={experience.designation || ""}
                    onChange={(e) => updateExperience(index, 'designation', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`startYear-${index}`}>Start Year</Label>
                  <Input
                    id={`startYear-${index}`}
                    type="date"
                    value={experience.startYear || ""}
                    onChange={(e) => updateExperience(index, 'startYear', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`endYear-${index}`}>End Year</Label>
                  <Input
                    id={`endYear-${index}`}
                    type="date"
                    value={experience.endYear || ""}
                    onChange={(e) => updateExperience(index, 'endYear', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={experience.description || ""}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
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