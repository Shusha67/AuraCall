"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

export function DeleteMessageModal() {
  const { isOpen, onClose, type, data } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const { apiUrl, query } = data;

  const isModalOpen = isOpen && type === "deleteMessage";

  const onClick = async () => {
    if (!apiUrl) return;
    setIsLoading(true);
    const params = new URLSearchParams(query as Record<string, string>);
    await fetch(`${apiUrl}?${params.toString()}`, { method: "DELETE" });
    onClose();
    setIsLoading(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-700 p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Delete Message</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Are you sure you want to delete this message? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-zinc-800 px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400">
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={onClick} className="bg-red-600 hover:bg-red-700 text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
