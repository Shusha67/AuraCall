"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function DeleteChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { channel, server } = data;

  const isModalOpen = isOpen && type === "deleteChannel";

  const onClick = async () => {
    setIsLoading(true);
    await fetch(`/api/channels/${channel?.id}?serverId=${server?.id}`, { method: "DELETE" });
    onClose();
    router.push(`/servers/${server?.id}`);
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-700 p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Delete Channel</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-indigo-400">#{channel?.name}</span>?
            This action cannot be undone.
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
