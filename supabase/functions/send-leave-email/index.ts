
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { leaveData } = await req.json();
    
    if (!leaveData) {
      throw new Error('Leave request data is required');
    }
    
    const { staffEmail, adminEmail, senderName, registerNumber, requestType } = leaveData;
    
    // Validate email addresses
    if (!staffEmail || !adminEmail) {
      throw new Error('Staff and Admin emails are required');
    }
    
    // In a real app, we would use an email service like Resend, SendGrid, etc.
    // For now, we'll just log the email data
    console.log('Sending email to:', staffEmail, adminEmail);
    console.log('Leave request details:', leaveData);
    
    // Here you would integrate with an email service
    // Example with Resend (uncomment and add your API key when ready):
    /*
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const resend = new Resend(RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: 'leave-system@yourdomain.com',
      to: [staffEmail, adminEmail],
      subject: `Leave Request from ${senderName} (${registerNumber})`,
      html: `
        <h1>New Leave Request</h1>
        <p>A new ${requestType} request has been submitted by:</p>
        <ul>
          <li><strong>Name:</strong> ${senderName}</li>
          <li><strong>Register Number:</strong> ${registerNumber}</li>
          <li><strong>From:</strong> ${leaveData.startDate}</li>
          <li><strong>To:</strong> ${leaveData.endDate}</li>
          <li><strong>Reason:</strong> ${leaveData.reason}</li>
          ${leaveData.details ? `<li><strong>Details:</strong> ${leaveData.details}</li>` : ''}
        </ul>
        <p>Please review this request in the UniSync system.</p>
      `,
    });
    
    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }
    */
    
    // For now, we'll mock a successful email send
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
