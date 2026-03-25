"use client";

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus } from "lucide-react";

export default function WelcomePage() {
  const { onOpen } = useModal();

  return (
    <div className="flex flex-col flex-1 h-full items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center space-y-6 text-center px-4">
        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center">
          <MessageSquare className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-100">Welcome to AuraCall</h1>
          <p className="text-zinc-400 max-w-sm">
            You&apos;re not part of any server yet. Create one or join one using an invite link.
          </p>
        </div>
        <Button
          onClick={() => onOpen("createServer")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create a Server
        </Button>
      </div>
    </div>
  );
}
