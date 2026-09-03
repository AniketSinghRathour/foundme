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
            ? "border-amber-700/50 bg-amber-700/5" 
            : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 bg-white shadow-sm"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`p-4 rounded-full ${isDragActive ? 'bg-amber-700/10' : 'bg-zinc-50 border border-zinc-100'}`}>
            <UploadCloud className={`h-8 w-8 ${isDragActive ? 'text-amber-700' : 'text-zinc-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-zinc-900">
              {isDragActive ? "Drop the photos here..." : "Drag & drop photos here"}
            </h3>
            <p className="text-sm text-zinc-500 mt-1 font-light">or click to browse files</p>
          </div>
        </div>
      </div>

      {/* Upload Queue Actions */}
      {items.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-600">
            <span>{items.length} total files</span>
            {completedCount > 0 && <span className="text-emerald-600">{completedCount} completed</span>}
          </div>
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCompleted} className="text-zinc-500 hover:text-zinc-900">
                Clear Completed
              </Button>
            )}
            {pendingCount > 0 && (
              <Button 
                onClick={(e) => { e.stopPropagation(); startUpload(eventId); }} 
                disabled={isUploading}
                className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6 shadow-sm"
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
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-zinc-100 shadow-sm relative overflow-hidden group">
              {/* Progress Background */}
              {item.status === "UPLOADING" && (
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-amber-700/5 -z-10 transition-all duration-300" 
                  style={{ width: `${item.progress}%` }} 
                />
              )}
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                   <FileImage className="h-5 w-5 text-zinc-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-zinc-900 truncate max-w-[200px] sm:max-w-[400px]">
                    {item.file.name}
                  </span>
                  <span className="text-xs text-zinc-500 font-light">
                    {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {item.status === "SUCCESS" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {item.status === "ERROR" && <span title={item.error}><AlertCircle className="h-5 w-5 text-red-500" /></span>}
                {item.status === "UPLOADING" && <span className="text-xs font-medium text-amber-700">{item.progress}%</span>}
                
                {item.status !== "UPLOADING" && (
                  <button onClick={() => removeFile(item.id)} className="p-1 text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
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
