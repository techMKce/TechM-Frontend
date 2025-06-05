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
import { toast } from 'sonner';

export default function ViewProfile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);






  useEffect(() => {
    console.log("profile:", profile); // Check if auth exists
    if (!profile) {
      console.warn("No profile - redirecting");
      navigate('/');
      return;
    }

    const id = profile.profile.id;
    console.log("Fetching profile for ID:", id);


    const fetchProfile = async () => {
      if (!profile) {
        navigate('/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const id = profile.profile.id;
        console.log("Fetching profile for ID:", id);

        // Use different endpoints based on user role
        const endpoint = profile.profile.role === 'STUDENT'
          ? `/profile/student/${id}`
          : `/profile/faculty/${id}`;

        const response = await profileApi.get(endpoint);

        if (response.data) {
          setCurrentUser(mapBackendToFrontend(response.data));
        } else {
          throw new Error("No profile data received");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);

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

        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [profile, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  


  const isStudent = profile.profile.role === 'STUDENT';
  const NavbarComponent = isStudent ? StudentNavbar : FacultyNavbar;



  function mapBackendToFrontend(data: any) {
    console.log("Mapping backend data to frontend format:");
    return {
      // Basic Info
      image: data.image,
      name: data.name,
      email: data.email,
      department: data.department,
      gender: data.gender,
      dob: data.dob,
      phoneNum: data.phoneNum || data.mobile, // Handle both field names
      bloodGroup: data.bloodGroup,
      nationality: data.nationality,
      address: data.address,
      adharNum: data.adharNum || data.aadharNumber,

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
      rollNumber: data.rollNum || data.rollNum, // Handle both field names

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

      // Work Experience (for faculty)
      workExperiences: data.workExperiences || []
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
              <p className="text-lg font-medium">{currentUser.name || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
              <p className="text-lg">{currentUser.email || "Not specified"}</p>
            </div>

            {!isStudent && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                <p className="text-lg">{currentUser.program || "Not specified"}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
              <p className="text-lg">{currentUser.phoneNum || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Date of Birth</h3>
              <p className="text-lg">{currentUser.dob || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Gender</h3>
              <p className="text-lg">{currentUser.gender || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Blood Group</h3>
              <p className="text-lg">{currentUser.bloodGroup || "Not specified"}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Nationality</h3>
              <p className="text-lg">{currentUser.nationality || "Not specified"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {isStudent ? "Roll Number" : "Faculty ID"}
              </h3>
              <p className="text-lg">{isStudent ? currentUser.rollNumber : currentUser.facultyId || "Not specified"}</p>
            </div>

            {isStudent && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Father Name</h3>
                  <p className="text-lg">{currentUser.fatherName || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Mother Name</h3>
                  <p className="text-lg">{currentUser.motherName || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">First Graduate</h3>
                  <p className="text-lg">{currentUser.firstGraduate || "Not specified"}</p>
                </div>
              </>
            )}

            {!isStudent && (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Experience</h3>
                  <p className="text-lg">{currentUser.experience || "Not specified"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Designation</h3>
                  <p className="text-lg">{currentUser.designation || "Not specified"}</p>
                </div>
              </>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Aadhar Number</h3>
              <p className="text-lg">{currentUser.adharNum || "Not specified"}</p>
            </div>
          </div>
        </div>

        {currentUser.address && (
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
              <p className="text-lg">{currentUser.institutionName || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Degree</h4>
              <p className="text-lg">{currentUser.degree || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Program</h4>
              <p className="text-lg">{currentUser.program || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser.startYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Expected Graduation</h4>
              <p className="text-lg">{currentUser.gradutaionYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">CGPA/Percentage</h4>
              <p className="text-lg">{currentUser.cgpa || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* 10th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">10th Standard</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">School Name</h4>
              <p className="text-lg">{currentUser.sslcSchoolName || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser.sslcStartYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">End Year</h4>
              <p className="text-lg">{currentUser.sslcEndYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Percentage</h4>
              <p className="text-lg">{currentUser.sslcPercentage || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Board of Education</h4>
              <p className="text-lg">{currentUser.sslcboardOfEducation || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* 12th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">12th Standard / Diploma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">School Name</h4>
              <p className="text-lg">{currentUser.hscSchoolName || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser.hscStartYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">End Year</h4>
              <p className="text-lg">{currentUser.hscEndYear || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Percentage</h4>
              <p className="text-lg">{currentUser.hscPercentage || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Board of Education</h4>
              <p className="text-lg">{currentUser.hscboardOfEducation || "Not specified"}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderWorkExperience = () => {
    const workExperiences = currentUser.workExperiences || [];

    // Fallback for old data structure
    if (workExperiences.length === 0 && (currentUser.organizationName || currentUser.workStartYear)) {
      workExperiences.push({
        organizationName: currentUser.organizationName,
        workStartYear: currentUser.workStartYear,
        workEndYear: currentUser.workEndYear,
        workDescription: currentUser.workDescription,
        achievements: currentUser.achievements,
        researchDetails: currentUser.researchDetails
      });
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {workExperiences.length === 0 ? (
            <p className="text-gray-500">No work experience added yet.</p>
          ) : (
            workExperiences.map((experience: any, index: number) => (
              <div key={index} className="border-b pb-6 last:border-b-0 last:pb-0">
                <h3 className="text-lg font-semibold mb-4">Experience {index + 1}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Organization Name</h4>
                    <p className="text-lg">{experience.organizationName || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Duration</h4>
                    <p className="text-lg">
                      {experience.workStartYear && experience.workEndYear
                        ? `${experience.workStartYear} - ${experience.workEndYear}`
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                {experience.workDescription && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                    <p className="text-lg">{experience.workDescription}</p>
                  </div>
                )}

                {experience.achievements && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Achievements</h4>
                    <p className="text-lg">{experience.achievements}</p>
                  </div>
                )}

                {experience.researchDetails && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Research Details</h4>
                    <p className="text-lg">{experience.researchDetails}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Profile Details</h1>
          <p className="text-gray-600">View your profile information</p>
        </div>

        <div className="space-y-6">
          {renderBasicDetails()}
          {isStudent && renderEducationDetails()}
          {!isStudent && renderWorkExperience()}
        </div>
      </div>
    </div>
  );
}
