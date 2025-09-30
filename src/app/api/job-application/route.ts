import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, jobTitle } = body;

    // Validate required fields
    if (!name || !email || !phone || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create email content
    const emailSubject = `${jobTitle} Application - ${name}`;
    const emailBody = `
Name: ${name}
Email: ${email}
Phone: ${phone}
Position: ${jobTitle}

I am interested in applying for the ${jobTitle} position at Grandview Realty.

Please contact me to discuss this opportunity further.

Thank you,
${name}
    `.trim();

    // Check if Resend API key is configured
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length);
    
    if (!process.env.RESEND_API_KEY) {
      // Fallback to mailto link if API key is not configured
      const mailtoLink = `mailto:lynda@grandviewsells.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      return NextResponse.json({
        success: true,
        message: 'Application ready to send',
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
          <h2 style="color: #1a365d;">Job Application: ${jobTitle}</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Applicant Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Position:</strong> ${jobTitle}</p>
          </div>
          <div style="background-color: #ffffff; padding: 20px; border-left: 4px solid #1a365d; margin: 20px 0;">
            <h3 style="color: #1a365d; margin-top: 0;">Application Message:</h3>
            <p>I am interested in applying for the ${jobTitle} position at Grandview Realty.</p>
            <p>Please contact me to discuss this opportunity further.</p>
            <p><strong>Thank you,<br>${name}</strong></p>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This job application was submitted through the Grandview Realty careers page.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Resend email error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Failed to send application: ${error.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application sent successfully',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Job application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
