
import React from 'react';

import FacultyNavbar from "@/components/FacultyNavbar";
import { useAssignmentManager } from './Assignments/hooks/useAssignmentManager';
import AssignmentHeader from '../../components/assignment/AssignmentHeader';
import AssignmentFilters from '../../components/assignment/AssignmentFilters';
import AssignmentStats from '../../components/assignment/AssignmentStats';
import AssignmentGrid from '../../components/assignment/AssignmentGrid';
import AssignmentForm from './Assignments/AssignmentForm';
import GradingDialog from './Assignments/GradingDialog';
import GradesView from './/Assignments/GradesView';

const AssignmentManager: React.FC = () => {
  const {
    assignments,
    filteredAssignments,
    isFormOpen,
    setIsFormOpen,
    editingAssignment,
    gradingAssignment,
    showGrades,
    setShowGrades,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterPriority,
    setFilterPriority,
    handleCreateAssignment,
    handleUpdateAssignment,
    handleDeleteAssignment,
    handleEditAssignment,
    handleGradeAssignment,
    handleSubmitGrade,
    handleCloseForm,
    handleCloseGrading
  } = useAssignmentManager();

  if (showGrades) {
    return <GradesView assignments={assignments} onBack={() => setShowGrades(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FacultyNavbar />
      <div className="max-w-7xl mx-auto space-y-6 mt-4">
        <AssignmentHeader
          onNewAssignment={() => setIsFormOpen(true)}
          onShowGrades={() => setShowGrades(true)}
        />

        <AssignmentFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          filterPriority={filterPriority}
          onPriorityChange={setFilterPriority}
        />

        <AssignmentStats assignments={assignments} />

        <div className="space-y-4">
          <AssignmentGrid
            assignments={filteredAssignments}
            searchTerm={searchTerm}
            filterStatus={filterStatus}
            filterPriority={filterPriority}
            onEdit={handleEditAssignment}
            onDelete={handleDeleteAssignment}
            onGrade={handleGradeAssignment}
            onNewAssignment={() => setIsFormOpen(true)}
          />
        </div>

        <AssignmentForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSubmit={editingAssignment ? handleUpdateAssignment : handleCreateAssignment}
          editingAssignment={editingAssignment}
        />

        <GradingDialog
          isOpen={!!gradingAssignment}
          onClose={handleCloseGrading}
          onSubmit={handleSubmitGrade}
          assignment={gradingAssignment}
        />
      </div>
    </div>
  );
};

export default AssignmentManager;