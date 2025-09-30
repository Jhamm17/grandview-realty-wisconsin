import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message, subject, pageTitle, ...customFields } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create email content
    const emailSubject = `${pageTitle} Inquiry`;
    
    // Build custom fields section
    let customFieldsSection = '';
    if (Object.keys(customFields).length > 0) {
      customFieldsSection = '\nAdditional Information:\n';
      for (const [key, value] of Object.entries(customFields)) {
        if (value) {
          // Convert field names to readable labels
          const fieldLabel = key
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Property Address', 'Property Address')
            .replace('Property Type', 'Property Type')
            .replace('Preferred Location', 'Preferred Location')
            .replace('Budget Range', 'Budget Range')
            .replace('Estimated Property Value', 'Estimated Property Value')
            .replace('Timeline', 'Timeline')
            .replace('Evaluation Type', 'Type of Evaluation')
            .replace('When Do You Want To Buy', 'When do you want to buy?')
            .replace('When Do You Want To Sell', 'When do you want to sell?')
            .replace('When Do You Need The Evaluation', 'When do you need the evaluation?');
          
          customFieldsSection += `${fieldLabel}: ${value}\n`;
        }
      }
    }
    
    const emailBody = `
Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}${customFieldsSection}

---
This message was sent from the Grandview Realty contact form.
    `.trim();

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      // Fallback to mailto link if API key is not configured
      const mailtoLink = `mailto:lynda@grandviewsells.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      return NextResponse.json({
        success: true,
        message: 'Message ready to send',
        mailtoLink: mailtoLink,
        fallback: true
      });
    }

    // Send email automatically using Resend
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default domain until grandviewsells.com is verified
      to: ['lynda@grandviewsells.com'],
      subject: emailSubject,
      text: emailBody,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a365d;">${pageTitle} Inquiry</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ''}
            ${Object.keys(customFields).length > 0 ? `
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 15px 0;">
            <h4 style="color: #1a365d; margin: 10px 0 15px 0;">Additional Information:</h4>
            ${Object.entries(customFields).map(([key, value]) => {
              if (value) {
                const fieldLabel = key
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, l => l.toUpperCase())
                  .replace('Property Address', 'Property Address')
                  .replace('Property Type', 'Property Type')
                  .replace('Preferred Location', 'Preferred Location')
                  .replace('Budget Range', 'Budget Range')
                  .replace('Estimated Property Value', 'Estimated Property Value')
                  .replace('Timeline', 'Timeline')
                  .replace('Evaluation Type', 'Type of Evaluation')
                  .replace('When Do You Want To Buy', 'When do you want to buy?')
                  .replace('When Do You Want To Sell', 'When do you want to sell?')
                  .replace('When Do You Need The Evaluation', 'When do you need the evaluation?');
                return `<p><strong>${fieldLabel}:</strong> ${value}</p>`;
              }
              return '';
            }).join('')}
            ` : ''}
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #1a365d; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This message was sent from the Grandview Realty contact form.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend email error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. We will get back to you soon.',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 