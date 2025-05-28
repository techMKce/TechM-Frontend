
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye } from 'lucide-react';

interface AssignmentHeaderProps {
  onNewAssignment: () => void;
  onShowGrades: () => void;
}

const AssignmentHeader: React.FC<AssignmentHeaderProps> = ({
  onNewAssignment,
  onShowGrades
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignment Manager</h1>
          <p className="text-gray-600 mt-1">Create, manage, and track student assignments</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onShowGrades}
            variant="outline"
            className="bg-grey-50 hover:bg-grey-100 text-grey-700 border-grey-200"
          >
            <Eye className="h-4 w-4 mr-2" />
            Show Grades
          </Button>
          <Button
            onClick={onNewAssignment}
            className="bg-black hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentHeader;
