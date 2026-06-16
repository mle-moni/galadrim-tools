import { roomReservationService } from "#services/room_reservation_service";
import {
    detailedReservation,
    handleReservationToolErrors,
} from "#mcp/tools/reservation_tool_helpers";
import { Tool } from "@jrmc/adonis-mcp";
import { isReadOnly } from "@jrmc/adonis-mcp/tool_annotations";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { BaseSchema } from "@jrmc/adonis-mcp/types/method";

type Schema = BaseSchema<{ id: { type: "number" } }, ["id"]>;

@isReadOnly()
export default class ReservationGetTool extends Tool<Schema> {
    name = "reservation_get";
    title = "Get reservation";
    description = "Get one room reservation by id.";

    schema() {
        return {
            type: "object",
            properties: { id: { type: "number" } },
            required: ["id"],
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const id = ctx.args!.id;
            const reservation = await roomReservationService.show(id);

            return [
                ctx.response.text(`Reservation ${id}.`),
                ctx.response.structured({ reservation: detailedReservation(reservation) }),
            ];
        });
    }
}
