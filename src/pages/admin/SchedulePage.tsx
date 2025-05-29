
import AdminNavbar from "@/components/AdminNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Course {
  id: string;
  courseId: string;
  name: string;
  description: string;
  facultyId: string;
  facultyName: string;
  isEnabled: boolean;
}

interface ScheduleEntry {
  id: string;
  courseId: string;
  courseName: string;
  facultyName: string;
  date: string;
  timeSlot: string;
  room: string;
}

const SchedulePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Dummy data for demonstration
  const dummyCourses: Course[] = [
    {
      id: "1",
      courseId: "CS101",
      name: "Introduction to Computer Science",
      description: "Basic programming concepts and computer science fundamentals",
      facultyId: "f1",
      facultyName: "Dr. John Smith",
      isEnabled: true
    },
    {
      id: "2",
      courseId: "MATH201",
      name: "Calculus II",
      description: "Advanced calculus concepts including integration and series",
      facultyId: "f2",
      facultyName: "Prof. Sarah Johnson",
      isEnabled: true
    },
    {
      id: "3",
      courseId: "PHYS101",
      name: "General Physics",
      description: "Introduction to mechanics, waves, and thermodynamics",
      facultyId: "f3",
      facultyName: "Dr. Michael Brown",
      isEnabled: true
    },
    {
      id: "4",
      courseId: "ENG102",
      name: "English Composition",
      description: "Writing skills and literature analysis",
      facultyId: "f4",
      facultyName: "Prof. Emily Davis",
      isEnabled: true
    },
    {
      id: "5",
      courseId: "CHEM101",
      name: "General Chemistry",
      description: "Basic chemical principles and laboratory techniques",
      facultyId: "f5",
      facultyName: "Dr. Robert Wilson",
      isEnabled: true
    }
  ];

  const timeSlots = [
    "9:00 AM - 10:30 AM",
    "10:45 AM - 12:15 PM",
    "1:15 PM - 2:45 PM",
    "3:00 PM - 4:30 PM",
    "4:45 PM - 6:15 PM"
  ];

  const rooms = ["Room A101", "Room B201", "Room C301", "Lab D401", "Hall E501"];

  useEffect(() => {
    // Load courses from localStorage or use dummy data
    const savedCourses = JSON.parse(localStorage.getItem('courses') || '[]');
    if (savedCourses.length > 0) {
      const enabledCourses = savedCourses.filter((course: Course) => course.isEnabled);
      setCourses(enabledCourses);
    } else {
      // Use dummy data if no courses in localStorage
      setCourses(dummyCourses);
      localStorage.setItem('courses', JSON.stringify(dummyCourses));
    }

    // Load previously generated schedule but don't show success message
    const savedSchedule = JSON.parse(localStorage.getItem('generatedSchedule') || '[]');
    setGeneratedSchedule(savedSchedule);
    setShowSuccessMessage(false);
  }, []);

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses(prev => [...prev, courseId]);
    } else {
      setSelectedCourses(prev => prev.filter(id => id !== courseId));
    }
  };

  const generateSchedule = () => {
    // Just mark as generated, no actual schedule creation
    return true;
  };

  const handleGenerate = async () => {
    if (selectedCourses.length === 0) {
      alert("Please select at least one course");
      return;
    }
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates");
      return;
    }
    if (fromDate >= toDate) {
      alert("From date must be before to date");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    generateSchedule();
    
    // Mark as generated and show success message
    setGeneratedSchedule([{ id: '1', courseId: '', courseName: '', facultyName: '', date: '', timeSlot: '', room: '' }]);
    setShowSuccessMessage(true);
    
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar currentPage="/admin/schedule" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
          <p className="text-gray-600 mt-2">Create and Manage a schedule for Exams</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Available Courses Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Courses
              </CardTitle>
              <CardDescription>
                Select a course to create schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="text-sm font-medium">Select Courses</label>
                
                {courses.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No courses available
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          id={course.id}
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) => handleCourseSelection(course.id, checked as boolean)}
                        />
                        <label
                          htmlFor={course.id}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          <div className="font-medium text-gray-900">
                            <span className="text-blue-600 font-semibold">{course.courseId}</span> - {course.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Faculty: {course.facultyName}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedCourses.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">
                    Selected Courses ({selectedCourses.length})
                  </h4>
                  <div className="text-sm text-blue-700 mt-2 space-y-1">
                    {selectedCourses.map(courseId => {
                      const course = courses.find(c => c.id === courseId);
                      return course ? (
                        <div key={courseId} className="flex justify-between items-center">
                          <span>{course.courseId} - {course.name}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Schedule Period
              </CardTitle>
              <CardDescription>
                Select the date range for the schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={setFromDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !toDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={setToDate}
                        initialFocus
                        disabled={(date) => fromDate ? date < fromDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {fromDate && toDate && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900">Selected Period</h4>
                  <p className="text-sm text-green-700 mt-1">
                    From {format(fromDate, "MMM dd, yyyy")} to {format(toDate, "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Duration: {Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Section */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Generate Schedule</CardTitle>
              <CardDescription>
                Create the schedule for Exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleGenerate}
                  className="w-full"
                  size="lg"
                  disabled={selectedCourses.length === 0 || !fromDate || !toDate || isGenerating}
                  variant={generatedSchedule.length > 0 ? "secondary" : "default"}
                >
                  {isGenerating ? "Generating..." : generatedSchedule.length > 0 ? "Generated ✓" : "Generate Schedule"}
                </Button>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Select one or more courses from available courses</p>
                  <p>• Choose start and end dates</p>
                  <p>• Click Generate to create schedule</p>
                </div>

                {(selectedCourses.length === 0 || !fromDate || !toDate) && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      {selectedCourses.length === 0 && "Select at least one course. "}
                      {!fromDate && "Choose start date. "}
                      {!toDate && "Choose end date. "}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {showSuccessMessage && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Schedule Generated Successfully!
                    </p>
                  </div>
                )}
      </div>
    </div>
  );
};

export default SchedulePage;
