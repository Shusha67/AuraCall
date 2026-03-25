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

export function LeaveServerModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { server } = data;

  const isModalOpen = isOpen && type === "leaveServer";

  const onClick = async () => {
    setIsLoading(true);
    await fetch(`/api/servers/${server?.id}/leave`, { method: "DELETE" });
    onClose();
    router.push("/");
    router.refresh();
    setIsLoading(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-700 p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Leave Server</DialogTitle>
          <DialogDescription className="text-center text-zinc-400">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-indigo-400">{server?.name}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-zinc-800 px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-zinc-400">
            Cancel
          </Button>
          <Button disabled={isLoading} onClick={onClick} className="bg-red-600 hover:bg-red-700 text-white">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Leave
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
