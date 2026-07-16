import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { readingId } = await req.json();

    if (!readingId) {
      return new Response(
        JSON.stringify({ error: "Missing readingId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch the reading to get push token and details
    const { data: reading, error: readingError } = await supabaseAdmin
      .from("readings")
      .select("*")
      .eq("id", readingId)
      .single();

    if (readingError || !reading) {
      console.error("Reading not found:", readingError);
      return new Response(
        JSON.stringify({ error: "Reading not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!reading.push_token) {
      console.log("No push token for reading:", readingId);
      return new Response(
        JSON.stringify({ sent: false, reason: "No push token available for this reading" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine notification content based on reading status
    let title = "ASK VALENTINA";
    let body = "You have an update on your reading.";

    if (reading.status === "completed") {
      title = "Your Reading is Ready ✨";
      body = `Valentina has answered your ${reading.questions?.length || 1} question${(reading.questions?.length || 1) > 1 ? "s" : ""} about ${reading.topic || "your reading"}. Tap to view your spiritual guidance.`;
    } else if (reading.status === "inProgress") {
      title = "Reading In Progress 🔮";
      body = "Valentina is working on your reading. Your answers are coming soon.";
    }

    // Send push notification via Expo Push API
    const pushResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: reading.push_token,
        title,
        body,
        sound: "default",
        badge: 1,
        data: {
          readingId: reading.id,
          status: reading.status,
        },
        channelId: "readings",
      }),
    });

    const pushResult = await pushResponse.json();
    console.log("Push notification result:", JSON.stringify(pushResult));

    // Check for errors in the push response
    if (pushResult.data?.status === "error") {
      console.error("Expo push error:", pushResult.data.message);
      return new Response(
        JSON.stringify({
          sent: false,
          reason: pushResult.data.message,
          details: pushResult.data.details,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sent: true, ticket: pushResult.data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-notification error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
