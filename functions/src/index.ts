
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from 'firebase-functions/v2';
import * as functions from 'firebase-functions';
import * as logger from 'firebase-functions/logger';

// Import necessary modules for the announcement email function
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Access SendGrid API key from environment
// configuration (TEMPORARY FOR TESTING)
// Using optional chaining in case config isn't set
const sendgridApiKey = functions.config().sendgrid?.key;

// Set SendGrid API key
if (sendgridApiKey) {
  sgMail.setApiKey(sendgridApiKey);
} else {
  logger.error('SendGrid API key not configured in environment.');
}

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Cloud Function to send announcement emails when a new announcement is
// created
export const sendAnnouncementEmails = functions.firestore
  .document('announcements/{announcementId}')
  .onCreate(
    async (
      snap: functions.firestore.QueryDocumentSnapshot,
      context: functions.EventContext,
    ) => {
      const announcement = snap.data();
      // Use optional chaining and default to empty array
      const targetRoles: string[] = announcement?.targetRoles || [];
      const title: string = announcement?.title || 'New Announcement';
      const content: string = announcement?.content || '';
      // Replace with your verified sender email in SendGrid
      const senderEmail = 'ioe.pingly@gmail.com';

      // Add a check for the API key
      if (!sendgridApiKey) {
        logger.error('SendGrid API key is missing. Cannot send email.');
        return null; // Exit the function if API key is missing
      }

      try {
        const usersSnapshot = await db
          .collection('users')
          .where('role', 'in', targetRoles)
          .get();

        const emailPromises: Promise<[sgMail.ClientResponse, {}]>[] = [];
        // Fixed type for SendGrid response

        usersSnapshot.forEach((doc) => {
          const user = doc.data();
          const userEmail: string = user?.email;

          if (userEmail) {
            // Ensure user has an email address
            // Compose the email using SendGrid's format
            const msg = {
              to: userEmail,
              from: senderEmail, // Must be a verified sender in SendGrid
              subject: `New Announcement: ${title}`,
              text: content,
              // html: "<p>HTML version of the body</p>" // HTML body (optional)
            };

            // Add the email sending promise
            emailPromises.push(sgMail.send(msg));
          }
        });

        // Wait for all emails to be sent
        await Promise.all(emailPromises);
        logger.info('Announcement emails sent successfully via SendGrid!');
        return null; // Explicitly return null for success
      } catch (error) {
        logger.error('Error sending announcement emails via SendGrid:', error);
        throw error; // Re-throw to indicate function failure
      }
    },
  );
