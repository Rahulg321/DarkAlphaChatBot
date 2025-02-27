import { tool } from "ai";
import { z } from "zod";
import FirecrawlApp from "@mendable/firecrawl-js";
import {
  multipleListingSchema,
  multipleTeamMemberSchema,
  singleListingSchema,
  singleTeamMemberSchema,
} from "@/lib/schemas";

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

const scrapedItems = [
  {
    type: "founder",
    firstName: "Tom",
    lastName: "Pfennig",
    designation: "Founder & CEO",
    linkedInUrl: "https://www.linkedin.com/in/thomas-pfennig-7750b518/",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "founder",
    firstName: "Dr. Vera",
    lastName: "Roedel",
    designation: "Co-Founder & Partnership Officer",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "founder",
    firstName: "Dr. Sunu",
    lastName: "Engineer",
    designation: "Co-Founder & Technology Officer",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Mel",
    lastName: "Nirmala",
    designation: "Corporate Director - Singapore Branch",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Dr. Ilona",
    lastName: "Murati-Laebe",
    designation: "Legal & Compliance Transformation Expert (EMEA | APAX)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Gustavo",
    lastName: "Siqueira",
    designation: "Legal & Compliance Transformation Expert (AMERICAS)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Swati",
    lastName: "Thounaojam",
    designation: "R&D, Data and Market Analytics (INDIA)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Tadala",
    lastName: "Chinkwezule",
    designation: "Legal & Compliance Transformation Expert (AFRICA)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Larry",
    lastName: "Platkin",
    designation: "Legal & Compliance Transformation Expert (USA | CANADA)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Piyush",
    lastName: "Rajput",
    designation: "LegalTech Software Testing Expert (INDIA)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Gaijatri",
    lastName: "Gupta",
    designation: "LegalTech UX Specialist Lawyer (INDIA)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Adarsh",
    lastName: "Tatiya",
    designation: "Director Legal Technology and Operations",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Alan",
    lastName: "Gibson",
    designation:
      "Senior Technical Advisor Digital Innovation Lead (USA | Canada)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Priyanka",
    lastName: "Ahire",
    designation:
      "Development and Operations Test Environment and Directory (INDIA)",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
  {
    type: "team",
    firstName: "Yunna",
    lastName: "Choi",
    designation: "Digital UX and UI Interface. Expert",
    linkedInUrl: "",
    detailPageUrl: "https://transforming.legal/contact",
  },
];

// the `tool` helper function ensures correct type inference:
export const scrapeUrlTool = tool({
  description:
    "Scrape all content from the provided URL. If the content is valuable then extract it and return it in a structured way. If the situation requires getting content from a webpage then use this tool",
  parameters: z.object({
    url: z.string().describe("The url to scrape content from"),
    dataType: z
      .enum(["team-member", "deal"])
      .describe("The type of data to extract: 'team-member' or 'deal'"),
  }),
  execute: async ({ url, dataType }) => {
    console.log(`Extracting ${dataType} from`, url);
    console.log(`Extracting from`, url);

    let extractionPrompt = "extract all valuable content from this url";

    if (dataType === "team-member") {
      extractionPrompt = `
        Extract all team members from this web page and capture all relevant information as you can from them and return the data as a JSON array of objects.
      `;
    } else if (dataType === "deal") {
      extractionPrompt = `
        Extract all deals from the webpage and return the data as a JSON array of objects.
      `;
    }

    const scrapeResponse = await app.extract([url], {
      prompt: extractionPrompt,
    });

    console.log("scrape Response", scrapeResponse);

    if (!scrapeResponse.success) {
      console.log("Scrape failed:", scrapeResponse.error);
      throw new Error(`Failed to scrape and extract: ${scrapeResponse.error}`);
    }

    // @ts-ignore
    const items = scrapeResponse.data;
    console.log("items", items);

    return { scrapedItems, dataType: "team-member" };

    // return { dataType, items, url };
  },
});
