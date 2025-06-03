import api from "@/service/api";
import axios from "axios";
import { Download, Loader2 } from "lucide-react";
import React, { useState, useEffect, useContext } from "react";

type Student = {
  assignmentGrades: AssignmentGrade[];
  averageGrade: number | null;
  progressPercentage: number;
  studentDepartment: string;
  studentEmail: string;
  studentName: string;
  studentRollNumber: string;
  studentSemester: string;
};

type AssignmentGrade = {
  assignmentTitle: string;
  grade: number;
};
type StudentProgressReportProps = {
  courseId: any;
};

// download report

const StudentProgressReport = ({ courseId }: StudentProgressReportProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const downloadCSV = (students: Student[]) => {
    // Prepare CSV headers
    setIsExporting(true);
    const headers = [
      "S.No",
      "Roll No",
      "Name",
      "Department",
      "Progress (%)",
      ...(students[0]?.assignmentGrades?.map(
        (assignment) => assignment.assignmentTitle || `Your Assignment`
      ) || []),
      "Average Grade",
    ];

    // Prepare CSV data rows
    const rows = students.map((student, index) => [
      index + 1,
      student.studentRollNumber,
      student.studentName,
      student.studentDepartment,
      student.progressPercentage,
      ...(student.assignmentGrades?.map(
        (assignment) => assignment.grade ?? "N/A"
      ) || []),
      student.averageGrade ?? "N/A",
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `student_progress_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsExporting(false);
  };

  useEffect(() => {
    // Fetch student progress data when component mounts
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        // Replace 'courseId' with the actual course ID variable or value
        // fetch progress details
        const response = await api.get(
          `/submissions/courses/${courseId}/student-progress`
        );
        const formattedStudents = response.data.students.map(
          (student: any) => ({
            ...student,
            assignmentGrades:
              student.assignmentGrades?.map((grade: any) => ({
                grade: grade.grade,
                assignmentTitle: grade.assignmentTitle || `Your Assignment`, // Fallback title
              })) || [],
          })
        );
        setStudents(formattedStudents);

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error fetching progress data:", error);
      }
    };

    fetchProgressData();
  }, []);
// rendered table
  const renderAssignmentGrades = (student: Student) => {
    return (
      <div key={student.studentRollNumber}>
        <table className="min-w-full divide-y ">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Roll No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Progress
              </th>

              {/* Dynamic Assignment Columns */}
              {students[0]?.assignmentGrades?.map((assignment) => (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  {assignment.assignmentTitle}
                </th>
              ))}

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Average Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student, index) => (
              <tr key={student.studentRollNumber}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentRollNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.studentDepartment}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.progressPercentage}%
                </td>

                {/* Dynamic Assignment Grades */}
                {student.assignmentGrades?.map((assignment) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {assignment.grade !== null ? `${assignment.grade}` : "N/A"}
                  </td>
                ))}

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.averageGrade ?? "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


 // return table if it available
  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="flex justify-center items-center py-8 text-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between mb-3">
            <h2 className="text-2xl font-bold">Student Progress Report</h2>
            {students.length > 0 && (
              <button
                onClick={() => downloadCSV(students)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  {isExporting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  {isExporting ? "Exporting..." : "Download Report"}
                </span>
              </button>
            )}
          </div>

          {students.length > 0 ? (
            students.map(renderAssignmentGrades)
          ) : (
            <p>No student data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentProgressReport;
