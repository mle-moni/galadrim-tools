import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { roomReservationService } from "#services/room_reservation_service";
import { Ws } from "#services/ws";
import {
    compactReservation,
    handleReservationToolErrors,
    MCP_TIMEZONE,
} from "#mcp/tools/reservation_tool_helpers";
import { Tool } from "@jrmc/adonis-mcp";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { BaseSchema } from "@jrmc/adonis-mcp/types/method";

type Schema = BaseSchema<
    {
        title: { type: "string" };
        start: { type: "string" };
        end: { type: "string" };
        officeRoomId: { type: "number" };
    },
    ["start", "end", "officeRoomId"]
>;

export default class ReservationCreateTool extends Tool<Schema> {
    name = "reservation_create";
    title = "Create reservation";
    description = "Create a room reservation for the authenticated user.";

    schema() {
        return {
            type: "object",
            properties: {
                title: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
                officeRoomId: { type: "number" },
            },
            required: ["start", "end", "officeRoomId"],
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const { title, start, end, officeRoomId } = ctx.args!;
            const reservation = await roomReservationService.create(ctx.auth.user!, {
                title: title ?? null,
                start,
                end,
                officeRoomId,
                timezone: MCP_TIMEZONE,
            });

            Ws.io.to(CONNECTED_SOCKETS).emit("createRoomReservation", reservation);

            return [
                ctx.response.text(`Created reservation ${reservation.id}.`),
                ctx.response.structured({ reservation: compactReservation(reservation) }),
            ];
        });
    }
}
