"use client";

import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Message } from "@/types";

interface UseChatMessagesProps {
  channelId: string;
  apiUrl: string;
  queryKey: string;
}

export function useChatMessages({ channelId, apiUrl, queryKey }: UseChatMessagesProps) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const fetchMessages = async ({ pageParam }: { pageParam?: string }) => {
    const url = new URL(apiUrl, window.location.origin);
    url.searchParams.set("channelId", channelId);
    if (pageParam) url.searchParams.set("cursor", pageParam);

    const res = await fetch(url.toString());
    return res.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    refetchInterval: false,
  });

  // Supabase Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        async (payload) => {
          // Fetch the full message with member+profile
          const res = await fetch(
            `/api/messages?channelId=${channelId}&id=${payload.new.id}`
          );
          // Invalidate and refetch to get the new message with relations
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, queryClient, queryKey, supabase]);

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
}
