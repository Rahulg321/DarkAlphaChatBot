import { NextApiRequest, NextApiResponse } from "next";
import { teamMember, deal } from "@/lib/db/schema";
import { auth } from "@/app/(auth)/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  const { dataType, items, url } = await request.json();

  try {
    if (dataType === "team-member") {
      for (const item of items) {
        const member = {
          first_name: item["First Name"] || "",
          last_name: item["Last Name"] || "",
          designation: item["Designation"] || null,
          linkedin_url: item["LinkedIn URL"] || null,
          company_url: item["Company URL"] || url, // Use scraped URL if not provided
          company_name: "Transforming Legal", // Hardcoded; adjust if extractable
          created_at: new Date(),
          updated_at: new Date(),
        };
        // await db
        //   .insert(teamMember)
        //   .values(member)
        //   .onConflictDoNothing({
        //     target: [
        //       teamMember.first_name,
        //       teamMember.last_name,
        //       teamMember.company_name,
        //     ],
        //   });
      }
      return NextResponse.json(
        {
          message: "Team members saved successfully",
        },
        {
          status: 200,
        }
      );
    } else if (dataType === "deal") {
      for (const item of items) {
        const dealData = {
          brokerage: item["Brokerage"] || "",
          firstName: item["First Name"] || null,
          lastName: item["Last Name"] || null,
          email: item["Email"] || null,
          linkedinUrl: item["LinkedIn URL"] || null,
          workPhone: item["Work Phone"] || null,
          dealCaption: item["Deal Caption"] || null,
          revenue: item["Revenue"] ? parseFloat(item["Revenue"]) : null,
          ebitda: item["EBITDA"] ? parseFloat(item["EBITDA"]) : null,
          title: item["Title"] || "",
          grossRevenue: item["Gross Revenue"]
            ? parseFloat(item["Gross Revenue"])
            : null,
          askingPrice: item["Asking Price"]
            ? parseFloat(item["Asking Price"])
            : null,
          ebitdaMargin: item["EBITDA Margin"]
            ? parseFloat(item["EBITDA Margin"])
            : null,
          industry: item["Industry"] || "",
          dealType: item["Deal Type"] || "MANUAL",
          sourceWebsite: url, // Required field
          companyLocation: item["Company Location"] || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        // await db
        //   .insert(deal)
        //   .values(dealData)
        //   .onConflictDoNothing({
        //     target: [deal.brokerage, deal.title, deal.industry],
        //   });
      }
      return NextResponse.json(
        {
          message: "Deals saved successfully",
        },
        {
          status: 200,
        }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid Data type" },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json(
      { message: "Error Occured while saving data" },
      {
        status: 500,
      }
    );
  }
}
