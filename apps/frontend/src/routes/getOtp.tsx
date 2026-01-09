import { useMemo, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { getOtp } from "@/integrations/backend/auth";

export const Route = createFileRoute("/getOtp")({
    component: GetOtpRoute,
});

function GetOtpRoute() {
    const router = useRouter();

    const [email, setEmail] = useState("");

    const otpMutation = useMutation({
        mutationFn: getOtp,
        onSuccess: (res) => {
            toast.success(res.notification);
            router.history.push("/login");
        },
        onError: (error: unknown) => {
            toast.error(error instanceof Error ? error.message : "Impossible d'envoyer l'email");
        },
    });

    const canSubmit = useMemo(() => {
        return email.trim() !== "" && !otpMutation.isPending;
    }, [email, otpMutation.isPending]);

    return (
        <div className="flex min-h-svh items-center justify-center bg-background p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Mot de passe oublié</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(e) => {
                            e.preventDefault();
                            otpMutation.mutate({ email });
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

                        <Button type="submit" disabled={!canSubmit}>
                            {otpMutation.isPending ? "Envoi…" : "Envoyer un code"}
                        </Button>

                        <Button variant="link" asChild className="px-0">
                            <Link to="/login" search={{ redirect: undefined }}>
                                Retour à la connexion
                            </Link>
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
