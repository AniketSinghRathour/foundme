"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useUploadStore } from "@/store/uploadStore";
import { UploadCloud, FileImage, CheckCircle2, AlertCircle, X, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Uploader({ eventId }: { eventId: string }) {
  const { items, addFiles, removeFile, clearCompleted, startUpload, isUploading } = useUploadStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const pendingCount = items.filter(i => i.status === "IDLE" || i.status === "ERROR").length;
  const completedCount = items.filter(i => i.status === "SUCCESS").length;

  return (
    <div className="space-y-6">
      {/* Dropzone Area */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${
          isDragActive 
            ? "border-zinc-900 bg-zinc-50 dark:border-white dark:bg-zinc-900/50" 
            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-zinc-100 dark:bg-zinc-800' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
            <UploadCloud className={`h-8 w-8 ${isDragActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {isDragActive ? "Drop the photos here..." : "Drag & drop photos here"}
            </h3>
            <p className="text-sm text-zinc-500 mt-1">or click to select files from your computer</p>
          </div>
        </div>
      </div>

      {/* Upload Queue Actions */}
      {items.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <span>{items.length} total files</span>
            {completedCount > 0 && <span className="text-emerald-600 dark:text-emerald-400">{completedCount} completed</span>}
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCompleted}>
                Clear Completed
              </Button>
            )}
            {pendingCount > 0 && (
              <Button 
                onClick={(e) => { e.stopPropagation(); startUpload(eventId); }} 
                disabled={isUploading}
                className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-full"
              >
                {isUploading ? (
                  <span className="flex items-center"><UploadCloud className="mr-2 h-4 w-4 animate-bounce" /> Uploading...</span>
                ) : (
                  <span className="flex items-center"><Play className="mr-2 h-4 w-4" /> Start Upload</span>
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Items List */}
      {items.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-900 shadow-sm relative overflow-hidden">
              {/* Progress Background */}
              {item.status === "UPLOADING" && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-zinc-100 dark:bg-zinc-900/50 -z-10 transition-all duration-300" 
                  style={{ width: `${item.progress}%` }} 
                />
              )}
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                   <FileImage className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-[400px]">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {item.status === "SUCCESS" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {item.status === "ERROR" && <span title={item.error}><AlertCircle className="h-5 w-5 text-red-500" /></span>}
                {item.status === "UPLOADING" && <span className="text-xs font-medium text-zinc-500">{item.progress}%</span>}
                
                {item.status !== "UPLOADING" && (
                  <button onClick={() => removeFile(item.id)} className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
