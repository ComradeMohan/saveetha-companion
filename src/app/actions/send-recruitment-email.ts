
'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z.object({
  name: z.string(),
  userEmail: z.string().email(),
  personalEmail: z.string().email(),
  regNo: z.string(),
  batch: z.string(),
});

export async function sendRecruitmentEmail(params: z.infer<typeof emailSchema>) {
  const validated = emailSchema.safeParse(params);

  if (!validated.success) {
    console.error('Invalid recruitment email parameters:', validated.error);
    return { success: false, error: 'Invalid parameters' };
  }

  const { name, userEmail, personalEmail, regNo, batch } = validated.data;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Saveetha Companion Recruitment <recruitment@univault.live>',
      to: ['k.nobitha666@gmail.com'],
      subject: `New Recruitment Interest: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Recruitment Submission</h2>
          <p>A student has expressed interest in joining the team.</p>
          <h3>Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Student Email:</strong> ${userEmail}</li>
            <li><strong>Personal Email:</strong> ${personalEmail}</li>
            <li><strong>Registration No:</strong> ${regNo}</li>
            <li><strong>Batch:</strong> ${batch}</li>
          </ul>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error (Recruitment):', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send recruitment email:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
