import { FastifyInstance } from "fastify";
// Para processamento de arquivos e vídeos geralmente utilizamos uma extensão diferente
import fastifyMultipart from "@fastify/multipart";
import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";

import path from "node:path";
import fs from "node:fs"
import util from "node:util"
import { pipeline } from "node:stream"
const pump = util.promisify(pipeline)

export async function postVideo(app: FastifyInstance) {
    app.register(fastifyMultipart);

    app.post("/videos", async (req, res) => {
        const data = await req.file();

        if (!data) {
            return res.status(400).send({ error: "Missing file video." })
        }

        const extension = path.extname(data.filename)

        if (!extension.match("mp3"))
            return res.status(400).send({ error: "Invalid input type" })

        const fileBaseName = path.basename(data.filename, extension)
        const uniqueFileName = `${fileBaseName}-${randomUUID()}${extension}`
        const uploadDestination = path.resolve(__dirname, "../../tmp", uniqueFileName);

        await pump(data.file, fs.createWriteStream(uploadDestination));

        const video = await prisma.video.create({
            data: {
                name: fileBaseName,
                path: uploadDestination
            }
        })

        return res.send({
            data: video
        })
    })
}