import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const project = "tools-forest-rooms-test";
const volume = `${project}_rooms-test-db`;
const compose = [
    "compose",
    "--env-file",
    "/dev/null",
    "-p",
    project,
    "-f",
    resolve(root, "compose.rooms.test.yaml"),
];
if (process.argv.slice(2).join(" ") !== "--target rooms-test") {
    throw new Error("Use --target rooms-test; ordinary Tools databases are never test targets.");
}
function docker(args, capture = false) {
    const result = spawnSync("docker", args, {
        cwd: root,
        env: { ...process.env, COMPOSE_DISABLE_ENV_FILE: "true" },
        encoding: "utf8",
        stdio: capture ? "pipe" : "inherit",
    });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`Room test Docker operation failed: ${args[0]}`);
    return result.stdout;
}
function verifyVolume() {
    if (
        !docker(
            ["volume", "ls", "--filter", `name=^${volume}$`, "--format", "{{.Name}}"],
            true,
        ).trim()
    )
        return;
    const [state] = JSON.parse(docker(["volume", "inspect", volume], true));
    if (
        state.Labels?.["com.docker.compose.project"] !== project ||
        state.Labels?.["com.docker.compose.volume"] !== "rooms-test-db"
    ) {
        throw new Error("Room test volume ownership mismatch.");
    }
}
verifyVolume();
docker([...compose, "up", "-d", "--wait", "mysql"]);
verifyVolume();
docker([...compose, "run", "--name", `${project}-active-run`, "--build", "--rm", "runner"]);
