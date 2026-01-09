import type { MultipartFile } from "@adonisjs/core/bodyparser";
import { cuid } from "@adonisjs/core/helpers";
import app from "@adonisjs/core/services/app";
import type { IImage } from "@galadrim-tools/shared";
import { createReadStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import type { Stream } from "node:stream";

type ImageFolder = "restaurant" | "codeNames" | "restaurantReviews" | "avatar";

export const imageAttachmentFromFile = async (
    file: MultipartFile,
    folder: ImageFolder,
): Promise<IImage> => {
    if (!file.tmpPath) {
        throw new Error("file has no tmpPath, it should not happen");
    }
    const extname = file.extname ?? "unknown";
    const stream = createReadStream(file.tmpPath);
    const name = `${cuid()}.${extname}`;
    const fileName = `${folder}/${name}`;
    const result = await imageAttachmentFromBufferOrStream(stream, fileName);

    await fs.unlink(file.tmpPath);

    return result;
};

const getPath = (name: string) => {
    return app.makePath("tmp/uploads", name);
};

export const imageAttachmentFromBufferOrStream = async (
    bufferOrStream: Buffer | Stream,
    fileName: string,
): Promise<IImage> => {
    const filePath = getPath(fileName);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, bufferOrStream);

    return {
        url: `/uploads/${fileName}`,
        name: `${fileName}`,
    };
};

export const ATTACHMENT_COLUMN = {
    prepare: (value: IImage | null) => (value ? JSON.stringify(value) : null),
    consume: (value: string | object | null) => {
        if (value === null) {
            return null;
        }
        if (typeof value === "string") {
            return JSON.parse(value);
        }
        return value;
    },
};
