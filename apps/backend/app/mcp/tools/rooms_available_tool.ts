import { roomReservationService } from "#services/room_reservation_service";
import { handleReservationToolErrors, MCP_TIMEZONE } from "#mcp/tools/reservation_tool_helpers";
import { ReservationServiceError } from "#services/reservation_errors";
import { Tool } from "@jrmc/adonis-mcp";
import { isReadOnly } from "@jrmc/adonis-mcp/tool_annotations";
import type { Content } from "@jrmc/adonis-mcp/contracts/content";
import type { ToolContext } from "@jrmc/adonis-mcp/types/context";
import type { BaseSchema } from "@jrmc/adonis-mcp/types/method";
import { DateTime } from "luxon";

type Schema = BaseSchema<
    {
        at: { type: "string" };
        start: { type: "string" };
        end: { type: "string" };
        durationMinutes: { type: "number" };
        officeId: { type: "number" };
        hasTv: { type: "boolean" };
    },
    []
>;

@isReadOnly()
export default class RoomsAvailableTool extends Tool<Schema> {
    name = "rooms_available";
    title = "Available rooms";
    description =
        "List bookable rooms without an overlapping reservation. Provide start/end, or at with durationMinutes.";

    schema() {
        return {
            type: "object",
            properties: {
                at: { type: "string" },
                start: { type: "string" },
                end: { type: "string" },
                durationMinutes: { type: "number" },
                officeId: { type: "number" },
                hasTv: { type: "boolean" },
            },
        } as Schema;
    }

    async handle(ctx: ToolContext<Schema>): Promise<Content | Content[]> {
        return handleReservationToolErrors(ctx, async () => {
            const input = ctx.args!;
            const range = this.resolveRange(input);
            const rooms = await roomReservationService.availableRooms({
                start: range.start,
                end: range.end,
                officeId: input.officeId,
                hasTv: input.hasTv,
                timezone: MCP_TIMEZONE,
            });

            return [
                ctx.response.text(`Found ${rooms.length} available room(s).`),
                ctx.response.structured({
                    rooms,
                    count: rooms.length,
                    start: range.start,
                    end: range.end,
                }),
            ];
        });
    }

    private resolveRange(input: NonNullable<ToolContext<Schema>["args"]>) {
        if (input.start !== undefined && input.end !== undefined) {
            return { start: input.start, end: input.end };
        }

        if (input.at === undefined) {
            throw new ReservationServiceError(
                "INVALID_DATE_RANGE",
                "Provide start/end or at with durationMinutes",
            );
        }

        const start = DateTime.fromISO(input.at, { setZone: true, zone: MCP_TIMEZONE }).setZone(
            MCP_TIMEZONE,
        );
        const durationMinutes = input.durationMinutes ?? 30;

        if (!start.isValid) {
            throw new ReservationServiceError("INVALID_DATE", "Invalid Date");
        }

        if (durationMinutes <= 0) {
            throw new ReservationServiceError(
                "INVALID_DATE_RANGE",
                "La durée doit être supérieure à zéro",
            );
        }

        return {
            start: start.toISO()!,
            end: start.plus({ minutes: durationMinutes }).toISO()!,
        };
    }
}
