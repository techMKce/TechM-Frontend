// All "black" color classes changed to "gray-800"
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";
import SectionContent from "./SectionContent";

import {
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import DisplayAssignments from "./DisplayAssignments";
import StudentProgressReport from "./StudentProgressReport";
import StudentProgressDisplay from "./StudentProgressDisplay";
import api from "@/service/api";
import StudentNavbar from "../StudentNavbar";
import FacultyNavbar from "../FacultyNavbar";
import { isAsyncFunction } from "node:util/types";
// import { toast } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Section } from "lucide-react";

function ViewCourse() {
  const { profile } = useAuth();
  const role = profile.profile.role;
  const { id } = useParams();
  const { state } = useLocation();
  const [course, setCourse] = useState<Course>(state?.course);
  const [currentCourseId, setCurrentCourseId] = useState(
    state?.course.course_id
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    course_id: "",
    courseTitle: "",
    courseDescription: "",
    instructorName: "",
    dept: "",
    duration: "0",
    credit: "0",
    isActive: true,
  });

  const [newSection, setNewSection] = useState({
    sectionTitle: "",
    sectionDesc: "",
  });

  const [editingSectionId, setEditingSectionId] = useState(null);
  const [sectionEditData, setSectionEditData] = useState({
    section_id: 0,
    sectionTitle: "",
    sectionDesc: "",
    createdAt: null,
    updatedAt: null,
    course: { course_id: null },
  });

  const [currentSectionId, setCurrentSectionId] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showSection, setShowSection] = useState(true);
  const [showAssignments, setShowAssignments] = useState(false);
  type Section = {
    section_id: number;
    sectionTitle: string;
    sectionDesc: string;
    createdAt: string | null;
    updatedAt: string | null;
    course?: { course_id: number | null };
  };

  const [courseSection, setCourseSection] = useState<Section[]>([]);
  const [loading, setLoading] = useState(!state?.course);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState(null);
  const isInitialRender = useRef(false);
  const courseRef = useRef(course);
  const [isEnrolled, setIsEnrolled] = useState(
    role === "FACULTY" || role === "ADMIN"
  );

  // Initial fetch for course details/section
  useEffect(() => {
    if (!course?.course_id) {
      return;
    }
    const fetchSection = async () => {
      try {
        setLoading(true);

        const sectionResponse = await api.get(
          `/course/section/details?id=${course.course_id}`
        );

        const courseResponse = await api.get(`/course/detailsbyId?id=${course.course_id}`)

        // console.log("receive courseResponse: ", courseResponse);
        setCourse(courseResponse.data[0]);  

        const sections = Array.isArray(sectionResponse.data)
          ? sectionResponse.data
          : [sectionResponse.data];

        setCourseSection(sections); // Update state
        // console.log("course details: ", course)
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchSection();

    const enrollmentSatus = async () => {
      if (profile.profile.role === "STUDENT") {
        const enrolled = await api.get(
          `/course-enrollment/check/${course.course_id}/${profile.profile.id}`
        );
        setIsEnrolled(enrolled.data);
      }
    };
    enrollmentSatus();
    // eslint-disable-next-line
  }, [course?.course_id, newSection]);

  // course editing
  const handleEditCourse = () => {
    setEditData({
      course_id: course.course_id,
      courseTitle: course.courseTitle || "",
      courseDescription: course.courseDescription || "",
      instructorName: course.instructorName || "",
      dept: course.dept || "",
      duration: course.duration?.toString() || "0",
      credit: course.credit?.toString() || "0",
      isActive: course.isActive !== undefined ? course.isActive : true,
    });
    setIsEditing(true);
  };
  // Ensure user.role is typed as string or a union of all possible roles

  // save updated course data
  interface EditData {
    course_id: string;
    courseTitle: string;
    courseDescription: string;
    instructorName: string;
    dept: string;
    duration: number;
    credit: number;
    isActive: boolean;
  }

  interface Course {
    course_id: string;
    courseCode: string;
    courseTitle: string;
    courseDescription: string;
    instructorName: string;
    dept: string;
    duration: number;
    credit: number;
    isActive: boolean;
    image?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
  }

  const handleSaveCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Track latest value
    try {
      // Prepare the data for API request
      const updatedCourse = {
        ...course,
        ...editData,
        duration: parseInt(editData.duration),
        credit: parseInt(editData.credit),
      };
      // Make PUT request to update the course

      await api.put("/course/update", updatedCourse);

      setIsEditing(false);
      setCourse(updatedCourse);
      toast.success("Updated Successfully");
    } catch (error: any) {
      toast.error("Failed to update course. Please try again.");
    } finally {
      // This shows the state value AT THE TIME OF RENDER

      // For the actual updated value, use a ref

      courseRef.current = course;
    }
  };
  // handle add new section
  const handleAddSection = async () => {
    try {
      // Prepare the request body
      const requestBody = {
        sectionTitle: newSection.sectionTitle,
        sectionDesc: newSection.sectionDesc,
        course: { course_id: course.course_id },
      };
      // Make API call to add section
      const response = await api.post("/course/section/add", requestBody);
      // If the API returns the newly created section
      const createdSection = response.data;
      // Update local state with the new section
      setCourseSection((prevSections) => [
        ...prevSections,
        {
          section_id: Number(createdSection.section_id),
          sectionTitle: createdSection.sectionTitle,
          sectionDesc: createdSection.sectionDesc,
          createdAt: createdSection.createdAt || new Date().toISOString(),
          updatedAt: createdSection.updatedAt || new Date().toISOString(),
        },
      ]);
      // Reset form
      setNewSection({ sectionTitle: "", sectionDesc: "" });
      setShowAddSection(false);
    } catch (error) {}
  };

  const handleEditSection = (section) => {
    setEditingSectionId(section.section_id);
    setSectionEditData({
      section_id: section.section_id,
      sectionTitle: section.sectionTitle,
      sectionDesc: section.sectionDesc,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
      course: { course_id: course.course_id },
    });
  };
  // handle save section - called by handle edit section
  const handleSaveSection = async (e) => {
    e.preventDefault();

    try {
      // Get the current timestamp for updatedAt
      const now = new Date().toISOString();

      const payload = {
        section_id: sectionEditData.section_id,
        sectionTitle: sectionEditData.sectionTitle,
        sectionDesc: sectionEditData.sectionDesc,
        createdAt: sectionEditData.createdAt,
        updatedAt: now,
        course: { course_id: course.course_id },
      };

      const response = await api.put("/course/section/update", payload);
      setCourseSection((prevSections) =>
        prevSections.map((section) =>
          section.section_id === sectionEditData.section_id
            ? {
                ...section,
                sectionTitle: payload.sectionTitle,
                sectionDesc: payload.sectionDesc,
                updatedAt: payload.updatedAt,
              }
            : section
        )
      );

      setEditingSectionId(null);
      setSectionEditData({
        section_id: 0,
        sectionTitle: "",
        sectionDesc: "",
        createdAt: null,
        updatedAt: null,
        course: { course_id: null },
      });
      toast.success("Section Edit Successfully");
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to update section"
      );
    }
  };
  // handle delete / remove section (delete icon)
  const handleRemoveSection = async (sectionId) => {
    if (window.confirm("Are you sure you want to delete this section?")) {
      try {
        const requestBody = String(sectionId);
        await api.delete(`/course/section/delete`, {
          data: requestBody,
          headers: {
            "Content-Type": "text/plain",
          },
        });

        setCourseSection((prevSections) =>
          prevSections.filter((s) => s.section_id !== sectionId)
        );
      } catch (error) {
        if (error) {
          toast.error("Failed to delete section");
        } else {
          toast.error("An unexpected error occurred");
        }
      }
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    const response = await api.post("/course-enrollment", {
      courseId: course.course_id,
      rollNum: profile.profile.id,
    });
    if (response.status === 200) {
      setIsEnrolled(true);
      toast.success("Enrolled Successfully", {
        description: `You have successfully enrolled in ${course.courseTitle}.`,
      });
    } else {
      toast.error("Enrollment Failed", {
        description: "An error occurred during enrollment",
      });
    }
    setLoading(false);
  };

  // if (course == null) return <div className="text-center py-10">Loading course...</div>;

  return (
    <>
      {profile.profile.role == "STUDENT" ? (
        <StudentNavbar />
      ) : (
        <FacultyNavbar />
      )}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Edit Course Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">
                Edit Course
              </h2>
              <form onSubmit={handleSaveCourse}>
                <div className="mb-5">
                  <label className="block text-gray-800 mb-2 font-medium">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editData.courseTitle}
                    onChange={(e) =>
                      setEditData({ ...editData, courseTitle: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-gray-800 mb-2 font-medium">
                    Description
                  </label>
                  <textarea
                    value={editData.courseDescription}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        courseDescription: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                    rows={3}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-gray-800 mb-2 font-medium">
                      Duration{" "}
                      <span className="text-sm">(auto-calculated)</span>
                    </label>
                    <input
                      type="text"
                      value={`${editData.duration || 0} hours`} // Display as "30 hours"
                      readOnly // Prevent manual editing
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-800 mb-2 font-medium">
                      Credits
                    </label>
                    <input
                      type="number"
                      value={editData.credit}
                      onChange={(e) => {
                        const credits = e.target.value;
                        setEditData({
                          ...editData,
                          credit: credits,
                          duration: (Number(credits) * 15).toString(), // 1 credit = 15 duration
                        });
                      }}
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                      placeholder="e.g., 2"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-5 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side (Course Content) */}
          <div className="w-full lg:w-[70%]">
            {/* Course Header */}
            <div className="flex flex-col md:flex-row gap-8 mb-10">
              <div className="md:w-1/3 relative">
                <img
                  src={
                    course?.imageUrl ||
                    "https://via.placeholder.com/300x200.png?text=Course+Image"
                  }
                  alt={course?.courseTitle}
                  className="w-full rounded-xl shadow-md border border-gray-200"
                />
              </div>
              {/* Left side course details */}
              <div className="md:w-2/3">
                <h1 className="text-4xl font-extrabold mb-3 text-gray-800">
                  {course.courseTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gray-200 text-gray-900 rounded-full text-xs font-semibold">
                    {course.dept}
                  </span>
                  <span className="text-gray-600 text-sm">
                    Couse Code:{" "}
                    <span className="text-gray-600 text-sm">
                      {course.courseCode}
                    </span>
                  </span>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="text-gray-600 text-sm">
                      By{" "}
                      <span className="text-red-600">
                        {course.instructorName}
                      </span>
                    </span>
                    <span className="text-gray-600 text-sm">
                      Duration: {`${course.duration} Hours`}
                    </span>
                    <span className="text-gray-600 text-sm">
                      Credits: {course.credit}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="text-gray-600 text-sm">
                        Created:{" "}
                        {new Date(course.createdAt).toLocaleDateString()}
                      </span>
                      {course.updatedAt && (
                        <span className="text-gray-600 text-sm">
                          Updated:{" "}
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <pre className="font-sans mb-4 text-gray-800 whitespace-pre-wrap break-words max-h-[9em] overflow-y-auto">
                  {course.courseDescription}
                </pre>
                {!isEnrolled && role === "STUDENT" ? (
                  <button
                    onClick={handleEnroll}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900 transition font-bold cursor-pointer"
                  >
                    {loading ? "Enrolling..." : "Enroll Now"}
                  </button>
                ) : (
                  (role === "FACULTY" || role === "ADMIN") &&
                  profile.profile.name === course.instructorName && (
                    <div className="bg-green-400 text-gray-900 px-4 py-2 rounded-xl inline-block font-semibold shadow">
                      You have edit access
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Toggle between Sections and Assignments and View report button */}
            <div className="flex mb-4 border-b border-gray-200">
              {role === "FACULTY" && (
                <button
                  onClick={() => {
                    setShowSection(true);
                    setShowAssignments(false);
                    setShowReport(false);
                  }}
                  className={`px-4 py-2 font-medium ${
                    showSection
                      ? "text-gray-800 border-b-2 border-gray-800"
                      : "text-gray-500"
                  }`}
                >
                  Sections
                </button>
              )}
              {isEnrolled && role === "STUDENT" && (
                <button
                  onClick={() => {
                    setShowSection(true);
                    setShowAssignments(false);
                    setShowReport(false);
                  }}
                  className={`px-4 py-2 font-medium ${
                    showSection
                      ? "text-gray-800 border-b-2 border-gray-800"
                      : "text-gray-500"
                  }`}
                >
                  Sections
                </button>
              )}
              {role === "FACULTY" &&
                profile.profile.name === course.instructorName && (
                  <button
                    onClick={() => {
                      setShowSection(false);
                      setShowAssignments(true);
                      setShowReport(false);
                    }}
                    className={`px-4 py-2 font-medium ${
                      showAssignments
                        ? "text-gray-800 border-b-2 border-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    Assignments
                  </button>
                )}
              {isEnrolled && role === "STUDENT" && (
                <button
                  onClick={() => {
                    setShowSection(false);
                    setShowAssignments(true);
                    setShowReport(false);
                  }}
                  className={`px-4 py-2 font-medium ${
                    showAssignments
                      ? "text-gray-800 border-b-2 border-gray-800"
                      : "text-gray-500"
                  }`}
                >
                  Assignments
                </button>
              )}
              {role === "FACULTY" &&
                profile.profile.name === course.instructorName && (
                  <button
                    onClick={() => {
                      setShowSection(false);
                      setShowAssignments(false);
                      setShowReport(true);
                    }}
                    className={`px-4 py-2 font-medium ${
                      showReport
                        ? "text-gray-800 border-b-2 border-gray-800"
                        : "text-gray-500"
                    }`}
                  >
                    View Report
                  </button>
                )}
            </div>
            {/* handle add section */}
            {showSection && (
              <>
                {(isEnrolled || role === "FACULTY" || role === "ADMIN") && (
                  <div className="mt-4">
                    {(role === "FACULTY" || role === "ADMIN") && (
                      <div className="mb-4">
                        {showAddSection && (
                          <div className="mt-4 p-6 bg-gray-100 rounded-xl shadow">
                            <h3 className="font-semibold mb-2 text-gray-800">
                              Add New Section
                            </h3>
                            <div className="grid gap-4">
                              <input
                                type="text"
                                placeholder="Section Title"
                                value={newSection.sectionTitle}
                                onChange={(e) =>
                                  setNewSection({
                                    ...newSection,
                                    sectionTitle: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                              />
                              <textarea
                                placeholder="Section Content"
                                value={newSection.sectionDesc}
                                onChange={(e) =>
                                  setNewSection({
                                    ...newSection,
                                    sectionDesc: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                                rows={3}
                              />
                              <button
                                onClick={handleAddSection}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold cursor-pointer"
                                disabled={!newSection.sectionTitle}
                              >
                                Add Section
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* section view */}
                    {(!showAddSection || role === "STUDENT") && (
                      <div className="space-y-6">
                        {courseSection.length > 0 ? (
                          courseSection.map((section) => (
                            <div
                              key={section.section_id}
                              className="border border-gray-200 rounded-xl shadow bg-white overflow-hidden"
                            >
                              <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  {editingSectionId === section.section_id ? (
                                    <input
                                      type="text"
                                      value={sectionEditData.sectionTitle}
                                      onChange={(e) =>
                                        setSectionEditData({
                                          ...sectionEditData,
                                          sectionTitle: e.target.value,
                                        })
                                      }
                                      className="px-3 py-1 border border-gray-200 rounded-lg"
                                      onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleSaveSection(e)
                                      }
                                    />
                                  ) : (
                                    <h3 className="font-semibold text-lg text-gray-800">
                                      {section.sectionTitle}
                                    </h3>
                                  )}
                                  {(role === "FACULTY" || role === "ADMIN") &&
                                    profile.profile.name ===
                                      course.instructorName && (
                                      <div className="flex gap-1">
                                        {editingSectionId ===
                                        section.section_id ? (
                                          <>
                                            <button
                                              onClick={handleSaveSection}
                                              className="text-gray-900 hover:text-gray-800 font-semibold"
                                            >
                                              Save
                                            </button>
                                            <button
                                              onClick={() =>
                                                setEditingSectionId(null)
                                              }
                                              className="text-gray-500 hover:text-gray-800 font-semibold"
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        ) : (
                                          <>
                                            <button
                                              onClick={() =>
                                                handleEditSection(section)
                                              }
                                              className="text-gray-900 hover:text-gray-800"
                                            >
                                              <PencilSquareIcon className="w-5 h-5 cursor-pointer" />
                                            </button>
                                            <button
                                              onClick={() =>
                                                handleRemoveSection(
                                                  section.section_id
                                                )
                                              }
                                              className="text-gray-500 hover:text-gray-800"
                                            >
                                              <TrashIcon className="w-5 h-5 cursor-pointer " />
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                              <div className="p-6">
                                {editingSectionId === section.section_id ? (
                                  <textarea
                                    value={sectionEditData.sectionDesc}
                                    onChange={(e) =>
                                      setSectionEditData({
                                        ...sectionEditData,
                                        sectionDesc: e.target.value,
                                      })
                                    }
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg mb-4"
                                    rows={4}
                                  />
                                ) : (
                                  <pre className="font-sans mb-4 text-gray-800 whitespace-pre-wrap break-words max-h-[9em] overflow-y-auto">
                                    {section.sectionDesc}
                                  </pre>
                                )}
                                <SectionContent
                                  key={section.section_id}
                                  section={section}
                                  course={course}
                                  // user={user}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-gray-400 text-lg">
                            No sections available yet
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {showAssignments && (
              <DisplayAssignments
                courseId={course.course_id}
                showAssignments={showAssignments}
              />
            )}

            
            {showReport && (
              <div className="mt-4">
                <StudentProgressReport courseId={course.course_id} />
              </div>
            )}
          </div>

          {/* Right Side (Progress) */}
          {isEnrolled && (
            <div className="w-full lg:w-[30%]">
              <div className="sticky top-24 space-y-4">
                {role === "STUDENT" && (
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">
                      Course Progress
                    </h2>
                    <StudentProgressDisplay
                      courseId={course.course_id}
                      studentId={profile.profile.id}
                    />
                  </div>
                )}

                {/* Quick Actions / Handle add section and handle edit course details */}
                {(role === "FACULTY" || role === "ADMIN") &&
                  profile.profile.name === course.instructorName && (
                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                      <h2 className="text-xl font-bold mb-4 text-gray-800">
                        Quick Actions
                      </h2>
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowAddSection((prev) => !prev)}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer"
                        >
                          <PlusIcon className="w-5 h-5" />
                          {showAddSection
                            ? "Hide Add Section"
                            : "Add New Section"}
                        </button>
                        <button
                          onClick={handleEditCourse}
                          className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                          Edit Course Details
                        </button>
                        {/* create assignment button link to assignment team page */}
                        <Link
                          to="/faculty/assignments/create"
                          state={{
                            course_id: course.course_id,
                            courseTitle: course.courseTitle,
                            course: course,
                          }}
                        >
                          <button className="w-full flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 cursor-pointer mt-3">
                            <PlusIcon className="w-5 h-5" />
                            Create New Assignment
                          </button>
                        </Link>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
          {/* Scrolling Up Feature*/}
          <div className="flex justify-end">
                <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="fixed bottom-8 right-8 z-50 bg-gray-800 hover:bg-gray-900 text-white rounded-full p-3 shadow-lg transition-all"
                title="Go to Top"
                >
                <img
                  src="https://img.icons8.com/ios-filled/24/ffffff/up--v1.png"
                  alt="Go to Top"
                  className="w-6 h-6"
                />
                </button>
              </div>
        </div>
      </div>
    </>
  );
}

export default ViewCourse;
