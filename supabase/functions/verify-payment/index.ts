import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, readingId } = await req.json();

    if (!sessionId || !readingId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId or readingId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log("Verifying payment - session:", sessionId, "status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({
          verified: false,
          status: session.payment_status,
          error: "Payment not completed",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Payment confirmed — update reading status in database
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: reading, error: updateError } = await supabaseAdmin
      .from("readings")
      .update({
        payment_status: "paid",
        status: "pending",
      })
      .eq("id", readingId)
      .eq("stripe_session_id", sessionId)
      .select()
      .single();

    if (updateError) {
      console.error("DB update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update reading: " + updateError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment verified and reading updated:", readingId);

    return new Response(
      JSON.stringify({
        verified: true,
        status: "paid",
        reading,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("verify-payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
