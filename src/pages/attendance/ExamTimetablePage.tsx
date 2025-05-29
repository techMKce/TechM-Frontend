import { useState, useEffect } from "react";
import Navbar from "@/components/StudentNavbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/service/api";

interface ExamInfo {
  Date: string;
  Session: string;
  Time: string;
  "Course ID": string;
  "Course Name": string;
}

const ExamTimetablePage = () => {
  const [userType] = useState<"student" | "faculty">("faculty");
  const [userName] = useState(userType === "faculty" ? "Dr. Jane Smith" : "John Doe");
  const [examData, setExamData] = useState<ExamInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await api.get("/getexam");
        const apiData = response.data;
        
        // Map API data to our expected format
        const formattedData = apiData.map((exam: any) => ({
          Date: exam.date,
          Session: exam.session,
          Time: exam.timeSlot,
          "Course ID": exam.courseId,
          "Course Name": exam.courseName
        }));
        
        setExamData(formattedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching exam data:", error);
        toast.error("Failed to load exam timetable");
        setIsLoading(false);
      }
    };
    fetchExamData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const generatePDF = async () => {
    if (examData.length === 0) {
      toast.error("No exam data available to download");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Load and add logo
      try {
        const logoUrl = '/public/logo.jpeg'; 
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const base64Image = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        
        // Add logo
        doc.addImage(base64Image, 'JPEG', 12, 10, 35, 25);
        
        // Add institution info on the right in bold
        doc.setFontSize(16);
        doc.setFont("helvetica"); 
        doc.setFont("bold");
        doc.setTextColor(0, 0, 0); // Black color
        doc.text('KARPAGAM INSTITUTIONS', 80, 25);
        
        
      } catch (imgError) {
        console.error("Error loading logo:", imgError);
        // Fallback: Add text if image fails
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('KARPAGAM INSTITUTIONS', 105, 20);
      }

      // Title
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text("Exam Timetable", 14, 40); // Position adjusted for header
      
      // Table data
      const headers = [['Date', 'Session', 'Time', 'Course ID', 'Course Name']];
      const tableData = examData.map(exam => [
        formatDate(exam.Date),
        exam.Session,
        exam.Time,
        exam["Course ID"],
        exam["Course Name"]
      ]);
      
      // Generate table (startY adjusted for header space)
      autoTable(doc, {
        head: headers,
        body: tableData,
        startY: 45,
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'middle',
          textColor: [40, 40, 40]
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 45 } // Ensure table doesn't overlap header
      });
      
      // Save the PDF
      doc.save('exam-timetable.pdf');
      toast.success("Exam timetable downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Exam Timetable</h1>
          <p className="text-secondary mt-2">View and download exam schedules</p>
        </div>
        
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Exam Timetable</CardTitle>
              <CardDescription>
                Below is the exam timetable for the current semester. You can download it as a PDF.
              </CardDescription>
            </div>
            <Button
              onClick={generatePDF}
              disabled={isLoading || examData.length === 0}
              className="bg-primary hover:bg-primary-dark flex items-center gap-2"
              size="sm"
            >
              <Download size={16} />
              Download PDF
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="mt-4 text-secondary">Loading exam timetable...</p>
              </div>
            ) : examData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="px-6 py-3 text-sm font-medium text-primary">Date</th>
                      <th className="px-6 py-3 text-sm font-medium text-primary">Session</th>
                      <th className="px-6 py-3 text-sm font-medium text-primary">Time</th>
                      <th className="px-6 py-3 text-sm font-medium text-primary">Course ID</th>
                      <th className="px-6 py-3 text-sm font-medium text-primary">Course Name</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {examData.map((exam, index) => (
                      <tr key={index} className="hover:bg-light">
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2 text-secondary" />
                            {formatDate(exam.Date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-secondary">{exam.Session}</td>
                        <td className="px-6 py-4 text-secondary">{exam.Time}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs rounded-full bg-accent-light/30 text-accent">
                            {exam["Course ID"]}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">{exam["Course Name"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-secondary opacity-30" />
                <p className="mt-4 text-secondary">No exam schedule available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ExamTimetablePage;