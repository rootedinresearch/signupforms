# Barracuda Swim Meet Signup — Deployment

## Files
- `barracuda-swim-meet-signup.html` — self-contained signup form (BSS branded, 4-step, mobile-first)
- `barracuda-swim-meet-apps-script.gs` — Google Apps Script backend that appends signups to the target Google Sheet

## Deploy the backend
1. Open the target sheet: https://docs.google.com/spreadsheets/d/1HW7NUahhl4eRlthmR6BSP-U35GHq5VcpF1aO74Timck/edit
2. Extensions → Apps Script
3. Replace the default `Code.gs` contents with `barracuda-swim-meet-apps-script.gs`
4. Deploy → New deployment → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment `/exec` URL

## Wire up the frontend
1. Open `barracuda-swim-meet-signup.html`
2. Set `APPS_SCRIPT_URL` (near the top of the `<script>` block) to the deployment URL from above
3. Test locally by opening the file in a browser, submitting a test signup, and confirming a row appears in the sheet (the script auto-adds header row on first submission)

## Host it
Upload the HTML file as-is to Vercel/GitHub Pages/static hosting, or share the file directly. No build step required.
