import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function IdeasPage(props: { ideaId?: number }) {
    return (
        <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Boîte à idées</CardTitle>
                    <CardDescription>
                        Cette page arrive bientôt. Les notifications peuvent déjà pointer ici.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {props.ideaId ? (
                        <div className="text-sm text-muted-foreground">
                            Idée ciblée: <span className="font-mono">{props.ideaId}</span>
                        </div>
                    ) : (
                        <div className="text-sm text-muted-foreground">
                            Pas d'idée sélectionnée.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
