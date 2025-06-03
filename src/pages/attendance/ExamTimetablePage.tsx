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

  const todayDateStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const response = await api.get("/attendance/getexam");
        const apiData = response.data;

        const formattedData = apiData.map((exam: any) => ({
          Date: exam.date,
          Session: exam.session,
          Time: exam.timeSlot,
          "Course ID": exam.courseId,
          "Course Name": exam.courseName,
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
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getTodayExams = () => examData.filter((e) => e.Date === todayDateStr);
  const getUpcomingExams = () =>
    examData.filter((e) => new Date(e.Date) > new Date(todayDateStr));
  const getCompletedExams = () =>
    examData.filter((e) => new Date(e.Date) < new Date(todayDateStr));

  const renderExamTable = (exams: ExamInfo[]) => {
    return (
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
            {exams.map((exam, index) => (
              <tr key={index} className="hover:bg-light">
                <td className="px-6 py-4 font-medium">
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-2" />
                    {formatDate(exam.Date)}
                  </div>
                </td>
                <td className="px-6 py-4">{exam.Session}</td>
                <td className="px-6 py-4">{exam.Time}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-accent-light/30">
                    {exam["Course ID"]}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{exam["Course Name"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const generatePDF = async () => {
  if (examData.length === 0) {
    toast.error("No exam data available to download");
    return;
  }

  try {
    const doc = new jsPDF();

    // === Add Institution Logo & Header ===
    try {
      const logoUrl = "/public/Karpagam_Logo-removebg-preview.png";
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Add logo image (centered horizontally)
      const pageWidth = doc.internal.pageSize.getWidth();
      const logoWidth = 60;
      const logoHeight = 20;
      const logoX = (pageWidth - logoWidth) / 2;
      const logoY = 10;

      doc.addImage(base64Image, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Institution Name below the logo
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("KARPAGAM INSTITUTIONS", pageWidth / 2, logoY + logoHeight + 8, {
        align: "center",
      });
    } catch (logoError) {
      console.error("Logo load error:", logoError);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("KARPAGAM INSTITUTIONS", doc.internal.pageSize.getWidth() / 2, 30, {
        align: "center",
      });
    }

    // === Add Document Title ===
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text("Exam Timetable", doc.internal.pageSize.getWidth() / 2, 50, {
      align: "center",
    });

    // === Prepare Table Data ===
    const headers = [["Date", "Session", "Time", "Course ID", "Course Name"]];
    const tableData = examData.map((exam) => [
      formatDate(exam.Date),
      exam.Session,
      exam.Time,
      exam["Course ID"],
      exam["Course Name"],
    ]);

    // === Generate Table ===
    autoTable(doc, {
      head: headers,
      body: tableData,
      startY: 60,
      margin: { left: 14, right: 14 },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        valign: "middle",
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // === Save PDF ===
    doc.save("exam-timetable.pdf");
    toast.success("Exam timetable downloaded successfully");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
  }
};


  const todayExams = getTodayExams();
  const upcomingExams = getUpcomingExams();
  const completedExams = getCompletedExams();

  return (
    <>
      <Navbar />
      <div className="page-container max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Exam Timetable</h1>
          <p className="mt-2">View and download exam schedules</p>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>All Exams</CardTitle>
              <CardDescription>Download full exam schedule as PDF</CardDescription>
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
              <>
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2"> Today’s Exams</h2>
                  {todayExams.length > 0 ? renderExamTable(todayExams) : <p className="text-sm">No exams today.</p>}
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2"> Upcoming Exams</h2>
                  {upcomingExams.length > 0 ? renderExamTable(upcomingExams) : <p className="text-sm">No upcoming exams.</p>}
                </div>

                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-2"> Completed Exams</h2>
                  {completedExams.length > 0 ? renderExamTable(completedExams) : <p className="text-sm">No completed exams.</p>}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto opacity-30" />
                <p className="mt-4">No exam schedule available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ExamTimetablePage;
