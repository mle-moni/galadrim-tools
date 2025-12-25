import { useState } from "react";

import { cn } from "@/lib/utils";

export const DEFAULT_AVATAR_SRC =
    "https://res.cloudinary.com/forest2/image/fetch/f_auto,w_150,h_150/https://forest.galadrim.fr/img/users/0.jpg";

type AvatarProps = {
    src?: string | null;
    alt: string;
    size?: number;
    className?: string;
    fallbackSrc?: string;
};

export default function Avatar({
    src,
    alt,
    size = 24,
    className,
    fallbackSrc = DEFAULT_AVATAR_SRC,
}: AvatarProps) {
    const [fallbackActive, setFallbackActive] = useState(false);

    const resolvedSrc = !src || fallbackActive ? fallbackSrc : src;

    return (
        <div
            className={cn("shrink-0 overflow-hidden rounded-full", className)}
            style={{ width: size, height: size }}
        >
            <img
                src={resolvedSrc}
                alt={alt}
                loading="lazy"
                className="block h-full w-full object-cover"
                onError={() => setFallbackActive(true)}
            />
        </div>
    );
}
