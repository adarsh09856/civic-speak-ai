import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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

    console.log(`Processing notification for complaint ${complaintId}, status: ${status}`);

    const statusMessages: Record<string, string> = {
      SUBMITTED: "Your complaint has been submitted successfully.",
      AI_PROCESSED: "Your complaint has been analyzed by our AI system.",
      ASSIGNED: "Your complaint has been assigned to the relevant department.",
      IN_PROGRESS: "Good news! Work has started on resolving your complaint.",
      RESOLVED: "Your complaint has been resolved. Thank you for your patience.",
      REJECTED: "Your complaint could not be processed. Please contact support for more information.",
    };

    const adminStatusMessages: Record<string, string> = {
      SUBMITTED: "A new complaint has been submitted and requires attention.",
      AI_PROCESSED: "A complaint has been processed by AI and awaits review.",
      ASSIGNED: "A complaint has been assigned to a department.",
      IN_PROGRESS: "A complaint is now being worked on.",
      RESOLVED: "A complaint has been marked as resolved.",
      REJECTED: "A complaint has been rejected.",
    };

    const userMessage = statusMessages[status] || `Your complaint status has been updated to ${status}.`;
    const adminMessage = adminStatusMessages[status] || `Complaint status updated to ${status}.`;
    const title = `Complaint ${status.replace('_', ' ')}: ${complaintTitle}`;

    // Create in-app notification for the user (using PUSH type for in-app)
    const { error: userNotifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        complaint_id: complaintId,
        title: title,
        message: userMessage,
        type: 'PUSH',
      });

    if (userNotifError) {
      console.error("Failed to create user notification:", userNotifError);
    } else {
      console.log("User notification created successfully");
    }

    // Get all admin users to notify them
    const { data: adminRoles, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');

    if (adminError) {
      console.error("Failed to fetch admin users:", adminError);
    } else if (adminRoles && adminRoles.length > 0) {
      console.log(`Found ${adminRoles.length} admin(s) to notify`);
      
      const adminNotifications = adminRoles.map(admin => ({
        user_id: admin.user_id,
        complaint_id: complaintId,
        title: `[Admin] ${title}`,
        message: adminMessage,
        type: 'PUSH' as const,
      }));

      const { error: adminNotifError } = await supabase
        .from('notifications')
        .insert(adminNotifications);

      if (adminNotifError) {
        console.error("Failed to create admin notifications:", adminNotifError);
      } else {
        console.log("Admin notifications created successfully");
      }
    }

    // Get user email for email notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('user_id', userId)
      .single();

    // Send email using Gmail SMTP
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (gmailUser && gmailPassword && profile?.email) {
      console.log(`Sending email to ${profile.email} via Gmail SMTP`);
      
      try {
        const client = new SMTPClient({
          connection: {
            hostname: "smtp.gmail.com",
            port: 465,
            tls: true,
            auth: {
              username: gmailUser,
              password: gmailPassword,
            },
          },
        });

        const emailHtml = `
          <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #1a3a8f 0%, #0f2460 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">JanConnect+</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
              <h2 style="color: #1a3a8f; margin-top: 0;">Hello${profile.full_name ? ` ${profile.full_name}` : ''}!</h2>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">${userMessage}</p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Complaint Reference:</p>
                <p style="margin: 8px 0 0 0; color: #1a3a8f; font-weight: bold; font-size: 16px;">${complaintTitle}</p>
              </div>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
                This is an automated message from JanConnect+. Please do not reply to this email.
              </p>
            </div>
          </div>
        `;

        await client.send({
          from: gmailUser,
          to: profile.email,
          subject: title,
          content: "auto",
          html: emailHtml,
        });

        await client.close();

        console.log("Email sent successfully via Gmail SMTP");
        
        // Update notification to show email was sent
        await supabase
          .from('notifications')
          .update({ sent_at: new Date().toISOString(), type: 'EMAIL' })
          .eq('complaint_id', complaintId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
      } catch (emailError) {
        console.error("Gmail SMTP error:", emailError);
      }
    } else {
      console.log("Email not sent - Gmail credentials not configured or user has no email");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications created" }),
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
