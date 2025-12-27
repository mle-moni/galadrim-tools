import { useEffect } from "react";
import { io } from "socket.io-client";

import type { IIdea, IUserData } from "@galadrim-tools/shared";
import { useQueryClient } from "@tanstack/react-query";

import { getSocketApiUrl } from "@/integrations/backend/client";
import { normalizeIdea } from "@/integrations/backend/ideas";
import { queryKeys } from "@/integrations/backend/query-keys";
import { removeById, upsertById } from "@/lib/collections";
import { parseId } from "@galadrim-tools/shared";

type ApiIdea = Parameters<typeof normalizeIdea>[0];

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

            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) =>
                upsertById(old, idea, (previous, next) => ({
                    ...previous,
                    ...next,
                    isOwner: previous.isOwner || next.isOwner,
                })),
            );
        };

        socket.on("createIdea", onUpsertIdea);
        socket.on("updateIdea", onUpsertIdea);

        socket.on("deleteIdea", (payload: unknown) => {
            const ideaId = parseId(payload);
            if (ideaId == null) return;

            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) => removeById(old, ideaId));
        });

        return () => {
            socket.emit("logout");
            socket.removeAllListeners();
            socket.close();
        };
    }, [queryClient, socketToken, socketUserId]);
}
