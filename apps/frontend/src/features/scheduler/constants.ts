export const START_HOUR = 9;
export const END_HOUR = 20;
export const HOURS_COUNT = END_HOUR - START_HOUR;
export const TIME_COLUMN_WIDTH = 60;

export const ROOM_HEADER_COLORS = [
    "bg-blue-100 border-blue-200 text-blue-900",
    "bg-purple-100 border-purple-200 text-purple-900",
] as const;

export type RoomHeaderColorIndex = 0 | 1;

// Match reference UI colors
// - Background: #dbe6fe
// - Border: #1e3ad7
// - Text: #171e54
export const THEME_ME = "bg-[#dbe6fe]/70 border-[#1e3ad7] text-[#171e54]";

export const THEME_OTHER = "bg-muted border-border text-muted-foreground";

export const THEME_PERSON_SEARCH_MATCH = "bg-[#dcfce7]/80 border-[#16a34a] text-[#14532d]";

export const THEME_MILESTONE = "bg-yellow-300/80 border-yellow-700 text-yellow-950";
export const THEME_ENTRETIEN_FINAL = "bg-red-600/85 border-red-900 text-white";
