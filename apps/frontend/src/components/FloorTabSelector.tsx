import { Link } from "@tanstack/react-router";

import { cn } from "@/lib/utils";

export type FloorTab = {
    id: number | null;
    label: string;
    floor: number | null;
};

type FloorTabSelectorProps = {
    tabs: FloorTab[];
    selectedId: number | null;
    to: string;
    getSearch: (tabId: number | null) => Record<string, unknown>;
    className?: string;
};

export default function FloorTabSelector({
    tabs,
    selectedId,
    to,
    getSearch,
    className,
}: FloorTabSelectorProps) {
    return (
        <div
            className={cn(
                "flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto",
                className,
            )}
        >
            {tabs.map((tab) => {
                const isActive = tab.id === selectedId;
                const suffix = tab.floor === 1 ? "er" : "ème";

                return (
                    <Link
                        key={`${tab.id ?? "all"}`}
                        to={to}
                        search={getSearch(tab.id)}
                        className={cn(
                            "whitespace-nowrap border-b-2 border-transparent px-3 py-1.5 text-sm font-medium leading-6 text-slate-700",
                            isActive && "border-[#2048e9] text-[#1f31ae]",
                        )}
                    >
                        {tab.floor === null ? (
                            tab.label
                        ) : (
                            <span className="inline-flex items-baseline gap-0.5">
                                <span className="text-sm">{tab.floor}</span>
                                <sup className="text-[9px] leading-none">{suffix}</sup>
                                <span className="text-sm">étage</span>
                            </span>
                        )}
                    </Link>
                );
            })}
        </div>
    );
}
