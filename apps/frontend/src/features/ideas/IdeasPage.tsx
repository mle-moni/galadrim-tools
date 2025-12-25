import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { IIdea, IdeaState } from "@galadrim-tools/shared";

import { useDrop } from "react-dnd";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

import { meQueryOptions } from "@/integrations/backend/auth";
import {
    ideasQueryOptions,
    useDeleteIdeaMutation,
    useToggleIdeaVoteMutation,
    useUpdateIdeaMutation,
} from "@/integrations/backend/ideas";
import { usersQueryOptions, type ApiUserShort } from "@/integrations/backend/users";

import { RIGHTS } from "@/lib/rights";

import CreateIdeaSheet from "./CreateIdeaSheet";
import IdeaCard from "./IdeaCard";
import IdeaCommentsSheet from "./IdeaCommentsSheet";
import { IDEA_DND_TYPE, type IdeaDragItem } from "./dnd";
import { isIdeaBad } from "./ideas-utils";
import { useIdeasSocketSync } from "./use-ideas-socket-sync";

export default function IdeasPage(props: { ideaId?: number }) {
    const router = useRouter();

    const meQuery = useQuery(meQueryOptions());
    const ideasQuery = useQuery(ideasQueryOptions());
    const usersQuery = useQuery(usersQueryOptions());

    useIdeasSocketSync(meQuery.data);

    const meId = meQuery.data?.id ?? null;
    const isIdeasAdmin = ((meQuery.data?.rights ?? 0) & RIGHTS.IDEAS_ADMIN) !== 0;

    const ideas = ideasQuery.data ?? [];

    const usersById = useMemo(() => {
        const map = new Map<number, ApiUserShort>();
        for (const user of usersQuery.data ?? []) map.set(user.id, user);
        return map;
    }, [usersQuery.data]);

    const ideasById = useMemo(() => {
        const map = new Map<number, IIdea>();
        for (const idea of ideas) map.set(idea.id, idea);
        return map;
    }, [ideas]);

    const { todoIdeas, doingIdeas, doneIdeas, refusedIdeas } = useMemo(() => {
        const refused: IIdea[] = [];
        const todo: IIdea[] = [];
        const doing: IIdea[] = [];
        const done: IIdea[] = [];

        for (const idea of ideas) {
            const bad = isIdeaBad(idea.reactions);
            if (idea.state === "TODO" && bad) {
                refused.push(idea);
                continue;
            }

            if (idea.state === "DOING") {
                doing.push(idea);
                continue;
            }

            if (idea.state === "DONE") {
                done.push(idea);
                continue;
            }

            todo.push(idea);
        }

        const sortByNewest = (a: IIdea, b: IIdea) => b.createdAt.getTime() - a.createdAt.getTime();
        refused.sort(sortByNewest);
        todo.sort(sortByNewest);
        doing.sort(sortByNewest);
        done.sort(sortByNewest);

        return { todoIdeas: todo, doingIdeas: doing, doneIdeas: done, refusedIdeas: refused };
    }, [ideas]);

    const selectedIdea = useMemo(() => {
        if (!props.ideaId) return null;
        return ideasById.get(props.ideaId) ?? null;
    }, [ideasById, props.ideaId]);

    const commentSheetOpen = props.ideaId != null;

    const [createOpen, setCreateOpen] = useState(false);
    const [refusedOpen, setRefusedOpen] = useState(false);

    const updateIdeaMutation = useUpdateIdeaMutation();
    const deleteIdeaMutation = useDeleteIdeaMutation();
    const toggleVoteMutation = useToggleIdeaVoteMutation();

    const isBusy =
        updateIdeaMutation.isPending ||
        deleteIdeaMutation.isPending ||
        toggleVoteMutation.isPending;

    const openComments = (ideaId: number) => {
        router.history.push(`/ideas?ideaId=${ideaId}`);
    };

    const canMoveIdea = (ideaId: number, toState: IdeaState) => {
        const idea = ideasById.get(ideaId);
        if (!idea) return false;

        const canModerate = isIdeasAdmin || idea.isOwner;
        if (!canModerate) return false;

        return idea.state !== toState;
    };

    const moveIdea = (ideaId: number, toState: IdeaState) => {
        if (!canMoveIdea(ideaId, toState)) return;

        const idea = ideasById.get(ideaId);
        if (!idea) return;

        setIdeaState(idea, toState);
    };

    const voteIdea = (ideaId: number, next: boolean) => {
        if (meId === null) return;
        const idea = ideasById.get(ideaId);
        if (!idea) return;

        const current = idea.reactions.find((r) => r.userId === meId)?.isUpvote ?? null;
        const isUpvote = current === next ? null : next;

        const promise = toggleVoteMutation.mutateAsync({
            ideaId,
            userId: meId,
            isUpvote,
        });

        toast.promise(promise, {
            loading: "Vote…",
            success: "Vote enregistré",
            error: (error) =>
                error instanceof Error
                    ? error.message
                    : "Votre vote n'a pas pu être pris en compte",
        });
    };

    const deleteIdea = (ideaId: number) => {
        if (props.ideaId === ideaId) router.history.push("/ideas");

        const promise = deleteIdeaMutation.mutateAsync({ ideaId });
        toast.promise(promise, {
            loading: "Suppression…",
            success: "Idée supprimée",
            error: (error) =>
                error instanceof Error ? error.message : "Impossible de supprimer cette idée",
        });
    };

    const setIdeaState = (idea: IIdea, state: IdeaState) => {
        const promise = updateIdeaMutation.mutateAsync({
            ideaId: idea.id,
            text: idea.text,
            state,
        });

        toast.promise(promise, {
            loading: "Mise à jour…",
            success: "Idée mise à jour",
            error: (error) =>
                error instanceof Error ? error.message : "Impossible de mettre à jour cette idée",
        });
    };

    return (
        <div className="h-full min-h-0 w-full overflow-auto bg-white">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="text-2xl font-semibold tracking-tight">Boîte à idées</div>
                        <div className="text-sm text-muted-foreground">
                            Propose des améliorations, vote, et commente.
                        </div>
                    </div>

                    <Button type="button" onClick={() => setCreateOpen(true)}>
                        <Lightbulb className="h-4 w-4" />
                        J'ai une idée
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2">
                    <KanbanColumn
                        title="À faire"
                        state="TODO"
                        ideas={todoIdeas}
                        meId={meId}
                        isIdeasAdmin={isIdeasAdmin}
                        usersById={usersById}
                        isBusy={isBusy}
                        onOpenComments={openComments}
                        onVote={voteIdea}
                        onDelete={deleteIdea}
                        canMoveIdea={canMoveIdea}
                        onMoveIdea={moveIdea}
                    />

                    <KanbanColumn
                        title="En cours"
                        state="DOING"
                        ideas={doingIdeas}
                        meId={meId}
                        isIdeasAdmin={isIdeasAdmin}
                        usersById={usersById}
                        isBusy={isBusy}
                        onOpenComments={openComments}
                        onVote={voteIdea}
                        onDelete={deleteIdea}
                        canMoveIdea={canMoveIdea}
                        onMoveIdea={moveIdea}
                    />

                    <KanbanColumn
                        title="Terminées"
                        state="DONE"
                        ideas={doneIdeas}
                        meId={meId}
                        isIdeasAdmin={isIdeasAdmin}
                        usersById={usersById}
                        isBusy={isBusy}
                        onOpenComments={openComments}
                        onVote={voteIdea}
                        onDelete={deleteIdea}
                        canMoveIdea={canMoveIdea}
                        onMoveIdea={moveIdea}
                    />
                </div>

                <div className="rounded-lg border bg-slate-50/40 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold text-slate-900">Refusées</div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs text-slate-700">
                                {refusedIdeas.length}
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={refusedIdeas.length === 0}
                                onClick={() => setRefusedOpen((v) => !v)}
                            >
                                {refusedOpen ? "Masquer" : "Afficher"}
                            </Button>
                        </div>
                    </div>

                    {refusedOpen && (
                        <ScrollArea className="mt-3 max-h-[60vh] pr-2">
                            <IdeaList
                                ideas={refusedIdeas}
                                meId={meId}
                                isIdeasAdmin={isIdeasAdmin}
                                usersById={usersById}
                                isBusy={isBusy}
                                forceBad
                                onOpenComments={openComments}
                                onVote={voteIdea}
                                onDelete={deleteIdea}
                            />
                        </ScrollArea>
                    )}
                </div>

                {(meQuery.isLoading || ideasQuery.isLoading) && <IdeasLoadingSkeleton />}
            </div>

            <CreateIdeaSheet open={createOpen} onOpenChange={setCreateOpen} meId={meId} />

            <IdeaCommentsSheet
                open={commentSheetOpen}
                onOpenChange={(open) => {
                    if (open) return;
                    router.history.push("/ideas");
                }}
                idea={selectedIdea}
                meId={meId}
                users={usersQuery.data}
            />
        </div>
    );
}

