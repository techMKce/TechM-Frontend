import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import StudentNavbar from "@/components/StudentNavbar";
import FacultyNavbar from "@/components/FacultyNavbar";
import { useAuth } from "@/hooks/useAuth";
import profileApi from "@/service/api";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  // Basic Info
  image?: string;
  name?: string;
  email?: string;
  department?: string;
  gender?: string;
  dob?: string;
  phoneNum?: string;
  bloodGroup?: string;
  nationality?: string;
  address?: string;
  adharNum?: string;
  designation?: string;
  experience?: string;
  staffId?: string;
  rollNumber?: string;

  // Family Info
  fatherName?: string;
  motherName?: string;
  firstGraduate?: string;

  // Education Info
  institutionName?: string;
  degree?: string;
  program?: string;
  year?: string;
  semester?: string;
  startYear?: string;
  gradutaionYear?: string;
  cgpa?: string;

  // Social Profiles
  githubProfile?: string;
  linkedInProfile?: string;

  // SSLC (10th) Details
  sslcSchoolName?: string;
  sslcStartYear?: string;
  sslcEndYear?: string;
  sslcPercentage?: string;
  sslcboardOfEducation?: string;

  // HSC (12th) Details
  hscSchoolName?: string;
  hscStartYear?: string;
  hscEndYear?: string;
  hscPercentage?: string;
  hscboardOfEducation?: string;


  // Work Experience (now individual fields instead of array)
  endYear?: string;
  description?: string;
  achievements?: string;
  researchDetails?: string;
}

