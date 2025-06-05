import { useState, useEffect } from "react";

import api from "@/service/api";
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
}

interface User {
  role: string;
}

interface Content {
  id: number;
  pdfViewUrl: File | string;
  content: string | null;
  document: string | null;
  sectionId: number;
}

interface SectionContentProps {
  section: Section;
  course : any;
}

function getYouTubeEmbedUrl(url: string) {
  if (url.includes("youtube.com/embed")) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;
  return videoId
    ? `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=0`
    : url;
}

const SectionContent = ({ section,course }: SectionContentProps) => {
  const { profile } = useAuth();
  const user: User = {
    role: profile.profile.role,
  };
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showPdfForm, setShowPdfForm] = useState(false);
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
        // console.log("recevice contents: ", response.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (section.section_id) {
      fetchContent();
    }
  }, [section.section_id]);

  const handleAddVideo = () => {
    setShowVideoForm(true);
  };

  const handleAddPdf = () => {
    setShowPdfForm(true);
  };

  const handleUploadVideo = async () => {
    if (!videoUrl) {
      toast.error("Please enter a video URL");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("contentUrl", videoUrl);
      formData.append("sectionId", section.section_id.toString());

      // if (videoTitle) {
      //   formData.append("contentType", videoTitle);
      // }

      await api.post("/course/section/content/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refetch content
      const response = await api.get(
        `/course/section/content/details?id=${section.section_id}`
      );
      setContents(response.data);

      // Reset form
      setShowVideoForm(false);
      setVideoUrl("");
      setVideoTitle("");

      toast.success("Video added successfully");
    } catch (error) {
      console.error("Error adding video:", error);
      toast.error("Failed to add video. Please try again.");
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) {
      toast.error("Please upload a PDF file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("sectionId", section.section_id.toString());

      // console.log("pdf file got", pdfFile);
      // if (pdfTitle) {
      //   formData.append("contentType", pdfTitle);
      // }

      await api.post("/course/section/content/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Refetch content
      const response = await api.get(
        `/course/section/content/details?id=${section.section_id}`
      );
      setContents(response.data);

      // Reset form
      setShowPdfForm(false);
      setPdfFile(null);
      setPdfTitle("");

      toast.success("PDF added successfully");
    } catch (error) {


      toast.error(`Failed to add ${pdfTitle}. Please try again.`);

    }
  };

  const handleViewPdf = async (contentId: number) => {
    try {
      // Fetch PDF as blob
      // console.log("content id opened: ", contentId);
      const response = await api.get(
        `/course/section/content/download/${contentId}`,
        { responseType: "blob" }
      );

      const contentType =
        response.headers["content-type"] || "application/octet-stream";
      let blob;

      if (contentType.includes("text") || contentType.includes("json")) {
        const textResponse = await api.get(
          `/course/section/content/download/${contentId}`,
          { responseType: "text" }
        );
        const textData = textResponse.data;
        if (
          textData.startsWith("data:") ||
          /^[A-Za-z0-9+/=]+$/.test(textData)
        ) {
          const base64Data = textData.startsWith("data:")
            ? textData.split(",")[1]
            : textData;
          const binaryString = atob(base64Data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], {
            type: contentType.includes("json")
              ? "application/pdf"
              : contentType,
          });
        } else {
          throw new Error("Response is text but not base64-encoded");
        }
      } else {
        blob = new Blob([response.data], { type: contentType });
      }

      const fileUrl = window.URL.createObjectURL(blob);

      // Create blob URL
      // const blobUrl = window.URL.createObjectURL(response.data);

      // console.log("blog url in handleViewPdf: ", blobUrl);

      setPdfViewerUrl(fileUrl);
      toast.info("Document opened for viewing.");
    } catch (error) {
      console.error("Error loading PDF:", error);
      toast.error("Failed to load PDF. Please try again.");

      // Fallback option
      window.open(
        `http://localhost:8083/api/v1/course/section/content/download/${contentId}`,
        "_blank"
      );
    }
  };

  useEffect(() => {
    return () => {
      if (pdfViewerUrl) {
        URL.revokeObjectURL(pdfViewerUrl);
      }
    };
  }, [pdfViewerUrl]);

  const closePdfViewer = () => {
    setPdfViewerUrl(null);
  };

  const handleRemoveContent = async (
    contentId: number,
    contentType: string
  ) => {
    if (
      !window.confirm(`Are you sure you want to delete this ${contentType}?`)
    ) {
      return;
    }

    try {
      await api.delete(`/course/section/content/delete`, {
        data: contentId,
      });

      setContents((prev) => prev.filter((c) => c.id !== contentId));
      toast.success(`${contentType} deleted successfully`);
    } catch (error: any) {


      toast.error(`Failed to delete ${contentType}`);

    }
  };

  // Filter contents - videos have content field, PDFs have document field
  const videos = contents.filter((c) => c.content !== null);
  const pdfs = contents.filter((c) => c.content === null);

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
              onClick={handleAddVideo}
              className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
            >
              <PlusIcon className="w-4 h-4" />
              Add Video
            </button>
          )}
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videos.map((video, index) => (
              <div
                key={video.id}
                className="bg-gray-100 p-4 rounded-lg relative shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">
                    {`Video ${index + 1}`}
                  </h5>
                  {(user.role === "FACULTY" || user.role === "ADMIN")  &&(profile.profile.name === course.instructorName) && (
                    <button
                      onClick={() => handleRemoveContent(video.id, "VIDEO")}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={getYouTubeEmbedUrl(video.content!)}
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
              onClick={handleAddPdf}
              className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 font-semibold"
            >
              <PlusIcon className="w-4 h-4" />
              Add PDF
            </button>
          )}
        </div>

        {pdfs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pdfs.map((pdf, index) => (
              <div
                key={pdf.id}
                className="bg-gray-100 p-4 rounded-lg relative shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-800">
                    {`PDF ${index + 1}`}
                  </h5>
                  {(user.role === "FACULTY" || user.role === "ADMIN") && (profile.profile.name === course.instructorName) &&(
                    <button
                      onClick={() => handleRemoveContent(pdf.id, "PDF")}
                      className="text-gray-500 hover:text-gray-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded border border-gray-200">
                  <DocumentTextIcon className="w-8 h-8 text-red-500" />
                  <button
                    onClick={() => handleViewPdf(pdf.id)}
                    className="text-blue-600 hover:underline truncate"
                  >
                    {pdf.content || `PDF Document ${index + 1}`}
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
                  onClick={handleUploadVideo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
                >
                  Add Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Form */}
      {showPdfForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add PDF Content</h3>
            <div className="space-y-4">
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
                  onClick={handleUploadPdf}
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
              <object
                data={pdfViewerUrl}
                type="application/pdf"
                className="w-full h-full"
                aria-label="PDF document"
              >
                {pdfViewerUrl && (
                  <iframe
                    src={pdfViewerUrl}
                    width="100%"
                    height="600px"
                    title="PDF Viewer"
                  />
                )}
                {/* <embed
                  src={pdfViewerUrl}
                  type="application/pdf"
                  className="w-full h-full"
                /> */}
                <p className="p-4">
                  Your browser does not support PDFs.
                  <a
                    href={pdfViewerUrl}
                    download
                    className="text-blue-600 hover:underline ml-2"
                  >
                    Download the PDF instead
                  </a>
                </p>
              </object>
            </div>
            <div className="p-4 border-t flex justify-end">
              <a
                href={pdfViewerUrl}
                download={`document-${new Date().getTime()}.pdf`}
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
