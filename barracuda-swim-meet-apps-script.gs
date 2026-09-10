/**
 * Barracuda Swim Meet Signup — Google Apps Script backend.
 *
 * Deploy: Google Sheet -> Extensions -> Apps Script -> paste this file ->
 * Deploy -> New deployment -> Web app -> Execute as "Me" -> Access "Anyone".
 * Copy the resulting /exec URL into APPS_SCRIPT_URL in index.html.
 */

var SHEET_ID = "1HW7NUahhl4eRlthmR6BSP-U35GHq5VcpF1aO74Timck";
var TIME_ZONE = "America/Chicago";

var HEADERS = [
  "Attending",
  "Parent Name",
  "Email",
  "Phone",
  "# Swimmers",
  "Swimmer Names",
  "# Spectators (est.)",
  "Registration Fee Due",
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
      data.attending || "",
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

  var attending = data.attending === "Yes";
  var subject = attending
    ? "You're registered! Joint-Franchise Barracuda Meet — Oct 17, 2026"
    : "Response received — Joint-Franchise Barracuda Meet, Oct 17, 2026";

  var body;
  if (attending) {
    body =
      "Hi " + (data.parentFirstName || "there") + ",\n\n" +
      "We've got your signup for the Joint-Franchise Barracuda Swim Meet!\n\n" +
      "Saturday, October 17, 2026 at 6:30 PM\n" +
      "Denton Natatorium\n\n" +
      "Swimmers: " + (data.swimmerCount || 0) + (swimmerNames ? " (" + swimmerNames + ")" : "") + "\n" +
      "Spectators (estimate): " + (data.spectatorCount || 0) + "\n" +
      "Swimmer registration due: $" + (data.totalCost || 0) + "\n\n" +
      "The $15/swimmer registration fee will be charged to your family account 14 days " +
      "before the meet, once the final team roster is set. The $5/person spectator fee " +
      "is paid on-site at the door — the spectator count above is just an estimate. " +
      "Families are responsible for their own transportation to and from the meet.\n\n" +
      "We'll share full details — including start times and event assignments — as " +
      "they're finalized closer to the meet.\n\n" +
      "Questions? Call us at 817-973-5455 or email goswimarlsgpra@britishswimschool.com\n\n" +
      "— British Swim School | Barracudas";
  } else {
    body =
      "Hi " + (data.parentFirstName || "there") + ",\n\n" +
      "Thanks for letting us know — we've noted that your swimmer will not be attending " +
      "the Joint-Franchise Barracuda Swim Meet on Saturday, October 17, 2026 at the Denton " +
      "Natatorium. No fees are due.\n\n" +
      "We'd love to see your swimmer at a future meet!\n\n" +
      "Questions? Call us at 817-973-5455 or email goswimarlsgpra@britishswimschool.com\n\n" +
      "— British Swim School | Barracudas";
  }

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    body: body,
  });
}
