
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/pdf',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { requestData } = await req.json();
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
    const { width, height } = page.getSize();
    
    // Add a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const drawText = (text, x, y, options = {}) => {
      const { fontSize = 12, font: textFont = font, color = rgb(0, 0, 0) } = options;
      page.drawText(text, { x, y, font: textFont, size: fontSize, color });
    };
    
    // Title
    drawText(`${requestData.type.toUpperCase()} REQUEST LETTER`, 180, height - 50, { 
      fontSize: 18, 
      font: boldFont 
    });
    
    // Current date
    const currentDate = new Date().toLocaleDateString();
    drawText(`Date: ${currentDate}`, 50, height - 80);
    
    // Personal Details
    drawText('PERSONAL DETAILS', 50, height - 120, { fontSize: 14, font: boldFont });
    drawText(`Name: ${requestData.studentName}`, 50, height - 150);
    drawText(`Student/Staff ID: ${requestData.studentId}`, 50, height - 170);
    drawText(`Department: Computer Science`, 50, height - 190);  // Placeholder
    drawText(`Contact: student@example.com`, 50, height - 210);  // Placeholder
    
    // Request Details
    drawText('REQUEST DETAILS', 50, height - 250, { fontSize: 14, font: boldFont });
    drawText(`Request Type: ${requestData.type.charAt(0).toUpperCase() + requestData.type.slice(1)}`, 50, height - 280);
    drawText(`From: ${new Date(requestData.startDate).toLocaleDateString()}`, 50, height - 300);
    drawText(`To: ${new Date(requestData.endDate).toLocaleDateString()}`, 50, height - 320);
    
    if (requestData.type === 'od' && requestData.periods) {
      drawText(`Number of Periods: ${requestData.periods}`, 50, height - 340);
      drawText(`Reason: ${requestData.reason}`, 50, height - 360);
      if (requestData.details) {
        drawText(`Additional Information: ${requestData.details}`, 50, height - 380);
      }
    } else {
      drawText(`Reason: ${requestData.reason}`, 50, height - 340);
      if (requestData.details) {
        drawText(`Additional Information: ${requestData.details}`, 50, height - 360);
      }
    }
    
    // Approval Details
    drawText('APPROVAL DETAILS', 50, height - 420, { fontSize: 14, font: boldFont });
    drawText(`Status: ${requestData.status.toUpperCase()}`, 50, height - 450);
    
    // Footer
    drawText(`This document was automatically generated by UniSync on ${currentDate}`, 120, 50);
    
    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    
    return new Response(pdfBytes, { 
      headers: {
        ...corsHeaders,
        'Content-Disposition': `attachment; filename="${requestData.type}_request_${requestData.id}.pdf"`,
      }
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate PDF' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
