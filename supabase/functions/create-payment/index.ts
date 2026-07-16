import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { corsHeaders } from "../_shared/cors.ts";

const PRICE_MAP: Record<number, string> = {
  1: "price_1TO2R4QdPVYZ96GxX4plTGfg",
  2: "price_1TO2REQdPVYZ96GxqeeQXZU7",
  3: "price_1TO2RNQdPVYZ96Gxr5rlLdR3",
};

const AMOUNT_MAP: Record<number, number> = {
  1: 15,
  2: 25,
  3: 40,
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      clientName,
      clientPhone,
      topic,
      questions,
      questionCount,
      clientPhoto,
      subjectPhotos,
      pushToken,
    } = await req.json();

    if (!clientName || !clientPhone || !topic || !questions || !questionCount) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const count = Number(questionCount);
    const priceId = PRICE_MAP[count];
    const amount = AMOUNT_MAP[count];

    if (!priceId || !amount) {
      return new Response(
        JSON.stringify({ error: "Invalid question count. Must be 1, 2, or 3." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create reading in database with unpaid status
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: reading, error: dbError } = await supabaseAdmin
      .from("readings")
      .insert({
        client_name: clientName,
        client_phone: clientPhone,
        topic,
        questions,
        answers: [],
        status: "pending",
        amount,
        payment_status: "unpaid",
        client_photo: clientPhoto || null,
        subject_photos: subjectPhotos || [],
        push_token: pushToken || null,
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to create reading: " + dbError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Stripe checkout session
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `askvalentina://payment/success?session_id={CHECKOUT_SESSION_ID}&reading_id=${reading.id}`,
      cancel_url: `askvalentina://payment/cancel?reading_id=${reading.id}`,
      metadata: {
        reading_id: reading.id,
      },
    });

    // Store session ID on the reading
    await supabaseAdmin
      .from("readings")
      .update({ stripe_session_id: session.id })
      .eq("id", reading.id);

    console.log("Checkout session created:", session.id, "for reading:", reading.id);

    return new Response(
      JSON.stringify({ url: session.url, readingId: reading.id, sessionId: session.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("create-payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
