import type { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import type { SchemaTypes } from "@vinejs/vine/types";
import { ForestRoomsError } from "./forest_rooms_errors.js";
import type { ForestRoomCommand } from "./forest_rooms_service.js";

const integer = (min = 1, max = 2147483647) => vine.number().withoutDecimals().min(min).max(max);
const instant = () => integer(0, 253402300799000);
const actor = () => vine.string().trim().email().maxLength(254);
const request = () => ({
    requestId: vine
        .string()
        .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i),
    requestCreatedAt: instant(),
});
const allocation = () => ({
    officeRoomId: integer(),
    start: instant(),
    end: instant(),
    title: vine.string().trim().maxLength(160).nullable(),
});
function exact<T extends Record<string, SchemaTypes>>(fields: T) {
    const validator = vine.compile(vine.object(fields));
    const parse = async (body: unknown) => {
        if (!body || typeof body !== "object" || Array.isArray(body))
            throw new ForestRoomsError("INVALID_INPUT", 400);
        if (Object.keys(body).some((key) => !Object.hasOwn(fields, key)))
            throw new ForestRoomsError("INVALID_INPUT", 400);
        const input = await validator.validate(body);
        // Reservation columns store whole seconds; reject lossy allocation input.
        if (
            "start" in input &&
            "end" in input &&
            (typeof input.start !== "number" ||
                typeof input.end !== "number" ||
                input.start % 1000 !== 0 ||
                input.end % 1000 !== 0)
        )
            throw new ForestRoomsError("INVALID_INPUT", 400);
        return input;
    };
    return Object.assign((ctx: HttpContext) => parse(ctx.request.body()), { parse });
}
export const forestRoomsInput = {
    catalog: exact({
        actorEmail: actor().optional(),
        includeAllocationStatus: vine.boolean().optional(),
        afterId: integer(0).optional(),
        limit: integer(1, 100).optional(),
    }),
    planning: exact({
        actorEmail: actor().optional(),
        date: vine.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }),
    detail: exact({ actorEmail: actor().optional() }),
    create: exact({ ...request(), actorEmail: actor(), ...allocation() }),
    update: exact({
        ...request(),
        actorEmail: actor(),
        ...allocation(),
        title: vine.string().trim().maxLength(255).nullable(),
        bookingId: integer(),
        expectedVersion: integer(),
    }),
    cancel: exact({
        ...request(),
        actorEmail: actor(),
        bookingId: integer(),
        expectedVersion: integer(),
    }),
    end: exact({
        ...request(),
        bookingId: integer(),
        expectedVersion: integer(),
        officeRoomId: integer(),
    }),
    receipt: async (
        ctx: HttpContext,
    ): Promise<{ requestId: string; expected?: ForestRoomCommand }> => {
        const body = ctx.request.body();
        if (
            Object.keys(body).some((key) => !["requestId", "expected"].includes(key)) ||
            typeof body.requestId !== "string" ||
            !/^[0-9a-f-]{36}$/i.test(body.requestId)
        )
            throw new ForestRoomsError("INVALID_INPUT", 400);
        if (body.expected === undefined) return { requestId: body.requestId };
        const expected: unknown = body.expected;
        if (
            !expected ||
            typeof expected !== "object" ||
            Array.isArray(expected) ||
            Object.keys(expected).some((key) => !["operation", "input"].includes(key)) ||
            !("operation" in expected) ||
            !("input" in expected)
        )
            throw new ForestRoomsError("INVALID_INPUT", 400);
        let command: ForestRoomCommand;
        switch (expected.operation) {
            case "create":
                command = {
                    operation: "create",
                    input: await forestRoomsInput.create.parse(expected.input),
                };
                break;
            case "update":
                command = {
                    operation: "update",
                    input: await forestRoomsInput.update.parse(expected.input),
                };
                break;
            case "cancel":
                command = {
                    operation: "cancel",
                    input: await forestRoomsInput.cancel.parse(expected.input),
                };
                break;
            case "end":
                command = {
                    operation: "end",
                    input: await forestRoomsInput.end.parse(expected.input),
                };
                break;
            default:
                throw new ForestRoomsError("INVALID_INPUT", 400);
        }
        if (command.input.requestId !== body.requestId)
            throw new ForestRoomsError("INVALID_INPUT", 400);
        return { requestId: body.requestId, expected: command };
    },
};
