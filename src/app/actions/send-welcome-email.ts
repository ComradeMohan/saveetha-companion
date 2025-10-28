'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z.object({
  to: z.string().email(),
  name: z.string(),
});

export async function sendWelcomeEmail(params: { to: string, name: string }) {
  const validated = emailSchema.safeParse(params);

  if (!validated.success) {
    console.error('Invalid email parameters:', validated.error);
    return { success: false, error: 'Invalid parameters' };
  }

  const { to, name } = validated.data;
  const firstName = name.split(' ')[0];

  try {
    const { data, error } = await resend.emails.send({
      from: 'Saveetha Companion <welcome@saveethahub.tech>',
      to: [to],
      subject: `Welcome to Saveetha Companion, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Welcome aboard, ${firstName}!</h2>
          <p>We're thrilled to have you join the Saveetha Companion community.</p>
          <p>You now have access to a suite of tools designed to make your academic life easier, including:</p>
          <ul>
            <li>CGPA & Attendance Calculators</li>
            <li>Concept Map Library</li>
            <li>Faculty Directory</li>
            <li>University Updates & Announcements</li>
          </ul>
          <p>We're constantly working to add new features to help you succeed. If you have any feedback or ideas, please don't hesitate to reach out via our contact form.</p>
          <p>Best of luck with your studies!</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The Saveetha Companion Team</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
