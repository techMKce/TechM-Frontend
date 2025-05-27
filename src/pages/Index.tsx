
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, User, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "Student",
      description: "Access your courses, assignments, and academic resources",
      icon: GraduationCap,
      route: "/student/login",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Faculty",
      description: "Manage your courses, students, and academic content",
      icon: User,
      route: "/faculty/login",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "Admin",
      description: "Oversee the entire campus management system",
      icon: Shield,
      route: "/admin",
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Campus Nexus</h1>
          <p className="text-xl text-gray-600">Choose your role to access the portal</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <Card key={role.title} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="text-center">
                <div className={`mx-auto w-16 h-16 rounded-full ${role.color} flex items-center justify-center mb-4`}>
                  <role.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl">{role.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {role.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => navigate(role.route)}
                  size="lg"
                >
                  Enter as {role.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
