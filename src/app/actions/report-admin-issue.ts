
'use server';

import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { z } from 'zod';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  title: z.string().min(5, { message: 'Title must be at least 5 characters.' }),
  description: z.string().min(10, { message: 'Please describe the issue in at least 10 characters.' }),
});

export async function reportAdminIssue(prevState: any, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    return {
      type: 'error',
      message: 'Validation failed.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, email, title, description } = validatedFields.data;

  try {
    // 1. Store in the contact-messages collection for viewing in the admin panel
    await addDoc(collection(db, 'contact-messages'), {
      name: name,
      email: email,
      message: `[Admin Issue] ${title}: ${description}`,
      status: 'Unread',
      createdAt: new Date().toISOString(),
    });

    // 2. Send an email notification
    await resend.emails.send({
      from: 'Saveetha Companion Issue Reporter <issues@saveethahub.tech>',
      to: ['k.nobitha666@gmail.com'],
      subject: `New Admin Issue Reported: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Issue Reported from Admin Portal</h2>
          <p>An administrator has reported an issue.</p>
          <h3>Details:</h3>
          <ul>
            <li><strong>Reported By:</strong> ${name} (${email})</li>
            <li><strong>Title:</strong> ${title}</li>
          </ul>
          <h3>Description:</h3>
          <p style="white-space: pre-wrap;">${description}</p>
        </div>
      `,
    });

    return {
      type: 'success',
      message: "Thank you! Your issue report has been sent.",
    };
  } catch (error) {
    console.error('Error reporting issue:', error);
    return {
      type: 'error',
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}
