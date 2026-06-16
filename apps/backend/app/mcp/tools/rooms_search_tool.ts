import OfficeRoom from "#models/office_room";
import { compactRoom, handleReservationToolErrors } from "#mcp/tools/reservation_tool_helpers";
import { Tool } from "@jrmc/adonis-mcp";
import { isReadOnly } from "@jrmc/adonis-mcp/tool_annotations";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { BaseSchema } from "@jrmc/adonis-mcp/types/method";

type Schema = BaseSchema<{
    name: { type: "string" };
    officeId: { type: "number" };
    hasTv: { type: "boolean" };
    limit: { type: "number" };
}, []>;

@isReadOnly()
export default class RoomsSearchTool extends Tool<Schema> {
    name = "rooms_search";
    title = "Search rooms";
    description =
        "Search bookable meeting rooms. Use this to find the officeRoomId needed to create a reservation.";

    schema() {
        return {
            type: "object",
            properties: {
                name: { type: "string" },
                officeId: { type: "number" },
                hasTv: { type: "boolean" },
                limit: { type: "number" },
            },
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const input = ctx.args ?? {};
            const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
            const roomsQuery = OfficeRoom.query()
                .where("is_bookable", true)
                .where("is_phonebox", false)
                .orderBy("name", "asc")
                .limit(limit)
                .preload("officeFloor", (floorQuery) => floorQuery.preload("office"));

            if (input.name !== undefined) {
                roomsQuery.where("name", "like", `%${input.name}%`);
            }

            if (input.officeId !== undefined) {
                roomsQuery.whereHas("officeFloor", (floorQuery) =>
                    floorQuery.where("officeId", input.officeId!),
                );
            }

            if (input.hasTv !== undefined) {
                roomsQuery.where("has_tv", input.hasTv);
            }

            const rooms = (await roomsQuery).map(compactRoom);

            return [
                ctx.response.text(`Found ${rooms.length} room(s).`),
                ctx.response.structured({ rooms, count: rooms.length }),
            ];
        });
    }
}
