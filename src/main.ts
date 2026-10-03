import { config } from "dotenv";
import { fileURLToPath } from "node:url";
import { OpenRouter } from "@openrouter/sdk";
import { parseArgs } from "node:util";

// load the .env next to the code, so mypi works from any folder
config({ path: fileURLToPath(new URL("../.env", import.meta.url)), quiet: true });

const {values} = parseArgs({
    options:{
        prompt: {type: "string", short:"p"},
        model: {type: "string", default:"poolside/laguna-s-2.1:free"}
    }
})

if(!values.prompt){
    console.error("no prompt given");
    process.exit(1);
}

const client = new OpenRouter();

const result = await client.chat.send({
    chatRequest: {
  messages: [
    {
      role: "user",
      content: values.prompt,
    },
  ],
    model: values.model,
    stream:true
}
});

// FIX: Type Guard to let TypeScript know this is an iterable stream
if (!(result instanceof ReadableStream)) {
  throw new Error("Expected a streaming response from OpenRouter");
}

for await (const chunk of result) {
  // Use optional chaining (?.) just in case an intermediate chunk contains metadata instead of delta content
  process.stdout.write(chunk.choices[0]?.delta?.content ?? "");
}

console.log();
