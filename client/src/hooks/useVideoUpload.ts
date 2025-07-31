import { useState } from "react";
import toast from "react-hot-toast";
import { apiClient } from "../utils/api";

interface VideoUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
}

interface VideoUploadError {
  message: string;
  code?: string;
}

export const useVideoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadVideo = async (file: File): Promise<VideoUploadResult | null> => {
    setUploading(true);
    setProgress(0);

    try {
      // Validazione file
      if (!file.type.startsWith("video/")) {
        throw new Error("Il file deve essere un video");
      }

      // Limite di dimensione: 100MB
      if (file.size > 100 * 1024 * 1024) {
        throw new Error("Il video è troppo grande. Dimensione massima: 100MB");
      }

      const formData = new FormData();
      formData.append("video", file);

      // Simula il progresso (in attesa del vero upload)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiClient.post("/media/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(progressInterval);

      if (!response.data.success) {
        throw new Error(response.data.message || "Upload fallito");
      }

      setProgress(100);
      toast.success("Video caricato con successo!");
      
      return response.data.data;
    } catch (error: any) {
      console.error("Errore upload video:", error);
      toast.error(error.message || "Errore durante l'upload del video");
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const deleteVideo = async (publicId: string): Promise<boolean> => {
    try {
      const encodedPublicId = encodeURIComponent(publicId);
      
      const response = await apiClient.delete(`/media/${encodedPublicId}?resourceType=video`);

      if (!response.data.success) {
        throw new Error(response.data.message || "Eliminazione fallita");
      }

      toast.success("Video eliminato con successo!");
      return true;
    } catch (error: any) {
      console.error("Errore eliminazione video:", error);
      toast.error(error.message || "Errore durante l'eliminazione del video");
      return false;
    }
  };

  return {
    uploadVideo,
    deleteVideo,
    uploading,
    progress,
  };
};