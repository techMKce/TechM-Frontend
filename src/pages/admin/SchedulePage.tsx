import AdminNavbar from "@/components/AdminNavbar";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import api from "../../service/api";
import { toast } from "@/hooks/use-toast";


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
  fromDate: string;
  toDate: string;
}

const SchedulePage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduleEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get("/course/active");
        const data = response.data;

        if (!Array.isArray(data)) {
          setCourses([]);
          return;
        }

        const mappedCourses: Course[] = data.map((item: any) => ({
          id: String(item.course_id),
          courseId: item.courseTitle,
          name: item.courseTitle,
          description: item.courseDescription,
          facultyId: "",
          facultyName: item.instructorName,
          isEnabled: item.isActive,
        }));

        const enabledCourses = mappedCourses.filter((course) => course.isEnabled);
        setCourses(enabledCourses);
      } catch (error) {
        setCourses([]);
      }
    };

    fetchCourses();

    const savedSchedule = JSON.parse(localStorage.getItem("generatedSchedule") || "[]");
    setGeneratedSchedule(savedSchedule);
    setShowSuccessMessage(false);
  }, []);

  const handleCourseSelection = (courseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses((prev) => [...prev, courseId]);
    } else {
      setSelectedCourses((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const handleGenerate = async () => {
    if (selectedCourses.length === 0) {

      toast({ title: "Please select at least one course", variant: "destructive" });
      return;
    }
    if (!fromDate || !toDate) {
      toast({ title: "Please select both from and to dates", variant: "warning" });
      return;
    }
    if (fromDate >= toDate) {
      toast({ title: "From date must be before to date", variant: "destructive" });

      return;
    }

    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const schedule = selectedCourses.map((courseId, index) => {
      const course = courses.find((c) => c.id === courseId);
      return {
        id: (index + 1).toString(),
        courseId: course?.id || "",
        courseName: course?.name || "",
        facultyName: course?.facultyName || "",
        fromDate: fromDate.toISOString().split("T")[0],
        toDate: toDate.toISOString().split("T")[0],
      };
    });

    const formData = new FormData();
    const courseArray = schedule.map(entry => ({
      courseId: entry.courseId,
      name: entry.courseName,
    }));
    const duration = {
  startDate: new Date(new Date(fromDate).setDate(fromDate.getDate() + 1)).toISOString().split("T")[0],
  endDate: new Date(new Date(toDate).setDate(toDate.getDate() + 1)).toISOString().split("T")[0],
};


    formData.append("courses", JSON.stringify(courseArray));
    formData.append("duration", JSON.stringify(duration));

    try {
      const response = await api.post('/attendance/postexam', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if(response.data=="Warning: Not all courses were scheduled.\nChoose a valid date range based on course counts.")
        toast({ title: "Warning: Not all courses were scheduled. Choose a valid date range based on course counts.", variant: "warning" });
      else{
          toast({ title: `Schedule data prepared for ${courseArray.length} course(s)`, variant: "default" });
          toast({ title: `Upload successful: ${response.data}`, variant: "default" });
          setGeneratedSchedule(response.data);
          setShowSuccessMessage(true);
          toast({ title: "Schedule uploaded successfully", variant: "default" });
      }
    } catch (error) {

      toast({ title: "Failed to upload schedule", variant: "destructive" });

    } finally {
      setIsGenerating(false);
    }
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
          {/* Available Courses */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Available Courses
              </CardTitle>
              <CardDescription>Select a course to create schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="text-sm font-medium">Select Courses</label>
                {courses.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No courses available</div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={course.id}
                          checked={selectedCourses.includes(course.id)}
                          onCheckedChange={(checked) =>
                            handleCourseSelection(course.id, checked as boolean)
                          }
                        />
                        <label htmlFor={course.id} className="flex-1 cursor-pointer text-sm">
                          <div className="font-medium text-gray-900">
                            <span className="text-blue-600 font-semibold">
                              {course.id}
                            </span>{" "}
                            - {course.name}
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
                    {selectedCourses.map((courseId) => {
                      const course = courses.find((c) => c.id === courseId);
                      return course ? (
                        <div key={courseId}>
                          {course.courseId} - {course.name}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Period */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Schedule Period
              </CardTitle>
              <CardDescription>Select the date range for the schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* From Date */}
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
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* To Date */}
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
                        disabled={(date) => (fromDate ? date < fromDate : false)}
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

          {/* Generate Button */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Generate Schedule</CardTitle>
              <CardDescription>Create the schedule for Exams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleGenerate}
                  className="w-full"
                  size="lg"
                  disabled={isGenerating}
                  variant={generatedSchedule.length > 0 ? "secondary" : "default"}
                >
                  {isGenerating ? "Generating..." : "Generate Schedule"}
                </Button>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Select one or more courses</p>
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

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="p-3 mt-6 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800 font-medium">✓ Schedule Generated Successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default SchedulePage;
