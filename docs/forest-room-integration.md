# Forest room integration foundation

Tools remains the reservation authority. This slice introduces shared room-lock
transactions and additive integration state; the delegated API is a separate slice.
Apply the reviewed additive migration before deploying code that uses the new columns.
Startup never applies it automatically. No production migration is performed here.

All known application writers (ordinary REST, MCP and phone-box sensor commands) pass
through the reservation service. Commands lock room IDs in ascending order, then read
and mutate the current booking inside the same transaction. A moved lock set is retried
at most once. Existing socket messages are emitted by callers only after the service
returns from COMMIT.

`integration_version` increments for updates, including legacy sensor extensions.
`allocation_at` changes on creation or room/start reallocation and is preserved by
end/title-only changes. Existing rows receive a conservative migration-time anchor.
The generic command-receipt table prepares reliable reservation API retries.
Sensor interpretation, absence policy and sensor-specific history belong to Forest.
Tools stores no sensor decision or dedicated sensor audit. Destructive rollback is
refused to preserve booking versions and retained command receipts.

## Isolated real MySQL verification

```sh
node apps/backend/scripts/run_room_tests.mjs --target rooms-test
```

The launcher fixes the Compose project `tools-forest-rooms-test`, verifies its volume
ownership and uses no ambient Compose environment file. The runner also asserts the
MySQL host, database, account and seeded project marker before migration or tests.
Only the named disposable test database receives migrations. The ordinary Tools
`db` volume and Forest development projects are not used or reset. The existing
`test_seeder.ts` is never run. Dependencies and synthetic runtime values live in the
isolated image/container; no user `.env` or real credential is copied or edited.

The project has no published ports and an internal runtime network. A fixed runner
name rejects overlapping runs against its database. Fixtures own unique rooms/users,
clean their own rows and retain no archived-room noise. Keep failure logs before
any separately reviewed disposable-project recovery. Do not use the normal Tools
`db:setup`, `migrate-prod`, `deploy` or normal-volume cleanup to run these tests.

Local review checkpoints and planning artifacts remain outside this repository.
Deployment, production migration and feature activation require a separate operator decision.
