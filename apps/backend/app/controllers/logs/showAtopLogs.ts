import app from "@adonisjs/core/services/app";
import type { HttpContext } from "@adonisjs/core/http";
import { createReadStream, statSync } from "node:fs";

export const showAtopLogs = async ({ params, response }: HttpContext) => {
    const directory = app.tmpPath("uploads/atop");
    const filePath = `${directory}/${params.id}`;

    try {
        statSync(filePath); // check if file exists, throw if not

        const readStream = createReadStream(filePath);

        response.type("application/json");

        return response.stream(readStream);
    } catch (error) {
        return response.notFound({ error: "log file not found" });
    }
};
