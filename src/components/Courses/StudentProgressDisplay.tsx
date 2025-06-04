import axios from "axios";
import api from "@/service/api"; // Adjust the import path as necessary
import React, { useState, useEffect, useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
import { useAuth } from "@/hooks/useAuth";
type StudentProgressDisplayProps = {
  courseId: string;
  studentId: string;
};
type Student = {
  studentRollNumber: string;
  studentName: string;
  studentDepartment: string;
  progressPercentage: number;
  attendancePercentage: number;
  averageGrade: string | number;
};

type AttendanceRecord = {
  batch: string;
  courseId: string;
  courseName: string;
  deptId: string;
  deptName: string;
  percentage: number;
  presentcount: number;
  sem: number;
  stdId: string;
  stdName: string;
  totaldays: number;
};

function useStudentProgress(courseId: string, studentId: string) {
  const [progresPercentage, setProgresPercentage] = useState(0);
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);

        // Replace 'courseId' with the actual course ID variable or value
        const response = await api.get(
          `/submissions/courses/${courseId}/student-progress`
        );
        const attendanceResponse = await api.get(
          `/attendance/getstudentbyid?id=CS124`
        );

        const userProgress = response.data.students.find(
          (student: Student) =>
            student.studentRollNumber === profile?.profile?.id
        );

        const attendanceProgress = attendanceResponse.data.find(
          (record: AttendanceRecord) =>
            record.stdId === studentId && record.courseId === courseId
            // record.stdId === "CS124" && record.courseId === "17"
        );

        // set user course progress
        setProgresPercentage(
          userProgress ? userProgress.progressPercentage : 0
        );
        // set attendance
        setAttendancePercentage(
          attendanceProgress ? attendanceProgress.percentage : 0
        );

        setLoading(false);
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [courseId, studentId]);

  return { progresPercentage, loading, error, attendancePercentage };
}

export const StudentProgressDisplay = ({
  courseId,
  studentId,
}: StudentProgressDisplayProps) => {
  const { progresPercentage, loading, error, attendancePercentage } =
    useStudentProgress(courseId, studentId);

  if (loading) {
    return <div className="text-center py-4">Loading progress...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center py-4">{error}</div>;
  }

  return (
    <div className="mb-1">
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-800 font-medium">
            Percentage Completed
          </span>
          <span className="text-sm text-gray-800 font-bold">
            {progresPercentage} %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gray-800 to-gray-800 h-3 rounded-full transition-all"
            style={{ width: `${progresPercentage}%` }}
          ></div>
        </div>
      </div>
      <div>
        <div className="flex justify-between mt-5">
          <span className="text-sm text-gray-800 font-medium">
            Attendance Percentage
          </span>
          <span className="text-sm text-gray-800 font-bold">
            {attendancePercentage} %
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-gray-800 to-gray-800 h-3 rounded-full transition-all"
            style={{ width: `${attendancePercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
export default StudentProgressDisplay;
