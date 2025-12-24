import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminShellProps = {
    title: string;
    description?: string;
    backTo?: string;
    children: ReactNode;
};

export default function AdminShell({
    title,
    description,
    backTo = "/admin",
    children,
}: AdminShellProps) {
    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link to={backTo} search={{}}>
                            <ChevronLeft className="h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                </div>
            </div>

            {children}
        </div>
    );
}
