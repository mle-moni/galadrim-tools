import { spawnSync } from "node:child_process";
import { createConnection } from "mysql2/promise";

const expected = {
    NODE_ENV: "test",
    TOOLS_ROOMS_TEST: "1",
    DB_HOST: "mysql",
    DB_PORT: "3306",
    DB_DATABASE: "tools_forest_rooms_test",
    DB_USER: "rooms_test",
};
if (process.argv.slice(2).join(" ") !== "--target rooms-test") {
    throw new Error("Use --target rooms-test in the dedicated Compose runner.");
}
for (const [key, value] of Object.entries(expected)) {
    if (process.env[key] !== value) throw new Error(`Room test target refused: ${key}`);
}
const connection = await createConnection({
    host: process.env.DB_HOST,
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});
try {
    const [[target]] = await connection.query(
        "SELECT DATABASE() AS db, @@hostname AS host, CURRENT_USER() AS account",
    );
    const [[marker]] = await connection.query("SELECT project FROM room_test_target");
    if (
        target.db !== expected.DB_DATABASE ||
        target.host !== "tools-forest-rooms-test-mysql" ||
        !target.account.startsWith("rooms_test@") ||
        marker.project !== "tools-forest-rooms-test"
    ) {
        throw new Error("Room test server/account/marker mismatch.");
    }
} finally {
    await connection.end();
}
for (const args of [
    ["ace.js", "migration:run", "--force"],
    ["ace.js", "test", "functional"],
]) {
    const result = spawnSync(process.execPath, args, { stdio: "inherit", env: process.env });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}
