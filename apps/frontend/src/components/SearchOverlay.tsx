import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { KeyboardEvent } from "react";
import { type ReactNode, useEffect, useRef } from "react";

export type SearchOverlayProps = {
    isOpen: boolean;
    onClose: () => void;
    value: string;
    onChange: (value: string) => void;
    onClear: () => void;
    placeholder?: string;
    label?: string;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
    extraContent?: ReactNode;
    autoFocus?: boolean;
};

export default function SearchOverlay({
    isOpen,
    onClose,
    value,
    onChange,
    onClear,
    placeholder = "Rechercher…",
    label = "Rechercher",
    onKeyDown,
    extraContent,
    autoFocus = true,
}: SearchOverlayProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen || !autoFocus) return;

        requestAnimationFrame(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        });
    }, [isOpen, autoFocus]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[90]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="pointer-events-auto absolute left-1/2 top-4 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border bg-background/90 p-3 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        aria-label={label}
                        onKeyDown={onKeyDown}
                    />
                    {value.trim() && (
                        <Button type="button" size="sm" variant="outline" onClick={onClear}>
                            Effacer
                        </Button>
                    )}
                    {extraContent}
                </div>
            </div>
        </div>
    );
}
