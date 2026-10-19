import type { HttpContext } from "@adonisjs/core/http";
import { CONNECTED_SOCKETS } from "#controllers/socket/socket_constants";
import { forestRoomsInput } from "#services/forest_rooms_contract";
import { ForestRoomsError } from "#services/forest_rooms_errors";
import { type ForestRoomCommand, forestRoomsService } from "#services/forest_rooms_service";
import { Ws } from "#services/ws";
import env from "#start/env";

type Ability = "rooms:read" | "rooms:write" | "rooms:end";
async function authorize(ctx: HttpContext, ability: Ability) {
    if (!env.get("FOREST_ROOMS_INTEGRATION_ENABLED", false))
        throw new ForestRoomsError("NOT_FOUND", 404);
    const principal = await ctx.auth.use("forestRooms").authenticate();
    const token = principal.currentAccessToken;
    const officeId = Number(ctx.params.officeId);
    const allowedOffices = env
        .get("FOREST_ROOMS_OFFICE_IDS", "")
        .split(",")
        .map((id) => id.trim());
    if (
        !Number.isSafeInteger(officeId) ||
        officeId < 1 ||
        officeId > 2147483647 ||
        !allowedOffices.includes(String(officeId)) ||
        !token.abilities.includes(`office:${officeId}`) ||
        !token.abilities.includes(ability) ||
        token.abilities.some((value) => value.includes("*"))
    )
        throw new ForestRoomsError("FORBIDDEN", 403);
    if (
        (ability === "rooms:write" && !env.get("FOREST_ROOMS_INTEGRATION_WRITE_ENABLED", false)) ||
        (ability === "rooms:end" && !env.get("FOREST_ROOMS_INTEGRATION_END_ENABLED", false))
    )
        throw new ForestRoomsError("WRITES_DISABLED", 503);
    return {
        principalId: principal.id,
        officeId,
        capabilities: {
            canWrite:
                token.abilities.includes("rooms:write") &&
                env.get("FOREST_ROOMS_INTEGRATION_WRITE_ENABLED", false),
            canEnd:
                token.abilities.includes("rooms:end") &&
                env.get("FOREST_ROOMS_INTEGRATION_END_ENABLED", false),
        },
    };
}
export default class ForestRoomsController {
    async catalog(ctx: HttpContext) {
        const { officeId } = await authorize(ctx, "rooms:read");
        const input = await forestRoomsInput.catalog(ctx);
        return forestRoomsService.catalog(
            officeId,
            input.actorEmail,
            input.afterId,
            input.limit,
            input.includeAllocationStatus,
        );
    }
    async planning(ctx: HttpContext) {
        const { officeId, capabilities } = await authorize(ctx, "rooms:read");
        const input = await forestRoomsInput.planning(ctx);
        return {
            ...(await forestRoomsService.planning(officeId, input.actorEmail, input.date)),
            capabilities,
        };
    }
    async detail(ctx: HttpContext) {
        const { officeId } = await authorize(ctx, "rooms:read");
        const { actorEmail } = await forestRoomsInput.detail(ctx);
        const id = Number(ctx.params.id);
        if (!Number.isSafeInteger(id) || id < 1 || id > 2147483647)
            throw new ForestRoomsError("INVALID_INPUT", 400);
        return forestRoomsService.detail(officeId, actorEmail, id);
    }
    async receipt(ctx: HttpContext) {
        const { principalId, officeId } = await authorize(ctx, "rooms:read");
        const { requestId, expected } = await forestRoomsInput.receipt(ctx);
        return forestRoomsService.receipt(principalId, officeId, requestId, expected);
    }
    async create(ctx: HttpContext) {
        const scope = await authorize(ctx, "rooms:write");
        return this.command(scope, {
            operation: "create",
            input: await forestRoomsInput.create(ctx),
        });
    }
    async update(ctx: HttpContext) {
        const scope = await authorize(ctx, "rooms:write");
        return this.command(scope, {
            operation: "update",
            input: await forestRoomsInput.update(ctx),
        });
    }
    async cancel(ctx: HttpContext) {
        const scope = await authorize(ctx, "rooms:write");
        return this.command(scope, {
            operation: "cancel",
            input: await forestRoomsInput.cancel(ctx),
        });
    }
    async end(ctx: HttpContext) {
        const scope = await authorize(ctx, "rooms:end");
        return this.command(scope, {
            operation: "end",
            input: await forestRoomsInput.end(ctx),
        });
    }
    private async command(
        scope: { principalId: number; officeId: number },
        command: ForestRoomCommand,
    ) {
        const { result, event } = await forestRoomsService.command(
            scope.principalId,
            scope.officeId,
            command,
        );
        // Only after commit, only on a first execution. Planning polling recovers a missed socket event.
        if (event && Ws._io) {
            if (event.cancelledId)
                Ws.io
                    .to(CONNECTED_SOCKETS)
                    .emit("deleteRoomReservation", Number(event.cancelledId));
            else
                Ws.io
                    .to(CONNECTED_SOCKETS)
                    .emit(
                        command.operation === "create"
                            ? "createRoomReservation"
                            : "updateRoomReservation",
                        event.booking,
                    );
        }
        return result;
    }
}
