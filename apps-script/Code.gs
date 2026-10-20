/**
 * Google Apps Script — paste this into script.google.com
 *
 * 1. Set RECIPIENT_EMAIL to the address that should receive enquiries.
 * 2. Set CAPTCHA_ENABLED to true and RECAPTCHA_SECRET when captcha is on.
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL into config.js → scriptURL
 *
 * Emails are sent FROM your Gmail (the account that owns this script)
 * with subject "enquiry".
 */

const RECIPIENT_EMAIL = "destination@example.com";
const CAPTCHA_ENABLED = false;
const RECAPTCHA_SECRET = "YOUR_RECAPTCHA_SECRET_KEY";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Honeypot — bots fill this; humans leave it empty
    if (data.honey) {
      return json_({ ok: true });
    }

    if (CAPTCHA_ENABLED) {
      const captchaToken = String(data.captchaToken || "").trim();
      if (!verifyCaptcha_(captchaToken)) {
        return json_({ ok: false, error: "Captcha verification failed." });
      }
    }

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || "").trim();
    const message = String(data.message || "").trim();

    if (!name || !email || !message) {
      return json_({ ok: false, error: "Missing required fields." });
    }

    const body = [
      "New enquiry from the Grace website",
      "",
      "Name: " + name,
      "Email: " + email,
      "Phone: " + (phone || "(not provided)"),
      "",
      "Message:",
      message,
    ].join("\n");

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: "enquiry",
      body: body,
      replyTo: email,
    });

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: "Grace enquiry endpoint is live." });
}

function verifyCaptcha_(token) {
  if (!token || RECAPTCHA_SECRET.indexOf("YOUR_RECAPTCHA") === 0) {
    return false;
  }

  const response = UrlFetchApp.fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "post",
      payload: {
        secret: RECAPTCHA_SECRET,
        response: token,
      },
      muteHttpExceptions: true,
    }
  );

  const result = JSON.parse(response.getContentText());
  return !!(result && result.success);
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