type KanbanColumnProps = {
    title: string;
    state: IdeaState;
    ideas: IIdea[];
    meId: number | null;
    isIdeasAdmin: boolean;
    usersById: Map<number, ApiUserShort>;
    isBusy: boolean;
    onOpenComments: (ideaId: number) => void;
    onVote: (ideaId: number, next: boolean) => void;
    onDelete: (ideaId: number) => void;
    canMoveIdea: (ideaId: number, toState: IdeaState) => boolean;
    onMoveIdea: (ideaId: number, toState: IdeaState) => void;
};

function KanbanColumn(props: KanbanColumnProps) {
    const [{ isOver, canDrop }, dropRef] = useDrop(() => {
        return {
            accept: IDEA_DND_TYPE,
            canDrop: (item: IdeaDragItem) => props.canMoveIdea(item.ideaId, props.state),
            drop: (item: IdeaDragItem) => props.onMoveIdea(item.ideaId, props.state),
            collect: (monitor) => ({
                isOver: monitor.isOver({ shallow: true }),
                canDrop: monitor.canDrop(),
            }),
        };
    }, [props.canMoveIdea, props.onMoveIdea, props.state]);

    const ringClass = isOver ? (canDrop ? "ring-2 ring-emerald-400" : "ring-2 ring-slate-300") : "";

    const baseCount = props.ideas.length;

    return (
        <div
            ref={(node) => {
                dropRef(node);
            }}
            className={cn(
                "flex h-[70vh] w-[340px] shrink-0 flex-col rounded-lg border bg-slate-50/40 p-3",
                ringClass,
            )}
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-900">{props.title}</div>
                <div className="flex items-center gap-2">
                    <span className="rounded-md bg-black/5 px-2 py-0.5 text-xs text-slate-700">
                        {baseCount}
                    </span>
                </div>
            </div>

            <ScrollArea className="min-h-0 flex-1 pr-2">
                <div className="flex flex-col gap-3">
                    <IdeaList
                        ideas={props.ideas}
                        meId={props.meId}
                        isIdeasAdmin={props.isIdeasAdmin}
                        usersById={props.usersById}
                        isBusy={props.isBusy}
                        onOpenComments={props.onOpenComments}
                        onVote={props.onVote}
                        onDelete={props.onDelete}
                    />
                </div>
            </ScrollArea>
        </div>
    );
}

