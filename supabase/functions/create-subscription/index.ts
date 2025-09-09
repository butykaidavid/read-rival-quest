import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    const { planType } = await req.json();
    
    if (!["monthly", "yearly", "lifetime"].includes(planType)) {
      throw new Error("Invalid plan type");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({ email: user.email });
      customerId = customer.id;
    }

    // Price configuration
    const prices = {
      monthly: 399, // $3.99
      yearly: 3900, // $39.00
      lifetime: 9900, // $99.00
    };

    let sessionConfig: any;

    if (planType === "lifetime") {
      // One-time payment for lifetime
      sessionConfig = {
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: "ReadRival Premium Lifetime",
                description: "Lifetime access to all premium features"
              },
              unit_amount: prices.lifetime,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.get("origin")}/subscription-success?plan=${planType}`,
        cancel_url: `${req.headers.get("origin")}/subscription-canceled`,
        metadata: {
          user_id: user.id,
          plan_type: planType,
        },
      };
    } else {
      // Recurring subscription
      sessionConfig = {
        customer: customerId,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: { 
                name: `ReadRival Premium ${planType.charAt(0).toUpperCase() + planType.slice(1)}`,
                description: "Access to all premium features"
              },
              unit_amount: prices[planType as keyof typeof prices],
              recurring: {
                interval: planType === "monthly" ? "month" : "year",
              },
            },
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/subscription-success?plan=${planType}`,
        cancel_url: `${req.headers.get("origin")}/subscription-canceled`,
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_type: planType,
          },
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Store subscription intent in database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("subscriptions").upsert({
      user_id: user.id,
      stripe_customer_id: customerId,
      status: "pending",
      plan_type: planType,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});