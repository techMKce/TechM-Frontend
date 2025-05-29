
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Assignment } from '../../pages/faculty/Assignments/Assignments';
import AssignmentCard from '../../pages/faculty/Assignments/AssignmentCard';

interface AssignmentGridProps {
  assignments: Assignment[];
  searchTerm: string;
  filterStatus: string;
  filterPriority: string;
  onEdit: (assignment: Assignment) => void;
  onDelete: (id: string) => void;
  onGrade: (assignment: Assignment) => void;
  onNewAssignment: () => void;
}

const AssignmentGrid: React.FC<AssignmentGridProps> = ({
  assignments,
  searchTerm,
  filterStatus,
  filterPriority,
  onEdit,
  onDelete,
  onGrade,
  onNewAssignment
}) => {
  if (assignments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Plus className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
            ? 'Try adjusting your search or filters'
            : 'Create your first assignment to get started'}
        </p>
        {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
          <Button onClick={onNewAssignment} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assignments.map(assignment => (
        <AssignmentCard
          key={assignment.id}
          assignment={assignment}
          onEdit={onEdit}
          onDelete={onDelete}
          onGrade={onGrade}
        />
      ))}
    </div>
  );
};

export default AssignmentGrid;
