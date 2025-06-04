import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import api from "@/service/api"; // Adjust the import path as necessary
import {
  TrashIcon,
  PlusIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Section {
  section_id: number;
  // Add other properties if needed
}

interface User {
  role: string;
  // Add other properties if needed
}

interface Content {
  content_id: number;
  contentType: string;
  content: string;
  // Add other properties if needed
}

interface SectionContentProps {
  section: Section;
}
// get youtube video
function getYouTubeEmbedUrl(url) {
  // If already an embed URL, return as-is
  if (url.includes("youtube.com/embed")) return url;

  // Extract video ID from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  const videoId = match && match[2].length === 11 ? match[2] : null;

  // Return embed URL if valid ID found, otherwise return original URL
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=0`
    : url;
}

const SectionContent = ({ section }: SectionContentProps) => {
  const { profile } = useAuth();
  const user: User = {
    role: profile.profile.role,
  };
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file");

  // Fetch content when section changes
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/course/section/content/details?id=${section.section_id}`
        );
        setContents(response.data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };

    if (section.section_id) {
      fetchContent();
    }
  }, [section.section_id]);
  //   handle to show add video form
  const handleAddVideo = async (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setShowVideoForm(true);
  };

  // Handle opening PDF form
  const handleAddPdf = (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setShowPdfForm(true);
  };

  const handleFileUpload = (file) => {
    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please upload a PDF file only",
      });
      return;
    }
    setPdfFile(file);
    // Set default title if not already set
    if (!pdfTitle) {
      setPdfTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove file extension
    }
  };
  const handlePdfSubmit = () => {
    if (uploadMethod === "file" && !pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }

    if (uploadMethod === "url" && !pdfUrl) {
      toast.error("Please enter a PDF URL");
      return;
    }

    if (uploadMethod === "url" && !pdfUrl.endsWith(".pdf")) {
      toast.error("URL must point to a PDF file");
      return;
    }

    handleSubmitContent(
      "PDF",
      uploadMethod === "file" ? pdfFile : pdfUrl,
      pdfTitle
    );

    // Reset form
    setPdfFile(null);
    setPdfUrl("");
    setPdfTitle("");
    setShowPdfForm(false);
  };
  // Unified content submission handler
  const handleSubmitContent = async (
    contentType: string,
    contentUrl: File | string,
    contentTitle: string
  ) => {
    const isYoutubeUrl =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

    // Basic URL validation
    if (!contentUrl) {
      await Swal.fire({
        icon: "error",
        title: "Missing URL",
        text: "Please enter a video URL",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      // Only proceed if user confirmed

      const requestBody = {
        contentType: contentTitle ? contentTitle : contentType.toUpperCase(),
        content: contentUrl,
        section: { section_id: currentSectionId },
      };

      await api.post("/course/section/content/add", requestBody);

      // Refetch content to update UI
      const contentResponse = await api.get(
        `/course/section/content/details?id=${currentSectionId}`
      );

      // Update section
      setContents(contentResponse.data);

      // Close form and reset
      setShowVideoForm(false);
      setShowPdfForm(false);
      setVideoUrl("");
      setVideoTitle("");
      setPdfUrl("");
      setPdfTitle("");
    } catch (error) {
      console.error("Error adding video:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to add video. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };
  // for pdf open
  const onclickShowPdf = () => {
    return (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      const pdfUrl = event.currentTarget.href;

      // Create modal overlay
      const modal = document.createElement("div");
      Object.assign(modal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: "1000",
      });

      // Create PDF container
      const pdfContainer = document.createElement("div");
      Object.assign(pdfContainer.style, {
        backgroundColor: "#fff",
        borderRadius: "8px",
        width: "80%",
        maxWidth: "800px",
        height: "80%",
        padding: "20px",
        position: "relative",
        boxShadow: "0 0 10px rgba(0,0,0,0.25)",
      });

      // Create iframe for PDF display
      const iframe = document.createElement("iframe");
      iframe.src = pdfUrl;
      Object.assign(iframe.style, {
        width: "100%",
        height: "100%",
        border: "none",
      });

      // Create close button
      const closeButton = document.createElement("button");
      closeButton.textContent = "×";
      Object.assign(closeButton.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        width: "30px",
        height: "30px",
        fontSize: "18px",
        backgroundColor: "#f44336",
        color: "white",
        border: "none",
        borderRadius: "50%",
        cursor: "pointer",
      });

      closeButton.onclick = () => document.body.removeChild(modal);

      pdfContainer.appendChild(closeButton);
      pdfContainer.appendChild(iframe);
      modal.appendChild(pdfContainer);
      document.body.appendChild(modal);
    };
  };
  // Remove Content Handler
  const handleRemoveContent = async (
    contentId: number,
    contentType: string
  ) => {
    if (
      !window.confirm(`Are you sure you want to delete this ${contentType} ? `)
    )
      return;

    try {
      await api.delete(`/course/section/content/delete`, {
        data: contentId,
      });

      setContents((prev) => prev.filter((c) => c.content_id !== contentId));
    } catch (error: any) {
      console.error(`Error deleting ${contentType}:`, error);
      alert(error.response?.data?.message || `Failed to delete ${contentType}`);
    }
  };

  const videos = contents.filter((c) => c.contentType === "VIDEO");
  const pdfs = contents.filter((c) => c.contentType === "PDF");

  if (loading) return <div>Loading content...</div>;

  return (
    <div className="space-y-8">
      {/* Video Lectures Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold flex items-center gap-2 text-gray-900">
            <VideoCameraIcon className="w-5 h-5 text-gray-800" />
            Video Lectures
          </h4>
          {(user.role === "FACULTY" || user.role === "ADMIN") && (
            <button
              onClick={() => handleAddVideo(section.section_id)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
            >
              <PlusIcon className="w-4 h-4" />
              Add Video
            </button>
          )}
        </div>
        {/* show video */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div
                key={video.content_id}
                className="bg-gray-100 p-4 rounded-lg relative shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">
                    {`${video.contentType} ${index + 1}` || "Untitled Video"}
                  </h5>
                  {(user.role === "FACULTY" || user.role === "ADMIN") && (
                    <button
                      onClick={() =>
                        handleRemoveContent(video.content_id, "VIDEO")
                      }
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getYouTubeEmbedUrl(video.content)}
                    className="w-full h-48 rounded-lg border border-gray-200"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No videos added yet</p>
        )}
      </div>

      {/* PDF Materials Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-semibold flex items-center gap-2 text-gray-900">
            <DocumentTextIcon className="w-5 h-5 text-gray-800" />
            PDF Materials
          </h4>
          {(user.role === "FACULTY" || user.role === "ADMIN") && (
            <button
              onClick={() => handleAddPdf(section.section_id)}
              className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
            >
              <PlusIcon className="w-4 h-4" />
              Add PDF
            </button>
          )}
        </div>
        {/* show pdf */}
        {pdfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdfs.map((pdf, index) => (
              <div
                key={pdf.content_id}
                className="bg-gray-100 p-4 rounded-lg relative shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">
                    {`${pdf.contentType} ${index + 1}` || "Untitled PDF"}
                  </h5>
                  {(user.role === "FACULTY" || user.role === "ADMIN") && (
                    <button
                      onClick={() => handleRemoveContent(pdf.content_id, "PDF")}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
                  <DocumentTextIcon className="w-8 h-8 text-red-500" />
                  <a
                    href={pdf.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate"
                    onClick={onclickShowPdf}
                  >
                    {/* pdf.content.split('/').pop() for now use beacuse one pdf has null */}
                    {pdf.content || "PDF Document"}
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No PDFs added yet</p>
        )}
      </div>
      {/* Video Form */}
      {/* {showVideoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Video</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  placeholder="Introduction Video"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVideoForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSubmitContent("VIDEO", videoUrl, videoTitle)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
                >
                  Add Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}

      {showVideoForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Video</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="mt-1 h-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Introduction Video"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVideoForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSubmitContent("Video", videoUrl, videoTitle)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                >
                  Add Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pdf Form */}
      {showPdfForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add PDF Content</h3>
            <div className="space-y-4">
              {/* Toggle between File and URL upload */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`px-4 py-2 font-medium ${
                    uploadMethod === "file"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setUploadMethod("file")}
                >
                  Upload File
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    uploadMethod === "url"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
                  onClick={() => setUploadMethod("url")}
                >
                  Enter URL
                </button>
              </div>

              {/* File Upload Section */}
              {uploadMethod === "file" && (
                <>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add(
                        "border-blue-500",
                        "bg-blue-50"
                      );
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove(
                        "border-blue-500",
                        "bg-blue-50"
                      );
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove(
                        "border-blue-500",
                        "bg-blue-50"
                      );
                      const file = e.dataTransfer.files[0];
                      if (file && file.type === "application/pdf") {
                        setPdfFile(file);
                      } else {
                        toast.error("Please upload a PDF file only");
                      }
                    }}
                    onClick={() =>
                      document.getElementById("pdf-upload")?.click()
                    }
                  >
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setPdfFile(file);
                      }}
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm text-gray-600">
                        Drag and drop your PDF here, or{" "}
                        <span className="text-blue-600">click to browse</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF files only (Max 10MB)
                      </p>
                    </div>
                  </div>

                  {pdfFile && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <svg
                          className="w-5 h-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm truncate max-w-xs">
                          {pdfFile.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                      <button
                        onClick={() => setPdfFile(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* URL Input Section */}
              {uploadMethod === "url" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    PDF URL
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    placeholder="https://example.com/document.pdf"
                    pattern="https?://.+\.pdf"
                  />
                  <p className="text-xs text-gray-500">
                    Must be a direct link to a PDF file
                  </p>
                </div>
              )}

              {/* Title Input (Common for both methods) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  placeholder="Lecture Notes"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowPdfForm(false);
                    setPdfFile(null);
                    setPdfUrl("");
                    setPdfTitle("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePdfSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer disabled:bg-blue-300"
                  disabled={uploadMethod === "file" ? !pdfFile : !pdfUrl}
                >
                  {uploadMethod === "file" ? "Upload PDF" : "Add PDF URL"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionContent;
