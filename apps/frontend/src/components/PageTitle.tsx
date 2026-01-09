import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageTitleProps {
    icon?: ElementType<{ className?: string }>;
    children: ReactNode;
    className?: string;
    iconClassName?: string;
}

export default function PageTitle({
    icon: Icon,
    children,
    className,
    iconClassName,
}: PageTitleProps) {
    return (
        <h1
            className={cn(
                "flex min-w-0 items-center gap-2 truncate text-xl font-semibold tracking-tight",
                className,
            )}
        >
            {Icon ? (
                <Icon className={cn("h-5 w-5 shrink-0 text-muted-foreground", iconClassName)} />
            ) : null}
            <span className="truncate">{children}</span>
        </h1>
    );
}