function IdeaList(props: {
    ideas: IIdea[];
    meId: number | null;
    isIdeasAdmin: boolean;
    usersById: Map<number, ApiUserShort>;
    isBusy: boolean;
    forceBad?: boolean;
    onOpenComments: (ideaId: number) => void;
    onVote: (ideaId: number, next: boolean) => void;
    onDelete: (ideaId: number) => void;
}) {
    if (props.ideas.length === 0) {
        return (
            <div className="rounded-md border bg-white/50 p-4 text-sm text-muted-foreground">
                Rien à afficher.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {props.ideas.map((idea) => {
                const isBad = props.forceBad ? true : isIdeaBad(idea.reactions);

                return (
                    <IdeaCard
                        key={idea.id}
                        idea={idea}
                        meId={props.meId}
                        isBad={isBad}
                        isIdeasAdmin={props.isIdeasAdmin}
                        usersById={props.usersById}
                        onOpenComments={() => props.onOpenComments(idea.id)}
                        onVote={props.onVote}
                        onDelete={props.onDelete}
                        isBusy={props.isBusy}
                    />
                );
            })}
        </div>
    );
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function IdeasLoadingSkeleton() {
    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {SKELETON_KEYS.slice(0, 3).map((key) => (
                <div key={key} className="rounded-lg border bg-slate-50/40 p-3">
                    <div className="mb-3 flex items-center justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-8" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}
