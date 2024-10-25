import { setupSocketEvents } from "#controllers/socket/setup_socket_events";
import { Ws } from "#services/ws";
import app from "@adonisjs/core/services/app";
import emitter from "@adonisjs/core/services/emitter";
import logger from "@adonisjs/core/services/logger";
import db from "@adonisjs/lucid/services/db";

emitter.on("db:query", (query) => {
    if (app.inProduction) {
        logger.debug(query);
    } else {
        db.prettyPrint(query);
    }
});

emitter.on("http:server_ready", () => {
    Ws.boot();

    /**
     * Listen for incoming socket connections
     */
    Ws.io.on("connection", (socket) => {
        setupSocketEvents(socket);
        socket.emit("auth", "request"); // asks socket to authenticate
    });
});
