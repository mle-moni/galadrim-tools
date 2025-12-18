import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { IUserData } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login, meQueryOptions } from "@/integrations/backend/auth";
import { queryKeys } from "@/integrations/backend/query-keys";

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>) => ({
        redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    }),
    component: LoginRoute,
});

function LoginRoute() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { redirect } = Route.useSearch();

    const meQuery = useQuery(meQueryOptions());

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        if (!meQuery.data) return;
        router.history.replace(redirect ?? "/planning");
    }, [meQuery.data, redirect, router.history]);

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (user: IUserData) => {
            queryClient.setQueryData(queryKeys.me(), user);
            router.history.push(redirect ?? "/planning");
        },
        onError: (error: unknown) => {
            setFormError(
                error instanceof Error ? error.message : "Adresse mail ou mot de passe incorrect",
            );
        },
    });

    const canSubmit = useMemo(() => {
        return email.trim() !== "" && password !== "" && !loginMutation.isPending;
    }, [email, password, loginMutation.isPending]);

    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Connexion</CardTitle>
                    <CardDescription>Connecte-toi pour réserver une salle</CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            setFormError(null);
                            loginMutation.mutate({ email, password });
                        }}
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="email">Adresse e-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {formError && (
                            <div className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {formError}
                            </div>
                        )}

                        <Button type="submit" disabled={!canSubmit}>
                            {loginMutation.isPending ? "Connexion…" : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
