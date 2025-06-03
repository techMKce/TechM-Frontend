import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import CourseForm from "./CourseForm";
// import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";
import api from "@/service/api";
import FacultyNavbar from "../FacultyNavbar";
import StudentNavbar from "../StudentNavbar";
export type Course = {
  course_id: number;
  courseTitle: string;
  courseDescription: string;
  instructorName: string;
  dept: string;
  isActive: boolean;
  duration: number;
  credit: number;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
};

const CourseList: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoverStates, setHoverStates] = useState<Record<number, boolean>>({});

  const handleMouseEnter = (courseId: number) => {
    setHoverStates((prev) => ({ ...prev, [courseId]: true }));
  };

  const handleMouseLeave = (courseId: number) => {
    setHoverStates((prev) => ({ ...prev, [courseId]: false }));
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api("/course/details");
        setCourses(response.data);

        const uniqueCategories = [
          "All",
          ...Array.from(
            new Set(
              response.data.map((course: Course) => course.dept).filter(Boolean)
            )
          ),
        ] as string[];
        setCategories(uniqueCategories);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch courses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses =
    selectedCategory === "All"
      ? courses
      : courses.filter((c) => c.dept === selectedCategory);

  const searchFilteredCourses = filteredCourses.filter((course) =>
    course.courseTitle?.toLowerCase()?.includes(search?.toLowerCase() || "")
  );

  const suggestions = search
    ? filteredCourses
        .filter((course) =>
          course.courseTitle
            ?.toLowerCase()
            ?.includes(search?.toLowerCase() || "")
        )
        .slice(0, 5)
    : [];

  const handleShowMore = () => setVisibleCount((prev) => prev + 8);

  const handleViewCourse = (course: Course) => {
    if (profile.profile.role === "FACULTY") {
      navigate(`/faculty/courses/${course.course_id}`, {
        state: {
          course: course,
        },
      });
      return;
    } else {
      navigate(`/student/courses/${course.course_id}`, {
        state: {
          course: course.course_id,
        },
      });
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
    }
  };

  const handleAddCourse = async (newCourseData: any) => {
    try {
      const response = await api.post(
        "/course/add",
        {
          courseTitle: newCourseData.courseTitle,
          courseDescription: newCourseData.courseDescription,
          instructorName: newCourseData.instructorName,
          dept: newCourseData.dept,
          isActive: true,
          duration: parseInt(newCourseData.duration),
          credit: parseInt(newCourseData.credit),
          imageUrl: newCourseData.imageUrl,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newCourse: Course = {
        ...response.data,
        course_id:
          response.data.course_id ||
          Math.max(0, ...courses.map((c) => c.course_id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        courseTitle: newCourseData.courseTitle,
        courseDescription: newCourseData.courseDescription,
        instructorName: newCourseData.instructorName,
        dept: newCourseData.dept,
        isActive: true,
        duration: parseInt(newCourseData.duration),
        credit: parseInt(newCourseData.credit),
        imageUrl: newCourseData.imageUrl,
      };

      setCourses((prevCourses) => [newCourse, ...prevCourses]);
      setShowCourseForm(false);

      if (!categories.includes(newCourseData.dept)) {
        setCategories((prevCategories) => [
          ...prevCategories,
          newCourseData.dept,
        ]);
      }

      alert("Course added successfully!");
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Failed to add course"
      );
    }
  };

  const handleDeleteCourse = async (course_id: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/course/delete?course_id=${course_id}`);
        setCourses((prev) => prev.filter((c) => c.course_id !== course_id));
      } catch (error) {
        console.log("Error while deleting course by : ", error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {profile.profile.role == "FACULTY" ? (
        <FacultyNavbar />
      ) : (
        <StudentNavbar />
      )}
      <div className="min-h-screen py-6 px-4 bg-white text-black">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-8 relative">
          <input
            type="text"
            className="w-full px-5 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg shadow"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={handleSearchKeyDown}
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-2 z-10">
              {suggestions.map((s) => (
                <li
                  key={s.course_id}
                  className="px-5 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={() => {
                    setSearch(s.courseTitle);
                    setShowSuggestions(false);
                  }}
                >
                  {s.courseTitle}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Add Course Button */}
        {profile.profile.role === "FACULTY" && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowCourseForm(true)}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Add New Course
            </button>
          </div>
        )}

        {/* Course Form Modal */}
        {showCourseForm && (
          <CourseForm
            onClose={() => setShowCourseForm(false)}
            onSave={handleAddCourse}
            departments={categories}
          />
        )}

        {/* Filter Buttons */}
        <div className="mb-6 text-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setVisibleCount(8);
                setSearch("");
              }}
              className={`mr-2 mb-2 px-6 py-2 rounded-full font-semibold transition-all shadow
              ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-black to-gray-700 text-white shadow-md"
                  : "bg-white text-black border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid gap-8 max-w-6xl mx-auto grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {searchFilteredCourses.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 text-lg py-16">
              No courses found
            </div>
          ) : (
            searchFilteredCourses.slice(0, visibleCount).map(
              (course) => (
                console.log("course: ", course),
                (
                  <div
                    key={course.course_id}
                    className="rounded-xl overflow-hidden bg-white bg-opacity-95 shadow-lg flex flex-col border border-gray-100 transition-transform duration-200 cursor-pointer hover:-translate-y-1.5 hover:scale-105 hover:shadow-2xl relative"
                    onMouseEnter={() => handleMouseEnter(course.course_id)}
                    onMouseLeave={() => handleMouseLeave(course.course_id)}
                  >
                    <div className="h-40 overflow-hidden relative">
                      <img
                        src={course.imageUrl}
                        alt={course.courseTitle}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 bg-black bg-opacity-85 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                        {course.dept || "General"}
                      </span>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="mb-2 text-lg font-bold text-black">
                        {course.courseTitle || "Untitled Course"}
                      </h3>
                      <p className="text-sm text-gray-600 flex-1">
                        {course.courseDescription || "No description available"}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          By{" "}
                          {course.instructorName?.toUpperCase() ||
                            "Unknown Instructor"}
                        </span>
                        <span>
                          {course.duration || "N/A"} hours |{" "}
                          {course.credit || "0"} credits
                        </span>
                      </div>
                    </div>
                    {/* Expanded Description - Only shows for hovered card */}
                    {hoverStates[course.course_id] && (
                      <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col justify-center items-center p-6 z-20 transition-all duration-300">
                        {profile.profile.role === "FACULTY" &&
                          course.instructorName.toLowerCase() ===
                            profile.profile.name.toLowerCase() && (
                            <button
                              className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 transition-colors  cursor-pointer"
                              onClick={() =>
                                handleDeleteCourse(course.course_id)
                              }
                            >
                              <TrashIcon className="w-5 h-5 active:bg-gray-500" />
                            </button>
                          )}
                        <h3 className="text-lg font-bold mb-2 text-black">
                          {course.courseTitle || "Untitled Course"}
                        </h3>
                        <p className="text-sm text-gray-700 mb-2">
                          {course.courseDescription ||
                            "No detailed description available"}
                        </p>
                        <div className="text-sm mb-4 text-left w-full px-4">
                          <p>
                            <strong>Department:</strong> {course.dept || "N/A"}
                          </p>
                          <p>
                            <strong>Duration:</strong>{" "}
                            {course.duration || "N/A"} hours
                          </p>
                          <p>
                            <strong>Credits:</strong> {course.credit || "0"}
                          </p>
                          <p>
                            <strong>Created:</strong>{" "}
                            {course.createdAt
                              ? new Date(course.createdAt).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        {
                          <button
                            className="px-6 py-2 bg-gradient-to-r from-black to-gray-700 text-white rounded-full font-semibold shadow hover:from-gray-900 hover:to-gray-700 
                                transition cursor-pointer"
                            onClick={() => handleViewCourse(course)}
                          >
                            View Course
                          </button>
                        }
                      </div>
                    )}
                  </div>
                )
              )
            )
          )}
        </div>

        {/* Show More Button */}
        {visibleCount < searchFilteredCourses.length && (
          <div className="text-center mt-10">
            <button
              onClick={handleShowMore}
              className="px-9 py-3 bg-gradient-to-r from-black to-gray-700 text-white rounded-full font-semibold text-lg shadow-lg hover:from-gray-900 hover:to-gray-700 transition"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CourseList;
