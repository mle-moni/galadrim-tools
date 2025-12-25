import { useEffect } from "react";
import { io } from "socket.io-client";

import type { IIdea, IUserData } from "@galadrim-tools/shared";
import { useQueryClient } from "@tanstack/react-query";

import { getSocketApiUrl } from "@/integrations/backend/client";
import { normalizeIdea } from "@/integrations/backend/ideas";
import { queryKeys } from "@/integrations/backend/query-keys";

type ApiIdea = Parameters<typeof normalizeIdea>[0];

function upsertIdeaInList(ideas: IIdea[], incoming: IIdea) {
    const existingIndex = ideas.findIndex((i) => i.id === incoming.id);
    if (existingIndex === -1) return [incoming, ...ideas];

    const previous = ideas[existingIndex];
    const merged: IIdea = {
        ...previous,
        ...incoming,
        isOwner: previous.isOwner || incoming.isOwner,
    };

    const next = ideas.slice();
    next[existingIndex] = merged;
    return next;
}

export function useIdeasSocketSync(me: IUserData | undefined) {
    const queryClient = useQueryClient();

    const socketUserId = me?.id;
    const socketToken = me?.socketToken;

    useEffect(() => {
        if (socketUserId == null) return;
        if (!socketToken) return;

        const socket = io(getSocketApiUrl(), { transports: ["websocket"] });

        const authenticate = () => {
            socket.emit("auth", {
                userId: socketUserId,
                socketToken,
            });
        };

        socket.on("connect", authenticate);
        socket.on("auth", authenticate);

        const onUpsertIdea = (payload: ApiIdea) => {
            const idea = normalizeIdea(payload);

            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) => {
                if (!old) return [idea];
                return upsertIdeaInList(old, idea);
            });
        };

        socket.on("createIdea", onUpsertIdea);
        socket.on("updateIdea", onUpsertIdea);

        socket.on("deleteIdea", (payload: unknown) => {
            const maybeId =
                typeof payload === "number" ? payload : (payload as { id?: unknown } | null)?.id;
            const ideaId = Number(maybeId);
            if (!Number.isFinite(ideaId)) return;

            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) => {
                if (!old) return old;
                return old.filter((idea) => idea.id !== ideaId);
            });
        });

        return () => {
            socket.emit("logout");
            socket.removeAllListeners();
            socket.close();
        };
    }, [queryClient, socketToken, socketUserId]);
}
