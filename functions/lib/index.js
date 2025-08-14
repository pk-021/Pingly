"use strict";
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAnnouncementEmails = void 0;
const v2_1 = require("firebase-functions/v2");
const functions = require("firebase-functions");
const logger = require("firebase-functions/logger");
// Import necessary modules for the announcement email function
const admin = require("firebase-admin");
const mail_1 = require("@sendgrid/mail");
// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
// Access SendGrid API key from environment
// configuration (TEMPORARY FOR TESTING)
// Using optional chaining in case config isn't set
const sendgridApiKey = (_a = functions.config().sendgrid) === null || _a === void 0 ? void 0 : _a.key;
// Set SendGrid API key
if (sendgridApiKey) {
    mail_1.default.setApiKey(sendgridApiKey);
}
else {
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
(0, v2_1.setGlobalOptions)({ maxInstances: 10 });
// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
// Cloud Function to send announcement emails when a new announcement is
// created
exports.sendAnnouncementEmails = functions.firestore
    .document('announcements/{announcementId}')
    .onCreate(async (snap, context) => {
    const announcement = snap.data();
    // Use optional chaining and default to empty array
    const targetRoles = (announcement === null || announcement === void 0 ? void 0 : announcement.targetRoles) || [];
    const title = (announcement === null || announcement === void 0 ? void 0 : announcement.title) || 'New Announcement';
    const content = (announcement === null || announcement === void 0 ? void 0 : announcement.content) || '';
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
        const emailPromises = [];
        // Fixed type for SendGrid response
        usersSnapshot.forEach((doc) => {
            const user = doc.data();
            const userEmail = user === null || user === void 0 ? void 0 : user.email;
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
                emailPromises.push(mail_1.default.send(msg));
            }
        });
        // Wait for all emails to be sent
        await Promise.all(emailPromises);
        logger.info('Announcement emails sent successfully via SendGrid!');
        return null; // Explicitly return null for success
    }
    catch (error) {
        logger.error('Error sending announcement emails via SendGrid:', error);
        throw error; // Re-throw to indicate function failure
    }
});
//# sourceMappingURL=index.js.map