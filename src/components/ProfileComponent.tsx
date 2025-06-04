import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Eye } from "lucide-react";

interface ProfileComponentProps {
  userType: 'student' | 'faculty';
  currentUser: any;
  onUpdate: (updatedUser: any) => void;
}

const ProfileComponent = ({ userType, currentUser, onUpdate }: ProfileComponentProps) => {
  const navigate = useNavigate();

  const initials = currentUser.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex justify-center mb-4">
            <Avatar className="w-20 h-20">
              {currentUser.image ? (
                <AvatarImage src={currentUser.image} alt="Profile" className="w-20 h-20" />
              ) : (
                <AvatarFallback className="bg-blue-500 text-white w-20 h-20 text-2xl">
                  {initials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
          <p className="text-gray-600">{currentUser.email}</p>
        </CardHeader>

        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="text-lg">{currentUser.name}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-lg">{currentUser.email}</p>
              </div>


            </div>

            <div className="space-y-4">
              {userType === 'student' ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                    <p className="text-lg">{currentUser.rollNum}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Year</h3>
                    <p className="text-lg">{currentUser.year}</p>


                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="text-lg">{currentUser.program}</p>
                  </div>


                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Faculty ID</h3>
                    <p className="text-lg">{currentUser.staffId}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Department</h3>
                    <p className="text-lg">{currentUser.department}</p>
                  </div>

                  {/* <div>
                    <h3 className="text-sm font-medium text-gray-500">Mobile Number</h3>
                    <p className="text-lg">{currentUser.mobile}</p>
                  </div> */}
                </>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/profile/view')}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate('/profile/edit')}
            >
              <User className="h-4 w-4" />
              Edit Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileComponent;