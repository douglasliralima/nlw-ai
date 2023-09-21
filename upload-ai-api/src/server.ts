import { fastify } from "fastify"
import { fastifyCors } from '@fastify/cors'
import { getAllPrompts } from "./routes/getAllPrompts";
import { postVideo } from "./routes/postVideo"
import { postTranscription } from "./routes/postTranscription";
import { getAICompletation } from "./routes/getAICompletation";

const app = fastify()

app.get("/", () => {
    return "health"
});

app.register(fastifyCors, {
    origin: '*'
})

app.register(getAllPrompts);
app.register(postVideo);
app.register(postTranscription);
app.register(getAICompletation)

app.listen({
    port: 3333,
}).then(() => {
    console.log("Hello, server running!! \o/")
})