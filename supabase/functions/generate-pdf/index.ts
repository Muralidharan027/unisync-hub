
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
    // Extract request data
    const body = await req.json();
    const requestData = body.requestData;
    
    if (!requestData) {
      console.error("Missing request data in the request body:", body);
      return new Response(
        JSON.stringify({ error: 'Request data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Received request data:", JSON.stringify(requestData));
    
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
    
    // Title and Letterhead
    drawText("UNIVERSITY LEAVE APPLICATION", 180, height - 50, { 
      fontSize: 18, 
      font: boldFont 
    });
    
    // Current date
    const currentDate = new Date().toLocaleDateString();
    drawText(`Date: ${currentDate}`, 50, height - 80);
    
    // From section
    drawText('FROM:', 50, height - 120, { fontSize: 14, font: boldFont });
    drawText(`Name: ${requestData.senderName || requestData.studentName}`, 50, height - 150);
    drawText(`Register Number: ${requestData.registerNumber || requestData.studentId}`, 50, height - 170);
    
    let yPos = height - 190;
    
    // Add new fields if they exist
    if (requestData.classYear) {
      drawText(`Class Year: ${requestData.classYear}`, 50, yPos);
      yPos -= 20;
    }
    
    if (requestData.section) {
      drawText(`Section: ${requestData.section}`, 50, yPos);
      yPos -= 20;
    }
    
    if (requestData.rollNumber) {
      drawText(`Roll Number: ${requestData.rollNumber}`, 50, yPos);
      yPos -= 20;
    }
    
    if (requestData.department) {
      drawText(`Department: ${requestData.department}`, 50, yPos);
      yPos -= 20;
    } else {
      drawText(`Department: Computer Science`, 50, yPos);  // Default
      yPos -= 20;
    }
    
    if (requestData.email) {
      drawText(`Email: ${requestData.email}`, 50, yPos);
      yPos -= 20;
    }
    
    // To section
    drawText('TO:', 50, yPos, { fontSize: 14, font: boldFont });
    yPos -= 30;
    drawText('The Head of Department,', 50, yPos);
    yPos -= 20;
    
    if (requestData.department) {
      drawText(`Department of ${requestData.department}`, 50, yPos);
    } else {
      drawText('Department of Computer Science', 50, yPos);  // Default
    }
    yPos -= 40;
    
    // Subject
    drawText('Subject: Leave Application', 50, yPos, { font: boldFont });
    yPos -= 40;
    
    // Salutation
    drawText('Dear Sir/Madam,', 50, yPos);
    yPos -= 40;
    
    // Main content
    const nameToUse = requestData.senderName || requestData.studentName;
    const idToUse = requestData.registerNumber || requestData.studentId;
    
    // Safely handle dates
    let startDateStr, endDateStr;
    try {
      startDateStr = new Date(requestData.startDate).toLocaleDateString();
      endDateStr = new Date(requestData.endDate).toLocaleDateString();
    } catch (e) {
      console.error("Date parsing error:", e);
      startDateStr = "Invalid date";
      endDateStr = "Invalid date";
    }
    
    // Construct the body text with proper line breaks
    const bodyText = `I, ${nameToUse}, with register number ${idToUse}, am writing to formally request ${requestData.type.toLowerCase()} from ${startDateStr} to ${endDateStr} due to the following reason:`;
    
    // Calculate line width and wrap text if needed
    const lineWidth = width - 100; // 50px margin on each side
    const words = bodyText.split(' ');
    let line = '';
    let bodyYPos = yPos;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const testWidth = font.widthOfTextAtSize(testLine, 12);
      
      if (testWidth > lineWidth && line !== '') {
        drawText(line, 50, bodyYPos);
        line = word + ' ';
        bodyYPos -= 20;
      } else {
        line = testLine;
      }
    }
    
    if (line !== '') {
      drawText(line, 50, bodyYPos);
      bodyYPos -= 20;
    }
    
    // Reason text (indented and possibly wrapped)
    bodyYPos -= 20;
    drawText(`"${requestData.reason}"`, 70, bodyYPos, { font: boldFont });
    
    // Additional details if available
    if (requestData.details && requestData.details.trim() !== '') {
      bodyYPos -= 40;
      drawText('Additional Details:', 50, bodyYPos);
      
      // Wrap details text if needed
      const detailsWords = requestData.details.split(' ');
      let detailsLine = '';
      bodyYPos -= 20;
      
      for (const word of detailsWords) {
        const testLine = detailsLine + word + ' ';
        const testWidth = font.widthOfTextAtSize(testLine, 12);
        
        if (testWidth > lineWidth && detailsLine !== '') {
          drawText(detailsLine, 50, bodyYPos);
          detailsLine = word + ' ';
          bodyYPos -= 20;
        } else {
          detailsLine = testLine;
        }
      }
      
      if (detailsLine !== '') {
        drawText(detailsLine, 50, bodyYPos);
        bodyYPos -= 20;
      }
    }
    
    // Closing text
    bodyYPos -= 40;
    drawText('I kindly request you to consider my application and grant me the necessary permission for leave.', 50, bodyYPos);
    
    bodyYPos -= 40;
    drawText('Thanking you.', 50, bodyYPos);
    
    // Signature section
    bodyYPos -= 60;
    drawText('Yours sincerely,', 50, bodyYPos);
    bodyYPos -= 40;
    drawText(nameToUse, 50, bodyYPos, { font: boldFont });
    
    // Status and approval
    if (requestData.status) {
      bodyYPos -= 80;
      drawText('APPROVAL STATUS:', 50, bodyYPos, { fontSize: 14, font: boldFont });
      bodyYPos -= 30;
      
      const statusText = requestData.status.toUpperCase();
      let statusColor = rgb(0, 0, 0);
      
      if (statusText === 'APPROVED') {
        statusColor = rgb(0, 0.5, 0);
      } else if (statusText === 'REJECTED') {
        statusColor = rgb(0.8, 0, 0);
      } else if (statusText === 'PENDING') {
        statusColor = rgb(0.8, 0.6, 0);
      }
      
      drawText(statusText, 50, bodyYPos, { 
        fontSize: 16, 
        font: boldFont,
        color: statusColor
      });
    }
    
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
      JSON.stringify({ error: 'Failed to generate PDF', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
