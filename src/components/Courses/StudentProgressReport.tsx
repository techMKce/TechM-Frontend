import api from "@/service/api";
import axios from "axios";
import React, { useState, useEffect , useContext} from "react";

type Student = {
    studentRollNumber: string;
    studentName: string;    
    studentDepartment: string;
    progressPercentage: number;
    averageGrade: string | number;
};
type StudentProgressReportProps = {
  courseId : any;
};



const StudentProgressReport = ({ courseId }: StudentProgressReportProps) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch student progress data when component mounts
        const fetchProgressData = async () => {
            try {
                setLoading(true);
                // Replace 'courseId' with the actual course ID variable or value
                const response = await api.get(`/submissions/courses/${courseId}/student-progress`);
                setStudents(response.data.students);

                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching progress data:', error);
            }
        };

        fetchProgressData();
    }, []);

    return (
        <div className="overflow-x-auto">
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
                </div>
            ) : (
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Grade</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students.map((student, index) => (
                            <tr key={student.studentRollNumber}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentRollNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.studentDepartment}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.progressPercentage}%</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.averageGrade}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}  
        </div>
    );
};

export default StudentProgressReport;



