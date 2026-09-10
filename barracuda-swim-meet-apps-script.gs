/**
 * Barracuda Swim Meet Signup — Google Apps Script backend.
 *
 * Deploy: Google Sheet -> Extensions -> Apps Script -> paste this file ->
 * Deploy -> New deployment -> Web app -> Execute as "Me" -> Access "Anyone".
 * Copy the resulting /exec URL into APPS_SCRIPT_URL in
 * barracuda-swim-meet-signup.html.
 */

var SHEET_ID = "1HW7NUahhl4eRlthmR6BSP-U35GHq5VcpF1aO74Timck";

var HEADERS = [
  "Parent Name",
  "Email",
  "Phone",
  "# Swimmers",
  "Swimmer Names",
  "# Spectators",
  "Total Cost",
  "Submitted At",
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

    sheet.appendRow([
      ((data.parentFirstName || "") + " " + (data.parentLastName || "")).trim(),
      data.email || "",
      data.phone || "",
      data.swimmerCount || 0,
      swimmerNames,
      data.spectatorCount || 0,
      data.totalCost || 0,
      data.submittedAt || new Date().toISOString(),
      data.notes || "",
    ]);

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
