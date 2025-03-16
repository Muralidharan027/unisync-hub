
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "https://esm.sh/resend@2.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      throw new Error("Email service configuration is missing");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);
    
    const { leaveData } = await req.json();
    
    if (!leaveData) {
      throw new Error('Leave request data is required');
    }
    
    const { staffEmail, adminEmail, senderName, registerNumber, requestType, startDate, endDate, reason, details } = leaveData;
    
    // Validate email addresses
    if (!staffEmail || !adminEmail) {
      throw new Error('Staff and Admin emails are required');
    }
    
    console.log('Sending email to:', staffEmail, adminEmail);
    console.log('Leave request details:', leaveData);
    
    // Format dates 
    const formattedStartDate = new Date(startDate).toLocaleDateString();
    const formattedEndDate = new Date(endDate).toLocaleDateString();
    
    // Create email content
    const { data, error } = await resend.emails.send({
      from: 'Leave Management System <onboarding@resend.dev>',
      to: [staffEmail, adminEmail],
      subject: `Leave Request from ${senderName} (${registerNumber})`,
      html: `
        <h1>New Leave Request</h1>
        <p>A new ${requestType} request has been submitted by:</p>
        <ul>
          <li><strong>Name:</strong> ${senderName}</li>
          <li><strong>Register Number:</strong> ${registerNumber}</li>
          <li><strong>From:</strong> ${formattedStartDate}</li>
          <li><strong>To:</strong> ${formattedEndDate}</li>
          <li><strong>Reason:</strong> ${reason}</li>
          ${details ? `<li><strong>Details:</strong> ${details}</li>` : ''}
        </ul>
        <p>Please review this request in the UniSync system.</p>
      `,
    });
    
    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
    
    console.log("Email sent successfully:", data);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email notification sent successfully'
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
    
  } catch (error) {
    console.error('Error sending email notification:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send email notification'
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
