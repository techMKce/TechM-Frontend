
import React from "react";
import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: "submit" | "submitted" | "graded";
  submittedFile?: string;
  grade?: string;
  feedback?: string;
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  return (
    <Card className="hover:shadow-lg transition-all">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{assignment.title}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Calendar size={16} />
              <span>{formatDate(assignment.dueDate)}</span>
            </div>

            {assignment.status === "graded" && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  <strong>File:</strong> {assignment.submittedFile}
                </p>
                <p>
                  <strong>Grade:</strong> {assignment.grade}
                </p>
                <p>
                  <strong>Feedback:</strong> {assignment.feedback}
                </p>
              </div>
            )}
          </div>

          <div className="text-right">
            {assignment.status === "submit" && (
              <Link
                to={`/student/assignments/${assignment.id}/submit`}
                className="inline-block px-3 py-1 rounded text-sm font-medium bg-primary text-white"
              >
                View
              </Link>
            )}

            {assignment.status === "submitted" && (
              <span className="inline-block px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-700">
                <Link to={`/student/assignments/${assignment.id}/resubmit`}>
                  Submitted
                </Link>
              </span>
            )}

            {assignment.status === "graded" && (
              <span className="inline-block px-3 py-1 rounded text-sm font-medium bg-gray-300 text-gray-600 cursor-not-allowed">
                Graded
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentCard;
