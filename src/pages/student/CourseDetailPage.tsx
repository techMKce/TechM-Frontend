import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/StudentNavbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Calendar, 
  User,
  Clock,
  ArrowLeft
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Sidebar } from "@/components/layout/Sidebar";

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [studentName] = useState("John Doe");
  const navigate = useNavigate();

  const course = {
    id: parseInt(courseId || "1"),
    name: "Database Management Systems",
    instructor: "Dr. Jane Smith",
    department: "CSE",
    description: "This course introduces the fundamental concepts of database management systems...",
    syllabus: `
      <h3>Course Objectives</h3>
      <ul>
        <li>Understand database concepts and architecture</li>
        <li>Design databases using ER modeling and normalization</li>
        <li>Implement databases using SQL</li>
        <li>Understand transaction processing and concurrency control</li>
        <li>Learn about database security and integrity</li>
      </ul>
      <h3>Topics Covered</h3>
      <ol>
        <li>Introduction to Database Systems</li>
        <li>Entity-Relationship Model</li>
        <li>Relational Model and Algebra</li>
        <li>SQL: Data Definition and Manipulation</li>
        <li>Database Design Theory and Normalization</li>
        <li>Transaction Processing</li>
        <li>Concurrency Control</li>
        <li>Database Security and Authorization</li>
        <li>Data Warehousing and Mining Concepts</li>
        <li>NoSQL Databases</li>
      </ol>
    `,
    prerequisites: ["Data Structures", "Computer Architecture"],
    duration: "16 weeks",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGRhdGFiYXNlfGVufDB8fDB8fHww",
    enrolled: true,
  };

  const navItems = [
    { title: "Dashboard", href: "/student/dashboard", icon: BookOpen },
    { title: "Courses", href: "/student/courses", icon: BookOpen },
    { title: "Attendance", href: "/student/attendance", icon: Calendar },
  ];

  return (
    <div className="flex h-screen">
      {/* <Sidebar items={navItems} /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Navbar userType="student" userName={studentName} /> */}
        <Navbar />
        <div className="page-container flex-1 overflow-y-auto">
          <Link to="/student/courses" className="flex items-center text-accent hover:text-accent-dark mb-4">
            <ArrowLeft size={16} className="mr-1" />
            Back to Courses
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="h-64 overflow-hidden">
                  <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-bold text-primary">{course.name}</h1>
                      <p className="text-secondary mt-1 flex items-center">
                        <User size={16} className="mr-1" /> {course.instructor}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-sm font-medium bg-blue-100 text-primary rounded">
                      {course.department}
                    </span>
                  </div>

                  <div className="mt-6">
                    <h2 className="text-xl font-semibold mb-2">Course Description</h2>
                    <p className="text-secondary">{course.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-6">
                    <div>
                      <h3 className="text-sm font-medium text-secondary">Duration</h3>
                      <p className="flex items-center mt-1">
                        <Clock size={16} className="mr-1 text-accent" /> {course.duration}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-secondary">Prerequisites</h3>
                      <p>{course.prerequisites.join(", ")}</p>
                    </div>
                  </div>

                  {/* BUTTON TO VIEW ASSIGNMENTS */}
                  <div className="mt-6">
                    <Button
                      onClick={() => navigate('/student/courses/${course.id}/assignments')}
                      className="bg-accent hover:bg-accent-dark"
                    >
                      View Assignments
                    </Button>
                  </div>
                </div>
              </div>

              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Course Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="syllabus">
                    <TabsList className="mb-4">
                      <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
                    </TabsList>

                    <TabsContent value="syllabus">
                      <div dangerouslySetInnerHTML={{ __html: course.syllabus }} />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;