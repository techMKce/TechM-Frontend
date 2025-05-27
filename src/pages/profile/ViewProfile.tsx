
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import StudentNavbar from "@/components/StudentNavbar";
import FacultyNavbar from "@/components/FacultyNavbar";

export default function ViewProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.id) {
      navigate('/');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const isStudent = currentUser.role === 'student';
  const NavbarComponent = isStudent ? StudentNavbar : FacultyNavbar;

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
                <p className="text-lg">{currentUser.department || "Not specified"}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Mobile Number</h3>
              <p className="text-lg">{currentUser.mobile || "Not specified"}</p>
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
              <p className="text-lg">{currentUser.aadharNumber || "Not specified"}</p>
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
              <p className="text-lg">{currentUser.institution || "Not specified"}</p>
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
              <p className="text-lg">{currentUser.expectedGraduation || "Not specified"}</p>
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
              <p className="text-lg">{currentUser.school10 || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser.startYear10 || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">End Year</h4>
              <p className="text-lg">{currentUser.endYear10 || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Percentage</h4>
              <p className="text-lg">{currentUser.percentage10 || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* 12th Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b pb-2">12th Standard / Diploma</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">School Name</h4>
              <p className="text-lg">{currentUser.school12 || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Start Year</h4>
              <p className="text-lg">{currentUser.startYear12 || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">End Year</h4>
              <p className="text-lg">{currentUser.endYear12 || "Not specified"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Percentage</h4>
              <p className="text-lg">{currentUser.percentage12 || "Not specified"}</p>
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
