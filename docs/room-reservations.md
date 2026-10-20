# Delegated room reservations

The existing `POST /offices/:officeId/reservations` endpoint accepts an optional
`userEmail`. Only a caller with `EVENT_ADMIN` may supply it. Tools resolves the
email to an existing user and retains the existing booking validation and socket
notifications.

```json
{
    "officeRoomId": 149,
    "start": "2030-01-15T10:00:00.000Z",
    "end": "2030-01-15T11:00:00.000Z",
    "userEmail": "colleague@example.test"
}
```

Omit `userEmail` to keep the current behavior: the booking belongs to the
authenticated caller. Omit `title` to use the owner's existing computed display
name. A malformed email returns 422, an unknown account returns 404, and a caller
without `EVENT_ADMIN` cannot delegate (403). No account is created.

Existing index, show, update and delete routes are unchanged. An administrator
can shorten an ongoing booking by sending its existing title, start and room with
an earlier `end` to the existing update route. Existing date and booking rules
still apply. There is no new token provider, endpoint family, environment
variable, migration, version check or persistent request receipt.

Forest must keep the existing administrator token on its server, derive the
booking owner's email from the authenticated session and enforce its own user
permissions. Sensor policy and release history remain in Forest.

## Verification

The functional suite exercises the real native HTTP routes with synthetic users.
Run `pnpm --filter backend test functional --files=delegated_room_reservations`
against a disposable test schema with the ordinary backend configuration.
To refuse accidental writes to a normal database, the suite requires
`NODE_ENV=test`, database `tools_forest_rooms_test`, MySQL hostname
`tools-forest-rooms-test-mysql` account `rooms_test`, and a `room_test_target` table whose `project` is
`tools-forest-rooms-test`.
Apply the existing Tools migrations to that disposable schema before running the
suite. It creates and removes only its own users, tokens, office and bookings;
it does not reset the schema or require an integration migration.
