import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "page") {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === "leadgen") {
            const leadgenId = change.value.leadgen_id;
            const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

            const response = await fetch(
              "https://graph.facebook.com/v19.0/" + leadgenId + "?access_token=" + accessToken
            );
            const leadData = await response.json();

            console.log("Raw Meta lead data:", JSON.stringify(leadData));

            if (leadData.field_data) {
              const fields: Record<string, string> = {};
              for (const field of leadData.field_data) {
                fields[field.name] = field.values[0];
              }

              console.log("Parsed fields:", JSON.stringify(fields));

              await prisma.lead.create({
                data: {
                  customerName: fields["full_name"] || fields["name"] || "Unknown",
                  contactNumber: fields["phone_number"] || fields["phone"] || "",
                  city: fields["city"] || "",
                  propertyType: fields["your_property_type"] || fields["property_type"] || "",
                  platform: "Meta",
                  status: "NEW",
                  leadCreatedDate: new Date(),
                  userId: process.env.DEFAULT_USER_ID!,
                },
              });

              console.log("New lead saved:", JSON.stringify(fields));
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
