import { tool } from "ai";
import { z } from "zod";
import FirecrawlApp, { MapResponse } from "@mendable/firecrawl-js";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

// the `tool` helper function ensures correct type inference:
export const mapUrlTool = tool({
  description:
    "Given a website URL you can it to get all the urls nested inside that website. Use this tool whenever a user wants all URL's inside a website",
  parameters: z.object({
    url: z
      .string()
      .describe("The url from inside which we need to get all URLS"),
  }),
  execute: async ({ url }) => {
    console.log("getting all urls inside", url);
    const mapResult = (await app.mapUrl(url)) as MapResponse;

    if (!mapResult.success) {
      throw new Error(`Failed to map: ${mapResult.error}`);
    }

    console.log("all urls from map result", mapResult);
    return { scrapedUrls: mapResult };

    // return { dataType, items, url };
  },
});
