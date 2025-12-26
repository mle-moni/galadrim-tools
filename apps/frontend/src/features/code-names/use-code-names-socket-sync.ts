import { useEffect } from "react";
import { io } from "socket.io-client";

import type { ApiCodeNamesGame } from "@galadrim-tools/shared";
import type { IUserData } from "@galadrim-tools/shared";
import { useQueryClient } from "@tanstack/react-query";

import { getSocketApiUrl } from "@/integrations/backend/client";
import { queryKeys } from "@/integrations/backend/query-keys";

export function useCodeNamesSocketSync(me: IUserData | undefined) {
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

        socket.on("deleteCodeNamesGame", (payload: unknown) => {
            const gameId = Number(payload);
            if (!Number.isFinite(gameId)) return;

            queryClient.setQueryData<ApiCodeNamesGame[]>(queryKeys.codeNamesGames(), (old) => {
                if (!old) return old;
                return old.filter((game) => game.id !== gameId);
            });
        });

        return () => {
            socket.emit("logout");
            socket.removeAllListeners();
            socket.close();
        };
    }, [queryClient, socketToken, socketUserId]);
}
