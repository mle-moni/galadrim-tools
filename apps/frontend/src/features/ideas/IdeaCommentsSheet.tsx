import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

import type { IIdea } from "@galadrim-tools/shared";

import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import type { ApiUserShort } from "@/integrations/backend/users";
import { useCreateIdeaCommentMutation } from "@/integrations/backend/ideas";
import { formatFullDateFr, formatRelativeTimeFr } from "./ideas-utils";

function CommentBubble(props: {
    message: string;
    isSelf: boolean;
}) {
    return (
        <div
            className={`max-w-[85%] rounded-lg border px-3 py-2 text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                props.isSelf ? "border-slate-300 bg-slate-100" : "border-slate-200 bg-white"
            }`}
        >
            {props.message}
        </div>
    );
}

export default function IdeaCommentsSheet(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    idea: IIdea | null;
    meId: number | null;
    users: ApiUserShort[] | undefined;
}) {
    const [message, setMessage] = useState("");

    const commentMutation = useCreateIdeaCommentMutation();

    const usersById = useMemo(() => {
        const map = new Map<number, ApiUserShort>();
        for (const user of props.users ?? []) map.set(user.id, user);
        return map;
    }, [props.users]);

    const bottomRef = useRef<HTMLDivElement | null>(null);
    const lastScrollKeyRef = useRef("");

    useEffect(() => {
        if (!props.open) {
            lastScrollKeyRef.current = "";
            return;
        }

        const key = `${props.idea?.id ?? "none"}:${props.idea?.comments.length ?? 0}`;
        if (key === lastScrollKeyRef.current) return;

        lastScrollKeyRef.current = key;
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    const canSubmit =
        props.idea &&
        props.meId !== null &&
        message.trim().length > 0 &&
        !commentMutation.isPending;

    return (
        <Sheet open={props.open} onOpenChange={props.onOpenChange}>
            <SheetContent className="sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Commentaires
                    </SheetTitle>
                    <SheetDescription>
                        {props.idea ? "Discussion autour de l'idée" : "Chargement…"}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex h-full min-h-0 flex-col gap-3 px-4 pb-4">
                    {props.idea ? (
                        <div className="rounded-md border bg-muted/25 px-3 py-2 text-sm whitespace-pre-wrap">
                            {props.idea.text}
                        </div>
                    ) : (
                        <div className="rounded-md border bg-muted/25 px-3 py-2 text-sm text-muted-foreground">
                            …
                        </div>
                    )}

                    <ScrollArea className="min-h-0 flex-1 rounded-md border bg-background">
                        <div className="flex flex-col gap-3 p-3">
                            {(props.idea?.comments ?? []).map((comment) => {
                                const isSelf = props.meId !== null && comment.userId === props.meId;
                                const user = usersById.get(comment.userId);
                                const createdAt = comment.createdAt ?? null;

                                return (
                                    <div
                                        key={comment.id}
                                        className={`flex gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                                    >
                                        <Avatar
                                            src={user?.imageUrl ?? null}
                                            alt={user?.username ?? String(comment.userId)}
                                            size={28}
                                            className="mt-0.5"
                                        />

                                        <div
                                            className={`flex min-w-0 flex-1 flex-col gap-1 ${
                                                isSelf ? "items-end" : "items-start"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <div className="max-w-[14rem] truncate">
                                                    {user?.username ??
                                                        `Utilisateur #${comment.userId}`}
                                                </div>
                                                {createdAt && (
                                                    <div title={formatFullDateFr(createdAt)}>
                                                        {formatRelativeTimeFr(createdAt)}
                                                    </div>
                                                )}
                                            </div>
                                            <CommentBubble
                                                message={comment.message}
                                                isSelf={isSelf}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                    </ScrollArea>

                    <div className="flex items-end gap-2">
                        <textarea
                            className="min-h-10 max-h-32 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Laissez un commentaire…"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button
                            type="button"
                            size="icon"
                            disabled={!canSubmit}
                            onClick={() => {
                                if (!props.idea) return;
                                if (props.meId === null) return;

                                const trimmed = message.trim();
                                if (!trimmed) return;

                                const promise = commentMutation
                                    .mutateAsync({
                                        ideaId: props.idea.id,
                                        message: trimmed,
                                        userId: props.meId,
                                    })
                                    .then(() => setMessage(""));

                                toast.promise(promise, {
                                    loading: "Envoi…",
                                    success: "Commentaire envoyé",
                                    error: (error) =>
                                        error instanceof Error
                                            ? error.message
                                            : "Impossible d'envoyer ce commentaire",
                                });
                            }}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
