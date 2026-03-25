"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import { Loader2, Hash, Volume2, Video } from "lucide-react";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(100)
    .refine((n) => n !== "general", { message: "Cannot name channel 'general'" }),
  type: z.enum(["TEXT", "AUDIO", "VIDEO"]),
});

const channelTypeOptions = [
  { value: "TEXT", label: "Text", icon: Hash },
  { value: "AUDIO", label: "Voice", icon: Volume2 },
  { value: "VIDEO", label: "Video", icon: Video },
] as const;

export function CreateChannelModal() {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const params = useParams();

  const isModalOpen = isOpen && type === "createChannel";
  const { channelType } = data;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", type: channelType ?? "TEXT" },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...values, serverId: params?.serverId }),
    });

    if (res.ok) {
      form.reset();
      onClose();
      router.refresh();
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 text-zinc-100 border-zinc-700 p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">Create Channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-400">
                      Channel type
                    </FormLabel>
                    <div className="flex gap-2">
                      {channelTypeOptions.map(({ value, label, icon: Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={`flex-1 flex flex-col items-center p-3 rounded-md border transition ${
                            field.value === value
                              ? "border-indigo-500 bg-zinc-700"
                              : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                          }`}
                        >
                          <Icon className="h-5 w-5 mb-1" />
                          <span className="text-xs">{label}</span>
                        </button>
                      ))}
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase text-xs font-bold text-zinc-400">
                      Channel name
                    </FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="new-channel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-zinc-800 px-6 py-4">
              <Button variant="ghost" onClick={handleClose} type="button" className="text-zinc-400">
                Cancel
              </Button>
              <Button disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
