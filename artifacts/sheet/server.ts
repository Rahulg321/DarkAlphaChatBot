import { myProvider } from "@/lib/ai/models";
import { sheetPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { streamObject } from "ai";
import { z } from "zod";

export const sheetDocumentHandler = createDocumentHandler<"sheet">({
  kind: "sheet",
  onCreateDocument: async ({
    id,
    title,
    dataStream,
    session,
    content,
    metadata,
  }) => {
    let draftContent = "";

    // Send metadata to the client
    if (metadata) {
      console.log("metadata inside sheet Document Handler", metadata);

      dataStream.writeData({
        type: "metadata",
        content: metadata,
      });
    }

    // If content is provided, use it directly as the CSV data
    if (content) {
      draftContent = content;
      // Send the provided content to the data stream immediately
      dataStream.writeData({
        type: "sheet-delta",
        content: draftContent,
      });
    } else {
      // If no content is provided, generate CSV using the language model
      const { fullStream } = streamObject({
        model: myProvider.languageModel("artifact-model"),
        system: sheetPrompt,
        prompt: title,
        schema: z.object({
          csv: z.string().describe("CSV data"),
        }),
      });

      for await (const delta of fullStream) {
        const { type } = delta;

        if (type === "object") {
          const { object } = delta;
          const { csv } = object;

          if (csv) {
            dataStream.writeData({
              type: "sheet-delta",
              content: csv,
            });
            draftContent = csv;
          }
        }
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    console.log("Description inside server artifact", description);

    if (description.includes("https://")) {
      console.log("description includes https://");
    }

    const { fullStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: updateDocumentPrompt(document.content, "sheet"),
      prompt: description,
      schema: z.object({
        csv: z.string(),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;
      console.log("type", type);
      if (type === "object") {
        const { object } = delta;
        const { csv } = object;

        if (csv) {
          dataStream.writeData({
            type: "sheet-delta",
            content: csv,
          });
          draftContent = csv;
        }
      }
    }

    return draftContent;
  },
});
