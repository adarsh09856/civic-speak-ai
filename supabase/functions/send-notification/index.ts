import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  complaintId: string;
  userId: string;
  status: string;
  complaintTitle: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { complaintId, userId, status, complaintTitle }: NotificationRequest = await req.json();

    const statusMessages: Record<string, string> = {
      SUBMITTED: "Your complaint has been submitted successfully.",
      UNDER_REVIEW: "Your complaint is now under review by the relevant department.",
      IN_PROGRESS: "Good news! Work has started on resolving your complaint.",
      RESOLVED: "Your complaint has been resolved. Thank you for your patience.",
      REJECTED: "Your complaint could not be processed. Please contact support for more information.",
    };

    const message = statusMessages[status] || `Your complaint status has been updated to ${status}.`;
    const title = `Complaint ${status.replace('_', ' ')}: ${complaintTitle}`;

    // Create in-app notification
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        complaint_id: complaintId,
        title: title,
        message: message,
        type: 'IN_APP',
      });

    if (notifError) {
      console.error("Failed to create notification:", notifError);
    }

    // Get user email for email notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    // If RESEND_API_KEY is configured, send email
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey && profile?.email) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "JanConnect+ <onboarding@resend.dev>",
            to: [profile.email],
            subject: title,
            html: `
              <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #1a3a8f 0%, #0f2460 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 24px;">JanConnect+</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
                  <h2 style="color: #1a3a8f; margin-top: 0;">Hello${profile.full_name ? ` ${profile.full_name}` : ''}!</h2>
                  <p style="color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
                  <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Complaint Reference:</p>
                    <p style="margin: 8px 0 0 0; color: #1a3a8f; font-weight: bold; font-size: 16px;">${complaintTitle}</p>
                  </div>
                  <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/track" 
                     style="display: inline-block; background: #2f9e8f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                    Track Your Complaint
                  </a>
                  <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                    This is an automated message from JanConnect+. Please do not reply to this email.
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          // Update notification as sent
          await supabase
            .from('notifications')
            .update({ sent_at: new Date().toISOString(), type: 'EMAIL' })
            .eq('complaint_id', complaintId)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1);
        }
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification created" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
