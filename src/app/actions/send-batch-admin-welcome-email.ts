
'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const emailSchema = z.object({
  to: z.string().email(),
  name: z.string(),
});

export async function sendBatchAdminWelcomeEmail(params: { to: string, name: string }) {
  const validated = emailSchema.safeParse(params);

  if (!validated.success) {
    console.error('Invalid email parameters for Batch Admin welcome:', validated.error);
    return { success: false, error: 'Invalid parameters' };
  }

  const { to, name } = validated.data;
  const firstName = name.split(' ')[0] || 'there';

  try {
    const { data, error } = await resend.emails.send({
      from: 'Saveetha Companion Team <welcome@saveethahub.tech>',
      to: [to],
      subject: `🎉 Welcome to the Saveetha Companion Team, ${firstName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 40px auto; background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <h2 style="color: #007bff; text-align: center;">🎉 Welcome to the Saveetha Companion Team, ${firstName}!</h2>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Hi <strong>${name.toUpperCase()}</strong>,<br><br>
                We're excited to let you know that your recruitment submission has been 
                <strong>approved</strong> and your portal access has been successfully activated!
            </p>

            <h3 style="color: #007bff; margin-top: 25px;">🚀 Your Portal Access Details</h3>
            <p style="font-size: 15px; color: #333; line-height: 1.6;">
                You can now log in to your batch admin portal using your registered college email.
            </p>

            <p style="font-size: 15px; margin-top: 10px;">
                🔗 <a href="https://saveethahub.tech/batch-admin" target="_blank" style="color: #007bff; text-decoration: none;">Go to Batch Admin Dashboard</a>
            </p>

            <h3 style="color: #007bff; margin-top: 25px;">✨ What You Can Do Now</h3>
            <ul style="font-size: 15px; color: #333; line-height: 1.7;">
                <li>📢 <strong>Post notifications</strong> for your department or upcoming events.</li>
                <li>🏆 <strong>Add free certifications links</strong> for your fellow students.</li>
                
                <li>🧠 <strong>Add and manage Concept Maps</strong> to help your batch learn and share resources efficiently.</li>
            </ul>

            <p style="font-size: 15px; color: #333; margin-top: 15px;">
                We’re continuously working on new updates and features to enhance your experience. 
                If you encounter any issues or want to request a specific feature tailored for you, kindly reach out via our contact page below:
            </p>

            <p style="font-size: 15px; text-align: center; margin-top: 15px;">
                💬 <a href="https://saveethahub.tech/contact" target="_blank" style="color: #007bff; text-decoration: none;">Contact Us Here</a>
            </p>

            <h3 style="color: #007bff; margin-top: 25px;">🌐 Connected Platforms</h3>
            <ul style="font-size: 15px; color: #333; line-height: 1.7;">
                <li><a href="https://univault.live/" target="_blank" style="color: #007bff;">Univault Dashboard</a></li>
                <li><a href="https://saveethahub.tech/" target="_blank" style="color: #007bff;">Saveetha Hub</a></li>
            </ul>

            <p style="font-size: 15px; color: #333; margin-top: 20px;">
                Please ensure that all your posts and contributions follow the portal guidelines and represent official or verified updates.
            </p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">

            <p style="font-size: 14px; color: gray; text-align: center;">
                — <strong>Comrade Mohan</strong><br>
                Saveetha Companion Recruitment Coordinator<br>
                <em>Empowering students to lead, learn, and inspire</em>
            </p>
            </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error (Batch Admin Welcome):', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send batch admin welcome email:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
