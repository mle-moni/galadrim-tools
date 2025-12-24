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
        <img
            src={resolvedSrc}
            alt={alt}
            width={size}
            height={size}
            loading="lazy"
            className={cn("shrink-0 rounded-full object-cover", className)}
            onError={() => setFallbackActive(true)}
        />
    );
}
