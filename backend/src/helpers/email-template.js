/**
 * Unified email template for Science for Africa (SFA)
 * All emails should use this wrapper for consistent branding.
 *
 * @param {object} options
 * @param {string} options.title - Email heading
 * @param {string} options.body - HTML content for the email body
 * @param {string} [options.footer] - Optional custom footer text
 * @returns {string} Full HTML email string
 */
function emailTemplate({ title, body, footer }) {
  const brandColor = "#008080"; // SFA Brand Teal
  const footerText =
    footer ||
    "This is an automated message from the Science for Africa platform.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;color:#313131;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" style="width:100%;max-width:600px;border-collapse:collapse;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:30px 40px;text-align:center;background-color:${brandColor};">
              <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:bold;letter-spacing:-0.01em;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px;">
              <div style="font-size:16px;line-height:1.6;color:#313131;">
                ${body}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;background-color:#fafafa;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;font-weight:500;">&copy; ${new Date().getFullYear()} Science for Africa. All rights reserved.</p>
              <p style="margin:8px 0 0;font-size:11px;color:#b5b5b5;">${footerText}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

module.exports = { emailTemplate };
