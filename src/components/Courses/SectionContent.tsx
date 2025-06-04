import { useState, useEffect } from "react";

import api from "@/service/api"; // Adjust the import path as necessary
import {
  TrashIcon,
  PlusIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, X, File as FileIcon } from "lucide-react";

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
  const [pdfTitle, setPdfTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);

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
      } finally {
        setLoading(false);
      }
    };

    if (section.section_id) {
      fetchContent();
    }
  }, [section.section_id]);

  // Handle to show add video form
  const handleAddVideo = async (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setShowVideoForm(true);
  };

  // Handle opening PDF form
  const handleAddPdf = (sectionId: number) => {
    setCurrentSectionId(sectionId);
    setShowPdfForm(true);
  };

  const handleSubmitContent = async (
    contentType: string,
    contentUrl: File | string,
    contentTitle: string
  ) => {
    try {
      const formData = new FormData();
      formData.append("contentType", contentTitle || contentType.toUpperCase());
      
      if (contentUrl instanceof File) {
        formData.append("file", contentUrl);
      } else {
        formData.append("content", contentUrl);
      }
      
      formData.append("section_id", currentSectionId?.toString() || "");

      await api.post("/course/section/content/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refetch content to update UI
      const contentResponse = await api.get(
        `/course/section/content/details?id=${currentSectionId}`
      );
      setContents(contentResponse.data);

      // Close form and reset
      setShowVideoForm(false);
      setShowPdfForm(false);
      setVideoUrl("");
      setVideoTitle("");
      setPdfFile(null);
      setPdfTitle("");
      
      toast.success(`${contentType} added successfully`);
    } catch (error) {

      toast.error(`Failed to add ${contentType}. Please try again.`);
    }
  };

  // Handle PDF viewing
  const handleViewPdf = (pdfUrl: string) => {
    setPdfViewerUrl(pdfUrl);
  };

  // Close PDF viewer
  const closePdfViewer = () => {
    setPdfViewerUrl(null);
  };

  // Remove Content Handler
  const handleRemoveContent = async (
    contentId: number,
    contentType: string
  ) => {
    if (
      !window.confirm(`Are you sure you want to delete this ${contentType}?`)
    )
      return;

    try {
      await api.delete(`/course/section/content/delete`, {
        data: contentId,
      });

      setContents((prev) => prev.filter((c) => c.content_id !== contentId));
      toast.success(`${contentType} deleted successfully`);
    } catch (error: any) {

      toast.error(error.response?.data?.message || `Failed to delete ${contentType}`);
    }
  };

  // Section filteration by pdf/video
  const videos = contents.filter((c) => c.contentType === "VIDEO");
  const pdfs = contents.filter((c) => {
    // Check if contentType is explicitly "PDF"
    const isPdfType = c.contentType?.toUpperCase() === "PDF";

    // Check if content URL ends with .pdf (case insensitive)
    const hasPdfExtension = c.content?.toLowerCase()?.endsWith(".pdf");

    // Check if contentType contains "PDF" (case insensitive)
    const contentTypeHasPdf = c.contentType?.toLowerCase()?.includes("pdf");

    return isPdfType || hasPdfExtension || contentTypeHasPdf;
  });

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
                  <button
                    onClick={() => handleViewPdf(pdf.content)}
                    className="text-blue-600 hover:underline truncate"
                  >
                    {pdf.content.split('/').pop() || "PDF Document"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No PDFs added yet</p>
        )}
      </div>

      {/* Video Form */}
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
                    handleSubmitContent("VIDEO", videoUrl, videoTitle)
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
              {/* Drag and Drop Area */}
              <div
                className={`border-2 border-dashed rounded-md p-6 text-center transition ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-white"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragActive(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === "application/pdf") {
                    setPdfFile(file);
                    if (!pdfTitle) {
                      setPdfTitle(file.name.replace(/\.[^/.]+$/, ""));
                    }
                  } else {

                    toast.warning("Please upload a PDF file only");

                  }
                }}
                onClick={() => document.getElementById("pdf-upload")?.click()}
              >
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.type !== "application/pdf") {

                        toast.warning("Please upload a PDF file only");

                        return;
                      }
                      setPdfFile(file);
                      if (!pdfTitle) {
                        setPdfTitle(file.name.replace(/\.[^/.]+$/, ""));
                      }
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="h-12 w-12 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop PDF here or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF files only (Max: 10MB)
                  </p>
                </div>
              </div>

              {/* Selected File Info */}
              {pdfFile && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="w-5 h-5 text-red-500" />
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
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Title Input */}
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
                  type="button"
                  onClick={() => {
                    setShowPdfForm(false);
                    setPdfFile(null);
                    setPdfTitle("");
                    setDragActive(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pdfFile) {
                      handleSubmitContent("PDF", pdfFile, pdfTitle);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer disabled:bg-blue-300"
                  disabled={!pdfFile}
                >
                  Upload PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {pdfViewerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-screen flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">PDF Viewer</h3>
              <button
                onClick={closePdfViewer}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1">
              <iframe
                src={`http://localhost:8083/api/v1/course/section/content/view/${pdfViewerUrl.split('/').pop()}`}
                className="w-full h-full"
                frameBorder="0"
              ></iframe>
            </div>
            <div className="p-4 border-t flex justify-end">
              <a
                href={`http://localhost:8083/api/v1/course/section/content/download/${pdfViewerUrl.split('/').pop()}`}
                download
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionContent;