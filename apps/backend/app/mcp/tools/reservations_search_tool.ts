import { roomReservationService } from "#services/room_reservation_service";
import {
    compactReservation,
    handleReservationToolErrors,
    MCP_TIMEZONE,
} from "#mcp/tools/reservation_tool_helpers";
import { Tool } from "@jrmc/adonis-mcp";
import { isReadOnly } from "@jrmc/adonis-mcp/tool_annotations";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { BaseSchema } from "@jrmc/adonis-mcp/types/method";

type Schema = BaseSchema<
    {
        start: { type: "string" };
        end: { type: "string" };
        officeId: { type: "number" };
        officeRoomId: { type: "number" };
        limit: { type: "number" };
    },
    ["start", "end"]
>;

@isReadOnly()
export default class ReservationsSearchTool extends Tool<Schema> {
    name = "reservations_search";
    title = "Search reservations";
    description = "Search room reservations in a time range. Returns compact rows.";

    schema() {
        return {
            type: "object",
            properties: {
                start: { type: "string" },
                end: { type: "string" },
                officeId: { type: "number" },
                officeRoomId: { type: "number" },
                limit: { type: "number" },
            },
            required: ["start", "end"],
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const input = ctx.args!;
            const reservations = await roomReservationService.search({
                start: input.start,
                end: input.end,
                officeId: input.officeId,
                officeRoomId: input.officeRoomId,
                limit: input.limit,
                timezone: MCP_TIMEZONE,
            });
            const rows = reservations.map(compactReservation);

            return [
                ctx.response.text(`Found ${rows.length} reservation(s).`),
                ctx.response.structured({ reservations: rows, count: rows.length }),
            ];
        });
    }
}
