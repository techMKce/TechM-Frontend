import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "@/components/StudentNavbar";
import FacultyNavbar from "@/components/FacultyNavbar";
import ProfileComponent from "@/components/ProfileComponent";
import { useAuth } from "@/hooks/useAuth";
import profileApi from "../../service/api";

export default function Profile() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [externalStudents, setExternalStudents] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingExternal, setLoadingExternal] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const id = profile.profile.id;

    const fetchProfile = async () => {
      try {
        let res;
        if (profile.profile.role === 'STUDENT') {
          res = await profileApi.get(`/profile/student/${id}`);
        } else if (profile.profile.role === 'FACULTY') {
          res = await profileApi.get(`/profile/faculty/${id}`);
        }
        console.log(`${profile.profile.role} profile response`, res?.data);
        setCurrentUser(res?.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };

    fetchProfile();
  }, [profile]);




  const handleUpdate = async (updatedUser: any) => {
    if (!currentUser?.id) return;

    try {
      let res;
      if (profile.profile.role === 'STUDENT') {
        res = await profileApi.put(`/profile/student/${currentUser.id}`, updatedUser);
      } else if (profile.profile.role === 'FACULTY') {
        res = await profileApi.put(`/profile/faculty/${currentUser.id}`, updatedUser);
      }
      setCurrentUser(res.data);
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (!profile || !profile.profile?.id) {
    return <div>Loading profile...</div>;
  }

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const isStudent = profile.profile.role === 'STUDENT';
  const NavbarComponent = isStudent ? StudentNavbar : FacultyNavbar;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarComponent currentPage="/profile" />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">My Profile</h1>
          <p className="text-gray-600 text-center">Manage your profile information and settings</p>
        </div>

        <ProfileComponent
          userType={profile.profile.role.toLowerCase() as 'student' | 'faculty'}
          currentUser={currentUser}
          onUpdate={handleUpdate}
        />

        {/* {profile.profile.role === 'FACULTY' && (
          <div className="mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">External Students</h2>
            {loadingExternal ? (
              <p>Loading external students...</p>
            ) : externalStudents.length === 0 ? (
              <p className="text-gray-500">No external students found.</p>
            ) : (
              <ul className="space-y-4">
                {externalStudents.map((student, index) => (
                  <li key={index} className="p-4 bg-white shadow rounded">
                    <p><strong>Name:</strong> {student.name}</p>
                    <p><strong>Reg No:</strong> {student.regNum}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}
