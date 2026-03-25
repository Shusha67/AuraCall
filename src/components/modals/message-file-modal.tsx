"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { FileImage, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";

export function MessageFileModal() {
  const { isOpen, onClose, type, data } = useModal();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { apiUrl, query } = data;

  const isModalOpen = isOpen && type === "messageFile";

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [], "application/pdf": [] },
    maxFiles: 1,
    maxSize: 4 * 1024 * 1024, // 4MB
  });

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  const onSubmit = async () => {
    if (!file || !apiUrl) return;

    setIsLoading(true);
    const supabase = createClient();

    const filename = `${uuidv4()}-${file.name}`;
    const { data: uploaded, error } = await supabase.storage
      .from("attachments")
      .upload(filename, file);

    if (error) {
      setIsLoading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("attachments")
      .getPublicUrl(filename);

    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileUrl: publicUrl,
        content: publicUrl,
        ...query,
      }),
    });

    setIsLoading(false);
    handleClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-700 p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Add an attachment</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Send a file as a message (max 4MB)
          </DialogDescription>
        </DialogHeader>
        <div className="p-6">
          {preview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image src={preview} alt="Preview" fill className="object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute top-2 right-2 bg-red-600 rounded-full p-1"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                isDragActive ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-700 hover:border-zinc-500"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-4 text-zinc-500" />
              <p className="text-zinc-400 text-sm">
                {isDragActive ? "Drop file here..." : "Drag & drop or click to upload"}
              </p>
              <p className="text-zinc-600 text-xs mt-1">Images and PDFs up to 4MB</p>
            </div>
          )}
        </div>
        <DialogFooter className="bg-zinc-800 px-6 py-4">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading} className="text-zinc-400">
            Cancel
          </Button>
          <Button
            disabled={isLoading || !file}
            onClick={onSubmit}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
