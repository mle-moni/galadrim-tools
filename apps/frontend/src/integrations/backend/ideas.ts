import type { ApiError, IIdea, IIdeaComment, IIdeaNote, IdeaState } from "@galadrim-tools/shared";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { APPLICATION_JSON_HEADERS, fetchBackendJson, getErrorMessage } from "./client";
import { queryKeys } from "./query-keys";

import { removeById, upsertById } from "../../lib/collections";

type ApiIdeaComment = Omit<IIdeaComment, "createdAt"> & {
    createdAt?: string | Date;
};

type ApiIdea = Omit<IIdea, "createdAt" | "comments"> & {
    createdAt: string | Date;
    comments: ApiIdeaComment[];
};

function normalizeIdeaComment(comment: ApiIdeaComment): IIdeaComment {
    return {
        ...comment,
        createdAt: comment.createdAt ? new Date(comment.createdAt) : undefined,
    };
}

export function normalizeIdea(idea: ApiIdea): IIdea {
    return {
        ...idea,
        createdAt: new Date(idea.createdAt),
        comments: idea.comments.map(normalizeIdeaComment),
    };
}

export async function fetchIdeas(): Promise<IIdea[]> {
    const res = await fetchBackendJson<ApiIdea[], ApiError>("/ideas", "GET");

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de récupérer les idées"));
    }

    return res.json.map(normalizeIdea);
}

export function ideasQueryOptions() {
    return queryOptions({
        queryKey: queryKeys.ideas(),
        queryFn: fetchIdeas,
        retry: false,
    });
}

export type CreateIdeaInput = {
    text: string;
    isAnonymous: boolean;
};

type CreateIdeaResponse = { message: string; idea: ApiIdea };

async function createIdea(input: CreateIdeaInput): Promise<IIdea> {
    const res = await fetchBackendJson<CreateIdeaResponse, ApiError>("/ideas", "POST", {
        body: JSON.stringify({ text: input.text, isAnonymous: input.isAnonymous }),
        headers: APPLICATION_JSON_HEADERS,
    });

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de publier cette idée"));
    }

    return normalizeIdea(res.json.idea);
}

export function useCreateIdeaMutation(meId: number | null) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateIdeaInput) => createIdea(input),
        onSuccess: (idea) => {
            const withOwner = meId === null ? idea : { ...idea, isOwner: true };

            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) =>
                upsertById(old, withOwner, (previous, next) => ({
                    ...previous,
                    ...next,
                    // Some websocket / update events aren't personalized and may lose ownership.
                    isOwner: previous.isOwner || next.isOwner,
                })),
            );
        },
    });
}

export type UpdateIdeaInput = {
    ideaId: number;
    text: string;
    state?: IdeaState;
};

type UpdateIdeaResponse = { message: string; idea: ApiIdea };

async function updateIdea(input: UpdateIdeaInput): Promise<IIdea> {
    const body = new FormData();
    body.append("ideaId", String(input.ideaId));
    body.append("text", input.text);
    if (input.state !== undefined) body.append("state", input.state);

    const res = await fetchBackendJson<UpdateIdeaResponse, ApiError>(
        `/ideas/${input.ideaId}`,
        "PUT",
        { body },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de mettre à jour cette idée"));
    }

    return normalizeIdea(res.json.idea);
}

export function useUpdateIdeaMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: UpdateIdeaInput) => updateIdea(input),
        onSuccess: (idea) => {
            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) =>
                upsertById(old, idea, (previous, next) => ({
                    ...previous,
                    ...next,
                    // Some websocket / update events aren't personalized and may lose ownership.
                    isOwner: previous.isOwner || next.isOwner,
                })),
            );
        },
    });
}

export type DeleteIdeaInput = { ideaId: number };

async function deleteIdea(input: DeleteIdeaInput): Promise<void> {
    const res = await fetchBackendJson<{ message: string }, ApiError>(
        `/ideas/${input.ideaId}`,
        "DELETE",
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Impossible de supprimer cette idée"));
    }
}

export function useDeleteIdeaMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: DeleteIdeaInput) => deleteIdea(input),
        onSuccess: (_value, input) => {
            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) =>
                removeById(old, input.ideaId),
            );
        },
    });
}

export type ToggleIdeaVoteInput = {
    ideaId: number;
    userId: number;
    isUpvote: boolean | null;
};

type ToggleIdeaVoteResponse = { message: string; ideaVote: IIdeaNote } | { message: string };

async function toggleIdeaVote(input: ToggleIdeaVoteInput): Promise<ToggleIdeaVoteResponse> {
    const body = {
        ideaId: input.ideaId,
        ...(input.isUpvote === null ? {} : { isUpvote: input.isUpvote }),
    };

    const res = await fetchBackendJson<ToggleIdeaVoteResponse, ApiError>(
        "/createOrUpdateIdeaVote",
        "POST",
        {
            body: JSON.stringify(body),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Votre vote n'a pas pu être pris en compte"));
    }

    return res.json;
}

export function useToggleIdeaVoteMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: ToggleIdeaVoteInput) => toggleIdeaVote(input),
        onSuccess: (_data, input) => {
            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) => {
                if (!old) return old;

                return old.map((idea) => {
                    if (idea.id !== input.ideaId) return idea;

                    const withoutUserVote = idea.reactions.filter((r) => r.userId !== input.userId);
                    const nextReactions =
                        input.isUpvote === null
                            ? withoutUserVote
                            : [
                                  ...withoutUserVote,
                                  {
                                      ideaId: input.ideaId,
                                      userId: input.userId,
                                      isUpvote: input.isUpvote,
                                  },
                              ];

                    return { ...idea, reactions: nextReactions };
                });
            });
        },
    });
}

export type CreateIdeaCommentInput = {
    ideaId: number;
    message: string;
    userId: number;
};

type CreateIdeaCommentResponse = { message: string; ideaComment: ApiIdeaComment };

async function createIdeaComment(input: CreateIdeaCommentInput): Promise<IIdeaComment> {
    const res = await fetchBackendJson<CreateIdeaCommentResponse, ApiError>(
        "/createIdeaComment",
        "POST",
        {
            body: JSON.stringify({ ideaId: input.ideaId, message: input.message }),
            headers: APPLICATION_JSON_HEADERS,
        },
    );

    if (!res.ok) {
        throw new Error(getErrorMessage(res.json, "Votre commentaire n'a pas pu être envoyé"));
    }

    return normalizeIdeaComment(res.json.ideaComment);
}

export function useCreateIdeaCommentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (input: CreateIdeaCommentInput) => createIdeaComment(input),
        onSuccess: (comment, input) => {
            queryClient.setQueryData<IIdea[]>(queryKeys.ideas(), (old) => {
                if (!old) return old;

                return old.map((idea) => {
                    if (idea.id !== input.ideaId) return idea;
                    return { ...idea, comments: [...idea.comments, comment] };
                });
            });
        },
    });
}