export default function ViewProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = profile.profile.role === 'STUDENT'
          ? `/profile/student/${profile.profile.id}`
          : `/profile/faculty/${profile.profile.id}`;

        // console.log("Fetching profile from:", endpoint);
        const response = await profileApi.get(endpoint);

        if (response.data) {
          // console.log("Raw API response:", response.data);
          const mappedData = mapBackendToFrontend(response.data);
          // console.log("Mapped profile data:", mappedData);
          setCurrentUser(mappedData);
        } else {
          throw new Error("No profile data received");
        }
      } catch (err) {

        toast({title:"Failed to load profile data",variant:'destructive'});

        handleFetchError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profile, navigate]);

  const handleFetchError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        setError("Profile not found. Please complete your profile setup.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later or contact support.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to load profile");
      }
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("An unknown error occurred");
    }
    toast({title:"Failed to load profile data",variant:'destructive'});
  };

  function mapBackendToFrontend(data: any): ProfileData {
    return {
      // Basic Info
      image: data.image,
      name: data.name,
      email: data.email,
      department: data.department,
      gender: data.gender,
      dob: data.dob,
      phoneNum: data.phoneNum || data.mobile,
      bloodGroup: data.bloodGroup,
      nationality: data.nationality,
      address: data.address,
      adharNum: data.adharNum || data.aadharNumber,
      designation: data.designation,
      experience: data.experience,
      staffId: data.staffId,
      rollNumber: data.rollNum || data.rollNumber,

      // Family Info
      fatherName: data.fatherName,
      motherName: data.motherName,
      firstGraduate: data.firstGraduate,

      // Education Info
      institutionName: data.institutionName || data.institution,
      degree: data.degree,
      program: data.program,
      year: data.year,
      semester: data.semester,
      startYear: data.startYear,
      gradutaionYear: data.gradutaionYear || data.expectedGraduation,
      cgpa: data.cgpa,

      // Social Profiles
      githubProfile: data.githubProfile,
      linkedInProfile: data.linkedInProfile,

      // SSLC (10th) Details
      sslcSchoolName: data.sslcSchoolName || data.school10,
      sslcStartYear: data.sslcStartYear || data.startYear10,
      sslcEndYear: data.sslcEndYear || data.endYear10,
      sslcPercentage: data.sslcPercentage || data.percentage10,
      sslcboardOfEducation: data.sslcboardOfEducation || data.board10,

      // HSC (12th) Details
      hscSchoolName: data.hscSchoolName || data.school12,
      hscStartYear: data.hscStartYear || data.startYear12,
      hscEndYear: data.hscEndYear || data.endYear12,
      hscPercentage: data.hscPercentage || data.percentage12,
      hscboardOfEducation: data.hscboardOfEducation || data.board12,

      // Work Experience (individual fields)
      endYear: data.endYear,
      description: data.description || data.description,
      achievements: data.achievements,
      researchDetails: data.researchDetails
    };
  }

  const renderBasicDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle>Basic Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Name</h3>
              <p className="text-lg font-medium">{currentUser?.name || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p className="text-lg">{currentUser?.email || "Not specified"}</p>
            </div>

            {profile?.profile.role !== 'STUDENT' && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                <p className="text-lg">{currentUser?.department || "Not specified"}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
              <p className="text-lg">{currentUser?.phoneNum || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
              <p className="text-lg">{currentUser?.dob || "Not specified"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
              <p className="text-lg">{currentUser?.gender || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Blood Group</h3>
              <p className="text-lg">{currentUser?.bloodGroup || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nationality</h3>
              <p className="text-lg">{currentUser?.nationality || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {profile?.profile.role === 'STUDENT' ? "Roll Number" : "Faculty ID"}
              </h3>
              <p className="text-lg">
                {profile?.profile.role === 'STUDENT'
                  ? currentUser?.rollNumber
                  : currentUser?.staffId || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {currentUser?.address && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
            <p className="text-lg">{currentUser.address}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEducationDetails = () => (
    <Card>
      <CardHeader>
        <CardTitle>Education Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* College Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">College Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Institution</h4>
              <p className="text-lg">{currentUser?.institutionName || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Degree</h4>
              <p className="text-lg">{currentUser?.degree || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Program</h4>
              <p className="text-lg">{currentUser?.program || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser?.startYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Expected Graduation</h4>
              <p className="text-lg">{currentUser?.gradutaionYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">CGPA/Percentage</h4>
              <p className="text-lg">{currentUser?.cgpa || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* 10th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">10th Standard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">School Name</h4>
              <p className="text-lg">{currentUser?.sslcSchoolName || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser?.sslcStartYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">End Year</h4>
              <p className="text-lg">{currentUser?.sslcEndYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Percentage</h4>
              <p className="text-lg">{currentUser?.sslcPercentage || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Board of Education</h4>
              <p className="text-lg">{currentUser?.sslcboardOfEducation || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* 12th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">12th Standard / Diploma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">School Name</h4>
              <p className="text-lg">{currentUser?.hscSchoolName || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser?.hscStartYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">End Year</h4>
              <p className="text-lg">{currentUser?.hscEndYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Percentage</h4>
              <p className="text-lg">{currentUser?.hscPercentage || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Board of Education</h4>
              <p className="text-lg">{currentUser?.hscboardOfEducation || "Not specified"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkExperience = () => {
    const hasWorkExperience =
      currentUser?.institutionName ||
      currentUser?.designation;

    if (!hasWorkExperience) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">No work experience added yet.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Organization</h4>
              <p className="text-lg">
                {currentUser?.institutionName || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Designation</h4>
              <p className="text-lg">{currentUser?.designation || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Duration</h4>
              <p className="text-lg">
                {currentUser?.startYear && currentUser?.endYear
                  ? `${currentUser.startYear} - ${currentUser.endYear}`
                  : "Not specified"}
              </p>
            </div>
          </div>

          {currentUser?.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
              <p className="text-lg whitespace-pre-line">{currentUser.description}</p>
            </div>
          )}

          {currentUser?.achievements && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Achievements</h4>
              <p className="text-lg whitespace-pre-line">{currentUser.achievements}</p>
            </div>
          )}

          {currentUser?.researchDetails && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Research Details</h4>
              <p className="text-lg whitespace-pre-line">{currentUser.researchDetails}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const NavbarComponent = profile?.profile.role === 'STUDENT' ? StudentNavbar : FacultyNavbar;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarComponent currentPage="/profile" />
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                {/* Error icon */}
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/profile')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarComponent currentPage="/profile" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/profile')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Profile Details</h1>
          <p className="text-gray-600">View your profile information</p>
        </div>

        <div className="space-y-6">
          {renderBasicDetails()}
          {profile?.profile.role === 'STUDENT' && renderEducationDetails()}
          {profile?.profile.role !== 'STUDENT' && renderWorkExperience()}
        </div>
      </div>
    </div>
  );
}