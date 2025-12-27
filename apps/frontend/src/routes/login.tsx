import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, Eye, EyeOff, KeyRound } from "lucide-react";

import type { IUserData } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { login, meQueryOptions } from "@/integrations/backend/auth";
import { getApiUrl } from "@/integrations/backend/client";
import { queryKeys } from "@/integrations/backend/query-keys";

function normalizeRedirectToPath(value: unknown): string | undefined {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    if (trimmed === "") return undefined;

    try {
        const url = new URL(trimmed, "http://internal");
        const path = `${url.pathname}${url.search}${url.hash}`;
        if (!path.startsWith("/") || path.startsWith("//")) return undefined;
        return path;
    } catch {
        return undefined;
    }
}

export const Route = createFileRoute("/login")({
    validateSearch: (search: Record<string, unknown>) => ({
        redirect: normalizeRedirectToPath(search.redirect),
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
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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

    const forestLoginUrl = useMemo(() => {
        const backendUrl = getApiUrl().replace(/\/$/, "");
        const redirectUrl = `${backendUrl}/forestLogin`;
        return `https://forest.galadrim.fr/login?redirect=${redirectUrl}`;
    }, []);

    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-6">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle>Connexion</CardTitle>
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
                                <div className="relative">
                                    <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="Adresse e-mail"
                                        className="pl-9"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={isPasswordVisible ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="Mot de passe"
                                        className="pl-9 pr-10"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon-sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                        aria-label={
                                            isPasswordVisible
                                                ? "Masquer le mot de passe"
                                                : "Afficher le mot de passe"
                                        }
                                        onClick={() => setIsPasswordVisible((old) => !old)}
                                    >
                                        {isPasswordVisible ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
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

                        <div className="my-4">
                            <div className="relative">
                                <Separator />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                                    ou
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            className="w-full"
                            onClick={() => window.location.assign(forestLoginUrl)}
                        >
                            Se connecter avec Forest
                        </Button>

                        <div className="mt-3">
                            <Button variant="link" asChild className="h-auto px-0">
                                <Link to="/getOtp" search={{}}>
                                    Mot de passe oublié ?
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
