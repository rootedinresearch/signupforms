# Barracuda Swim Meet Signup — Deployment

## Files
- `index.html` — self-contained RSVP/signup form (BSS branded, 5-step, mobile-first), deployed to Vercel as the site root
- `barracuda-swim-meet-apps-script.gs` — Google Apps Script backend that appends responses to the target Google Sheet and sends confirmation emails

## Deploy the backend
1. Open the target sheet: https://docs.google.com/spreadsheets/d/1HW7NUahhl4eRlthmR6BSP-U35GHq5VcpF1aO74Timck/edit
2. Extensions → Apps Script
3. Replace the default `Code.gs` contents with `barracuda-swim-meet-apps-script.gs`
4. Deploy → New deployment → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the deployment `/exec` URL

## Wire up the frontend
1. Open `index.html`
2. Set `APPS_SCRIPT_URL` (near the top of the `<script>` block) to the deployment URL from above
3. Test locally by opening the file in a browser, submitting a test response for both "Yes" and "No" attending, and confirming a row appears in the sheet and a confirmation email arrives (the script auto-adds the header row on first submission)

## Redeploying after script changes
Editing `barracuda-swim-meet-apps-script.gs` alone doesn't update the live endpoint — after pasting changes into the Apps Script editor, go to **Deploy → Manage deployments → edit the existing deployment → New version**.

## Host it
Connected to Vercel via the `rootedinresearch/signupforms` GitHub repo (`main` branch, Framework Preset: Other, no build step).
