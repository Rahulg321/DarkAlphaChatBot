import { generateUUID } from "@/lib/utils";
import { DataStreamWriter, tool } from "ai";
import { z } from "zod";
import { Session } from "next-auth";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.",
    parameters: z.object({
      title: z.string(),
      kind: z.enum(artifactKinds),
      content: z
        .string()
        .optional()
        .describe(
          "The content to include in the document, such as scraped data"
        ),
      metadata: z
        .object({
          dataType: z
            .enum(["team-member", "deal", "raw"])
            .optional()
            .describe(
              "The type of data, e.g., 'team-member' or 'deal' or `raw` if the data is generic"
            ),
        })
        .optional()
        .describe("Metadata for the document"),
    }),
    execute: async ({ title, kind, content, metadata }) => {
      const id = generateUUID();

      console.log("metadata received in createDocumentHandler Tool", metadata);
      console.log("content received inside createDocumentTool", content);

      dataStream.writeData({
        type: "kind",
        content: kind,
      });

      dataStream.writeData({
        type: "id",
        content: id,
      });

      dataStream.writeData({
        type: "title",
        content: title,
      });

      dataStream.writeData({
        type: "clear",
        content: "",
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      console.log("Calling documentHandler.onCreateDocument with:", {
        id,
        title,
        dataStream,
        session,
        content,
      });

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
        content,
        metadata,
      });

      dataStream.writeData({ type: "finish", content: "" });

      return {
        id,
        title,
        kind,
        content: "A document was created and is now visible to the user.",
      };
    },
  });
