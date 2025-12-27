import { useRef } from "react";

import {
    CheckCircle2,
    CircleDashed,
    MessageCircle,
    ThumbsDown,
    ThumbsUp,
    Trash2,
} from "lucide-react";

import { useDrag } from "react-dnd";

import type { IIdea, IIdeaNote } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import type { ApiUserShort } from "@/integrations/backend/users";
import { cn } from "@/lib/utils";
import { IDEA_DND_TYPE, type IdeaDragItem } from "./dnd";
import { formatFullDateFr, formatRelativeTimeFr, getIdeaVoteCounts } from "./ideas-utils";

const TILT_BUCKETS = 11;
const TILT_MIDDLE_BUCKET = 5;
const TILT_STEP_DEG = 0.2;

function getDeterministicTilt(ideaId: number) {
    const bucket = ideaId % TILT_BUCKETS;
    return (bucket - TILT_MIDDLE_BUCKET) * TILT_STEP_DEG;
}

function formatVoters(
    reactions: IIdeaNote[],
    isUpvote: boolean,
    usersById: Map<number, ApiUserShort>,
) {
    const userIds = reactions.filter((r) => r.isUpvote === isUpvote).map((r) => r.userId);
    if (userIds.length === 0) return null;

    const unique = Array.from(new Set(userIds));
    const labels = unique.map((id) => usersById.get(id)?.username ?? `#${id}`);

    const limit = 8;
    const shown = labels.slice(0, limit);
    const remaining = labels.length - shown.length;

    if (remaining > 0) return `${shown.join(", ")} (+${remaining})`;
    return shown.join(", ");
}

function getNotePalette(idea: IIdea, isBad: boolean) {
    if (idea.state === "DONE") return { bg: "#dcfce7", border: "#86efac" };
    if (isBad) return { bg: "#e2e8f0", border: "#cbd5e1" };

    const defaultPalette = { bg: "#fef9c3", border: "#fde047" };

    const palettes = [
        defaultPalette, // yellow
        { bg: "#ffedd5", border: "#fdba74" }, // orange
        { bg: "#e0f2fe", border: "#7dd3fc" }, // sky
        { bg: "#fae8ff", border: "#e9d5ff" }, // violet-ish
        { bg: "#ffe4e6", border: "#fda4af" }, // rose
    ];

    return palettes[idea.id % palettes.length] ?? defaultPalette;
}

export default function IdeaCard(props: {
    idea: IIdea;
    meId: number | null;
    isBad: boolean;
    isIdeasAdmin: boolean;
    usersById: Map<number, ApiUserShort>;
    onOpenComments: () => void;
    onVote: (ideaId: number, next: boolean) => void;
    onDelete: (ideaId: number) => void;
    isBusy?: boolean;
}) {
    const { idea } = props;

    const { upvotes, downvotes } = getIdeaVoteCounts(idea.reactions);

    const myReaction =
        props.meId === null
            ? null
            : idea.reactions.find((r) => r.userId === props.meId)?.isUpvote ?? null;

    const author = idea.createdBy ? props.usersById.get(idea.createdBy) : null;

    const palette = getNotePalette(idea, props.isBad);
    const tilt = props.isBad ? 0 : getDeterministicTilt(idea.id);

    const canModerate = props.isIdeasAdmin || idea.isOwner;

    const skipNextClickRef = useRef(false);

    const [{ isDragging }, dragRef] = useDrag(
        () => ({
            type: IDEA_DND_TYPE,
            item: { ideaId: idea.id } satisfies IdeaDragItem,
            canDrag: canModerate && !props.isBusy,
            end: () => {
                // Avoid opening comments on mouseup after a drag.
                skipNextClickRef.current = true;
                window.setTimeout(() => {
                    skipNextClickRef.current = false;
                }, 0);
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
        }),
        [idea.id, canModerate, props.isBusy],
    );

    const upvoteVoters = formatVoters(idea.reactions, true, props.usersById);
    const downvoteVoters = formatVoters(idea.reactions, false, props.usersById);

    return (
        <div
            ref={(node) => {
                dragRef(node);
            }}
            className={cn(
                "group relative w-full rounded-md border p-4 shadow-sm transition-shadow hover:shadow-md",
                "before:pointer-events-none before:absolute before:right-0 before:top-0 before:h-6 before:w-6 before:rounded-bl-md before:opacity-80",
                "after:pointer-events-none after:absolute after:-top-2 after:left-1/2 after:h-5 after:w-20 after:-translate-x-1/2 after:rotate-[-2deg] after:rounded-sm after:bg-white/35 after:shadow-sm",
                canModerate && !props.isBusy
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer",
                isDragging && "opacity-60",
                "mb-1",
            )}
            style={{
                backgroundColor: palette.bg,
                borderColor: palette.border,
                transform: `rotate(${tilt}deg)`,
            }}
            onClick={() => {
                if (skipNextClickRef.current) return;
                props.onOpenComments();
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    props.onOpenComments();
                }
            }}
            title={
                canModerate
                    ? "Cliquer: commentaires · Glisser pour déplacer"
                    : "Ouvrir les commentaires"
            }
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="text-xs font-medium text-slate-600">
                        {idea.state === "TODO" && (
                            <span className="inline-flex items-center gap-1">
                                <CircleDashed className="h-3.5 w-3.5" /> À faire
                            </span>
                        )}
                        {idea.state === "DOING" && (
                            <span className="inline-flex items-center gap-1">
                                <CircleDashed className="h-3.5 w-3.5" /> En cours
                            </span>
                        )}
                        {idea.state === "DONE" && (
                            <span className="inline-flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Terminée
                            </span>
                        )}
                    </div>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-900">
                        {idea.text}
                    </div>
                </div>

                {canModerate && (
                    <div
                        className="flex shrink-0 gap-1 opacity-90"
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-slate-700 hover:text-red-600"
                            title="Supprimer"
                            disabled={props.isBusy}
                            onClick={() => props.onDelete(idea.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-2 text-xs text-slate-600">
                <div className="min-w-0 truncate">
                    {props.isBad ? (
                        <span className="font-medium">Refusée</span>
                    ) : idea.createdBy ? (
                        <span className="font-medium">
                            {author?.username ?? `Utilisateur #${idea.createdBy}`}
                        </span>
                    ) : (
                        <span className="font-medium">Anonyme</span>
                    )}
                </div>
                <div title={formatFullDateFr(idea.createdAt)}>
                    {formatRelativeTimeFr(idea.createdAt)}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-2 px-2 text-slate-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        props.onOpenComments();
                    }}
                >
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-xs font-medium">{idea.comments.length}</span>
                </Button>

                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 gap-1.5 px-2",
                            myReaction === true ? "text-emerald-700" : "text-slate-700",
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            props.onVote(idea.id, true);
                        }}
                        disabled={props.meId === null || props.isBusy}
                        title={upvoteVoters ? `J'aime — ${upvoteVoters}` : "J'aime"}
                    >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="text-xs font-medium">{upvotes}</span>
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-8 gap-1.5 px-2",
                            myReaction === false ? "text-rose-700" : "text-slate-700",
                        )}
                        onClick={(e) => {
                            e.stopPropagation();
                            props.onVote(idea.id, false);
                        }}
                        disabled={props.meId === null || props.isBusy}
                        title={
                            downvoteVoters ? `Je n'aime pas — ${downvoteVoters}` : "Je n'aime pas"
                        }
                    >
                        <ThumbsDown className="h-4 w-4" />
                        <span className="text-xs font-medium">{downvotes}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
