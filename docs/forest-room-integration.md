# Reservation API for the Forest admin pilot

Tools remains the reservation authority while ordinary users use Tools and admins
try Forest. The integration exposes booking operations. Forest owns sensor ingestion,
interpretation, absence thresholds, decisions and its 90-day sensor history. Tools
receives no sensor policy or evidence and stores no dedicated sensor audit.

## Rollout and access

Apply the reviewed additive migration before code uses booking versions, allocation
anchors or command receipts. Startup never runs migrations. Existing local historical
tables are not dropped. Production migration, credentials, deployment and activation
require a separate operator decision.

Every switch defaults off:

- `FOREST_ROOMS_INTEGRATION_ENABLED`: integration reads and boundary.
- `FOREST_ROOMS_INTEGRATION_WRITE_ENABLED`: delegated human create/update/cancel.
- `FOREST_ROOMS_INTEGRATION_END_ENABLED`: generic end-now command.
- `FOREST_ROOMS_OFFICE_IDS`: explicit permitted numeric offices.

Use the dedicated native `forestRooms` token provider (`frt_` prefix) with expiry and
explicit `office:<id>`, `rooms:read`, `rooms:write` and/or `rooms:end` abilities. Wildcard
abilities are rejected. Ordinary tokens/cookies cannot enter this boundary; integration
tokens cannot authenticate ordinary API/MCP routes. Keep the token server-side over
verified HTTPS. No token provisioning or real environment edit is included here.

Human identity comes from the verified Forest server user, using exactly one existing
Tools user with matching normalized email. No guessed IDs or automatic account creation.
Create uses that user's ownership; update/cancel retains Tools owner/EVENT_ADMIN rules.
Forest admin access does not itself grant Tools-wide booking-edit rights.

The independent `rooms:end` service capability can end an ongoing reservable-room
booking in its permitted office without impersonating its owner. It cannot create,
rename, reassign, move or extend bookings. Grant it only to the trusted backend.

## HTTP contract

All operations use JSON POST beneath
`/integrations/forest/rooms/v1/offices/:officeId`, with Bearer auth, a known content
length at most 8192 bytes, no transfer/content encoding, Origin or Cookie. Responses
use `Cache-Control: no-store`. Errors expose an allowlisted contract code, not SQL,
request bodies or credentials.

| Route | Input | Result |
| --- | --- | --- |
| `/catalog` | optional actorEmail, afterId, limit (1–100), includeAllocationStatus | Scoped room page; optional current/future allocation status |
| `/planning` | Paris YYYY-MM-DD, optional actorEmail | Civil-day bounds, bookings, actual actor and canWrite/canEnd capabilities |
| `/reservations/:id/detail` | optional actorEmail | Scoped booking and actual editing rights |
| `/commands/create` | request identity, actorEmail, room, start/end, nullable title | Booking owned by the resolved person |
| `/commands/update` | create fields, bookingId, expectedVersion | Updated booking, actual owner/manager authorization |
| `/commands/cancel` | request identity, actorEmail, bookingId, expectedVersion | Cancelled booking ID |
| `/commands/end` | request identity, bookingId, expectedVersion, officeRoomId | Ongoing booking ended now, generic before/after result |
| `/commands/receipt` | requestId, optional expected operation/input | Principal- and office-scoped immutable command result |

Request identity is a UUIDv4 `requestId` and immutable UTC-millisecond
`requestCreatedAt`. New commands must be at most five minutes old and no more than
30 seconds in the future. Replays keep the identical identity, creation time and body.
A changed payload conflicts. Receipts last 24 hours; an old command cannot execute as
a new write after its receipt expires. `forest:rooms:prune` removes expired generic
receipts only; it never deletes reservations or manages sensor history.

Booking DTO fields are id, officeRoomId, start, end, title, ownerUserId,
ownerDisplayName, version, allocationAt, isOwn and canEdit. IDs of bookings/users are
strings; room IDs are integers. Instants are UTC milliseconds. Planning days follow
Europe/Paris, including 23/25-hour days and exclusive next midnight. An excessive day
fails explicitly rather than silently truncating or inventing an empty day.

New custom titles are limited to 160 characters; unchanged existing titles up to the
255-character storage limit remain readable/resizable. Create/update times must fit
whole-second storage and remain within one Paris civil day; an exclusive midnight
end is accepted.

### Generic end-now

End accepts only requestId, requestCreatedAt, bookingId, expectedVersion and
officeRoomId. Unknown fields are rejected. It has no sensor type, reason, observation,
absence time, grace duration or decision timestamp.

Under the same room/booking locks as ordinary writers, Tools checks current office,
room, version and the ongoing interval. It sets end to the next whole UTC second at
or after its own clock (`ceil(nowMs / 1000) * 1000`), increments version and commits its
receipt atomically. A future/ended interval or rounding that cannot shorten it returns
a conflict without mutation. A moved/edited version or successor cannot be ended by a
stale command. The original owner, title, room and start are preserved.

The result includes the current `booking` and a generic `change` with `before`,
`after` and `appliedAt`. The before/after snapshots come from the locked authoritative
booking and are replayable even after later booking deletion. They are retained only
as generic 24-hour command receipts. Forest combines them with its own decision data
for its 90-day sensor history. If an uncertain outcome outlives the receipt guarantee,
Forest must keep it unresolved for manual reconciliation, never invent success.

## Existing writers and notifications

Native planning uses Paris civil-day bounds, including 23/25-hour DST days, and
retains its start-based selection. Phone-box bot rules stay unchanged. Shared
reservation validation accepts an exclusive end exactly at the next local midnight,
so bookings created through the Forest API remain editable through ordinary Tools
writers. Later next-day ends remain invalid.

Ordinary REST, MCP and pre-existing phone-box booking writers share sorted room locks.
They check ownership/overlap inside the transaction and retry a changed lock set at
most once. Start-inclusive/end-exclusive adjacency remains available. Generic booking
versions increment for every update; allocationAt changes only for creation or a
room/start reallocation. Existing ongoing rows receive a conservative migration-time
anchor. Existing socket event names remain compatible and emit after commit; an
identical command replay does not emit a duplicate mutation event.

Existing Tools phone-box sensor interpretation is unchanged. Its narrow transaction
wiring prevents it from bypassing the same allocation/version boundary; no Forest
sensor behavior has been added to that path.

## Guarded local verification

```sh
node apps/backend/scripts/run_room_tests.mjs --target rooms-test
```

The exact disposable Compose project is `tools-forest-rooms-test`. Its launcher checks
volume ownership and the runner positively verifies SQL hostname, database, account
and project marker before migration or tests. The internal network exposes no host
port. Synthetic fixtures clean only owned rooms/users/receipts. The destructive normal
Tools seeder and ordinary development volumes are never used. Real env files and host
node_modules are excluded from the test image. This command is not a production command.

Public Forest access and removal of Tools for rooms require separate user approval.
The pilot alone does not migrate booking ownership away from Tools or retire its service.
