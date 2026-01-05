import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  CircleDashed,
  Lightbulb,
  Rocket,
  ThumbsDown,
} from 'lucide-react'
import { toast } from 'sonner'

import { useRouter } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import type { IIdea, IdeaState } from '@galadrim-tools/shared'

import PageTitle from '@/components/PageTitle'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { meQueryOptions } from '@/integrations/backend/auth'
import {
  ideasQueryOptions,
  useDeleteIdeaMutation,
  useToggleIdeaVoteMutation,
  useUpdateIdeaMutation,
} from '@/integrations/backend/ideas'
import {
  usersQueryOptions,
  type ApiUserShort,
} from '@/integrations/backend/users'

import { RIGHTS } from '@/lib/rights'

import CreateIdeaSheet from './CreateIdeaSheet'
import IdeaCard from './IdeaCard'
import IdeaCommentsSheet from './IdeaCommentsSheet'
import { isIdeaBad } from './ideas-utils'
import { useIdeasSocketSync } from './use-ideas-socket-sync'

export default function IdeasPage(props: { ideaId?: number }) {
  const router = useRouter()

  const meQuery = useQuery(meQueryOptions())
  const ideasQuery = useQuery(ideasQueryOptions())
  const usersQuery = useQuery(usersQueryOptions())

  useIdeasSocketSync(meQuery.data)

  const meId = meQuery.data?.id ?? null
  const isIdeasAdmin = ((meQuery.data?.rights ?? 0) & RIGHTS.IDEAS_ADMIN) !== 0

  const ideas = ideasQuery.data ?? []

  const usersById = useMemo(() => {
    const map = new Map<number, ApiUserShort>()
    for (const user of usersQuery.data ?? []) map.set(user.id, user)
    return map
  }, [usersQuery.data])

  const ideasById = useMemo(() => {
    const map = new Map<number, IIdea>()
    for (const idea of ideas) map.set(idea.id, idea)
    return map
  }, [ideas])

  const { todoIdeas, doingIdeas, doneIdeas, refusedIdeas } = useMemo(() => {
    const refused: IIdea[] = []
    const todo: IIdea[] = []
    const doing: IIdea[] = []
    const done: IIdea[] = []

    for (const idea of ideas) {
      const bad = isIdeaBad(idea.reactions)
      if (idea.state === 'TODO' && bad) {
        refused.push(idea)
        continue
      }

      if (idea.state === 'DOING') {
        doing.push(idea)
        continue
      }

      if (idea.state === 'DONE') {
        done.push(idea)
        continue
      }

      todo.push(idea)
    }

    const sortByNewest = (a: IIdea, b: IIdea) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    refused.sort(sortByNewest)
    todo.sort(sortByNewest)
    doing.sort(sortByNewest)
    done.sort(sortByNewest)

    return {
      todoIdeas: todo,
      doingIdeas: doing,
      doneIdeas: done,
      refusedIdeas: refused,
    }
  }, [ideas])

  const selectedIdea = useMemo(() => {
    if (!props.ideaId) return null
    return ideasById.get(props.ideaId) ?? null
  }, [ideasById, props.ideaId])

  const commentSheetOpen = props.ideaId != null

  const [createOpen, setCreateOpen] = useState(false)

  const updateIdeaMutation = useUpdateIdeaMutation()
  const deleteIdeaMutation = useDeleteIdeaMutation()
  const toggleVoteMutation = useToggleIdeaVoteMutation()

  const isBusy =
    updateIdeaMutation.isPending ||
    deleteIdeaMutation.isPending ||
    toggleVoteMutation.isPending

  const isLoading =
    meQuery.isLoading || ideasQuery.isLoading || usersQuery.isLoading

  const openComments = (ideaId: number) => {
    router.history.push(`/ideas?ideaId=${ideaId}`)
  }

  const canMoveIdea = (ideaId: number, toState: IdeaState) => {
    const idea = ideasById.get(ideaId)
    if (!idea) return false

    const canModerate = isIdeasAdmin || idea.isOwner
    if (!canModerate) return false

    return idea.state !== toState
  }

  const setIdeaState = (idea: IIdea, state: IdeaState) => {
    const promise = updateIdeaMutation.mutateAsync({
      ideaId: idea.id,
      text: idea.text,
      state,
    })

    toast.promise(promise, {
      loading: 'Mise à jour…',
      success: 'Idée mise à jour',
      error: (error) =>
        error instanceof Error
          ? error.message
          : 'Impossible de mettre à jour cette idée',
    })
  }

  const moveIdea = (ideaId: number, toState: IdeaState) => {
    if (!canMoveIdea(ideaId, toState)) return

    const idea = ideasById.get(ideaId)
    if (!idea) return

    setIdeaState(idea, toState)
  }

  const voteIdea = (ideaId: number, next: boolean) => {
    if (meId === null) return
    const idea = ideasById.get(ideaId)
    if (!idea) return

    const current =
      idea.reactions.find((r) => r.userId === meId)?.isUpvote ?? null
    const isUpvote = current === next ? null : next

    const promise = toggleVoteMutation.mutateAsync({
      ideaId,
      userId: meId,
      isUpvote,
    })

    toast.promise(promise, {
      loading: 'Vote…',
      success: 'Vote enregistré',
      error: (error) =>
        error instanceof Error
          ? error.message
          : "Votre vote n'a pas pu être pris en compte",
    })
  }

  const deleteIdea = (ideaId: number) => {
    if (props.ideaId === ideaId) router.history.push('/ideas')

    const promise = deleteIdeaMutation.mutateAsync({ ideaId })
    toast.promise(promise, {
      loading: 'Suppression…',
      success: 'Idée supprimée',
      error: (error) =>
        error instanceof Error
          ? error.message
          : 'Impossible de supprimer cette idée',
    })
  }

  return (
    <div className="h-full min-h-0 w-full overflow-auto bg-amber-50/30">
      <div className="flex w-full flex-col">
        <header className="border-b bg-background px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <PageTitle icon={Lightbulb}>Boîte à idées</PageTitle>
            </div>

            <Button type="button" onClick={() => setCreateOpen(true)}>
              <Lightbulb className="h-4 w-4" />
              J'ai une idée
            </Button>
          </div>
        </header>

        <div className="flex w-full flex-col gap-4 px-4 py-4 md:px-6 md:py-6">
          <Tabs defaultValue="TODO" className="w-full">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <TabsList className="w-full md:w-fit">
                <TabsTrigger value="TODO" className="gap-2">
                  <CircleDashed className="h-4 w-4" />À faire
                  <CountPill count={todoIdeas.length} />
                </TabsTrigger>
                <TabsTrigger value="DOING" className="gap-2">
                  <Rocket className="h-4 w-4" />
                  En cours
                  <CountPill count={doingIdeas.length} />
                </TabsTrigger>
                <TabsTrigger value="DONE" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Terminées
                  <CountPill count={doneIdeas.length} />
                </TabsTrigger>
                <TabsTrigger value="REFUSED" className="gap-2">
                  <ThumbsDown className="h-4 w-4" />
                  Refusées
                  <CountPill count={refusedIdeas.length} />
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="TODO" className="mt-4">
              {isLoading ? (
                <IdeasLoadingSkeleton />
              ) : (
                <IdeasGrid
                  ideas={todoIdeas}
                  meId={meId}
                  isIdeasAdmin={isIdeasAdmin}
                  usersById={usersById}
                  isBusy={isBusy}
                  onOpenComments={openComments}
                  onVote={voteIdea}
                  onDelete={deleteIdea}
                  onMoveIdea={moveIdea}
                />
              )}
            </TabsContent>

            <TabsContent value="DOING" className="mt-4">
              {isLoading ? (
                <IdeasLoadingSkeleton />
              ) : (
                <IdeasGrid
                  ideas={doingIdeas}
                  meId={meId}
                  isIdeasAdmin={isIdeasAdmin}
                  usersById={usersById}
                  isBusy={isBusy}
                  onOpenComments={openComments}
                  onVote={voteIdea}
                  onDelete={deleteIdea}
                  onMoveIdea={moveIdea}
                />
              )}
            </TabsContent>

            <TabsContent value="DONE" className="mt-4">
              {isLoading ? (
                <IdeasLoadingSkeleton />
              ) : (
                <IdeasGrid
                  ideas={doneIdeas}
                  meId={meId}
                  isIdeasAdmin={isIdeasAdmin}
                  usersById={usersById}
                  isBusy={isBusy}
                  onOpenComments={openComments}
                  onVote={voteIdea}
                  onDelete={deleteIdea}
                  onMoveIdea={moveIdea}
                />
              )}
            </TabsContent>

            <TabsContent value="REFUSED" className="mt-4">
              {isLoading ? (
                <IdeasLoadingSkeleton />
              ) : (
                <IdeasGrid
                  ideas={refusedIdeas}
                  meId={meId}
                  isIdeasAdmin={isIdeasAdmin}
                  usersById={usersById}
                  isBusy={isBusy}
                  forceBad
                  onOpenComments={openComments}
                  onVote={voteIdea}
                  onDelete={deleteIdea}
                  onMoveIdea={moveIdea}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateIdeaSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        meId={meId}
      />

      <IdeaCommentsSheet
        open={commentSheetOpen}
        onOpenChange={(open) => {
          if (open) return
          router.history.push('/ideas')
        }}
        idea={selectedIdea}
        meId={meId}
        users={usersQuery.data}
      />
    </div>
  )
}

function CountPill(props: { count: number }) {
  return (
    <span className="ml-1 rounded-md bg-black/5 px-2 py-0.5 text-xs text-slate-700">
      {props.count}
    </span>
  )
}

function IdeasGrid(props: {
  ideas: IIdea[]
  meId: number | null
  isIdeasAdmin: boolean
  usersById: Map<number, ApiUserShort>
  isBusy: boolean
  forceBad?: boolean
  onOpenComments: (ideaId: number) => void
  onVote: (ideaId: number, next: boolean) => void
  onDelete: (ideaId: number) => void
  onMoveIdea: (ideaId: number, toState: IdeaState) => void
}) {
  if (props.ideas.length === 0) {
    return (
      <div className="rounded-lg border bg-white/60 p-8 text-center shadow-sm">
        <div className="text-sm font-medium text-slate-900">
          Rien à afficher
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Ajoute une idée ou reviens plus tard.
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {props.ideas.map((idea) => {
        const isBad = props.forceBad ? true : isIdeaBad(idea.reactions)

        return (
          <div key={idea.id} className="min-w-0">
            <IdeaCard
              idea={idea}
              meId={props.meId}
              isBad={isBad}
              isIdeasAdmin={props.isIdeasAdmin}
              usersById={props.usersById}
              onOpenComments={() => props.onOpenComments(idea.id)}
              onVote={props.onVote}
              onDelete={props.onDelete}
              onSetState={props.onMoveIdea}
              isBusy={props.isBusy}
            />
          </div>
        )
      })}
    </div>
  )
}

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

function IdeasLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {SKELETON_KEYS.map((key) => (
        <div key={key} className="rounded-lg border bg-white/60 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
