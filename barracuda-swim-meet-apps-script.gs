/**
 * Barracuda Swim Meet Signup — Google Apps Script backend.
 *
 * Deploy: Google Sheet -> Extensions -> Apps Script -> paste this file ->
 * Deploy -> New deployment -> Web app -> Execute as "Me" -> Access "Anyone".
 * Copy the resulting /exec URL into APPS_SCRIPT_URL in
 * barracuda-swim-meet-signup.html.
 */

var SHEET_ID = "1HW7NUahhl4eRlthmR6BSP-U35GHq5VcpF1aO74Timck";
var TIME_ZONE = "America/Chicago";

var HEADERS = [
  "Parent Name",
  "Email",
  "Phone",
  "# Swimmers",
  "Swimmer Names",
  "# Spectators",
  "Total Cost",
  "Submitted At (CST/CDT)",
  "Notes",
];

function doPost(e) {
  try {
    if (!e || !e.postData) {
      throw new Error(
        "No POST data received. This function must be called via the deployed " +
          "web app URL (not run directly from the Apps Script editor)."
      );
    }
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet();

    ensureHeaders(sheet);

    var swimmerNames = (data.swimmers || [])
      .map(function (s) {
        return ((s.firstName || "") + " " + (s.lastName || "")).trim();
      })
      .join("; ");

    var submittedDate = data.submittedAt ? new Date(data.submittedAt) : new Date();
    var submittedAtCst = Utilities.formatDate(
      submittedDate,
      TIME_ZONE,
      "yyyy-MM-dd HH:mm:ss zzz"
    );

    sheet.appendRow([
      ((data.parentFirstName || "") + " " + (data.parentLastName || "")).trim(),
      data.email || "",
      data.phone || "",
      data.swimmerCount || 0,
      swimmerNames,
      data.spectatorCount || 0,
      data.totalCost || 0,
      submittedAtCst,
      data.notes || "",
    ]);

    sendConfirmationEmail(data, swimmerNames);

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("Error: " + error);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("OK");
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
}

function sendConfirmationEmail(data, swimmerNames) {
  if (!data.email) return;

  var parentName = ((data.parentFirstName || "") + " " + (data.parentLastName || "")).trim();
  var subject = "You're registered! Barracuda Swim Meet — Oct 17, 2026";

  var body =
    "Hi " + (data.parentFirstName || "there") + ",\n\n" +
    "We've got your signup for the Barracuda Swim Meet!\n\n" +
    "Saturday, October 17, 2026 at 5:30 PM\n" +
    "Denton Natatorium\n\n" +
    "Swimmers: " + (data.swimmerCount || 0) + (swimmerNames ? " (" + swimmerNames + ")" : "") + "\n" +
    "Spectators: " + (data.spectatorCount || 0) + "\n" +
    "Total: $" + (data.totalCost || 0) + " (added to your family account)\n\n" +
    "We'll share full details — including start times and event assignments — " +
    "as they're finalized closer to the meet.\n\n" +
    "Questions? Call us at 817-973-5455 or email goswimarlsgpra@britishswimschool.com\n\n" +
    "— British Swim School | Barracudas";

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
  });
}
