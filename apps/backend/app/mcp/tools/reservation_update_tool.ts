import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { roomReservationService } from "#services/room_reservation_service";
import { authorizeOwnedResourceMutation } from "#services/reservation_authorization";
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
        id: { type: "number" };
        title: { type: "string" };
        start: { type: "string" };
        end: { type: "string" };
        officeRoomId: { type: "number" };
    },
    ["id", "title", "start", "end", "officeRoomId"]
>;

export default class ReservationUpdateTool extends Tool<Schema> {
    name = "reservation_update";
    title = "Update reservation";
    description = "Update one of the authenticated user's room reservations.";

    schema() {
        return {
            type: "object",
            properties: {
                id: { type: "number" },
                title: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
                officeRoomId: { type: "number" },
            },
            required: ["id", "title", "start", "end", "officeRoomId"],
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const { id, ...input } = ctx.args!;
            const existingReservation = await roomReservationService.show(id);

            authorizeOwnedResourceMutation(ctx.auth.user!, existingReservation);

            const reservation = await roomReservationService.update(ctx.auth.user!, id, {
                ...input,
                timezone: MCP_TIMEZONE,
            });

            Ws.io.to(CONNECTED_SOCKETS).emit("updateRoomReservation", reservation);

            return [
                ctx.response.text(`Updated reservation ${reservation.id}.`),
                ctx.response.structured({ reservation: compactReservation(reservation) }),
            ];
        });
    }
}
