import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { roomReservationService } from "#services/room_reservation_service";
import { authorizeOwnedResourceMutation } from "#services/reservation_authorization";
import { Ws } from "#services/ws";
import { handleReservationToolErrors } from "#mcp/tools/reservation_tool_helpers";
import { Tool } from "@jrmc/adonis-mcp";
import { isDestructive } from "@jrmc/adonis-mcp/tool_annotations";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { BaseSchema } from "@jrmc/adonis-mcp/types/method";

type Schema = BaseSchema<{ id: { type: "number" } }, ["id"]>;

@isDestructive()
export default class ReservationDeleteTool extends Tool<Schema> {
    name = "reservation_delete";
    title = "Delete reservation";
    description = "Delete one of the authenticated user's room reservations.";

    schema() {
        return {
            type: "object",
            properties: { id: { type: "number" } },
            required: ["id"],
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const existingReservation = await roomReservationService.show(ctx.args!.id);

            authorizeOwnedResourceMutation(ctx.auth.user!, existingReservation);

            const deletedId = await roomReservationService.delete(ctx.auth.user!, ctx.args!.id);

            Ws.io.to(CONNECTED_SOCKETS).emit("deleteRoomReservation", deletedId);

            return [
                ctx.response.text(`Deleted reservation ${deletedId}.`),
                ctx.response.structured({ deletedId }),
            ];
        });
    }
}
