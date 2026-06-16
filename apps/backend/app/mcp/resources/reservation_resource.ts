import { roomReservationService } from "#services/room_reservation_service";
import { detailedReservation } from "#mcp/tools/reservation_tool_helpers";
import { Resource } from "@jrmc/adonis-mcp";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ResourceContext } from "@jrmc/adonis-mcp/types/context";

export default class ReservationResource extends Resource<{ id: string }> {
    name = "reservation";
    uri = "galatools://reservations/{id}";
    title = "Reservation";
    description = "Full room reservation details.";
    mimeType = "application/json";

    async handle(ctx: ResourceContext<{ id: string }>): Promise<Content> {
        const reservation = await roomReservationService.show(Number(ctx.args!.id));

        return ctx.response.text(JSON.stringify(detailedReservation(reservation)));
    }
}
