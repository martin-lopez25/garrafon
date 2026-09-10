<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a4bca954-13b5-481c-8e78-56b7c5aae1ad

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Google Sheets synchronization

The app always saves locally and can optionally synchronize people, settings, and assignment history to a private Google Sheet.

1. Create a Google Sheet and open **Extensions > Apps Script**.
2. Paste the contents of `google-apps-script/Code.gs` into the Apps Script editor.
3. Select **Deploy > New deployment > Web app**. Execute as yourself and allow access to anyone with the deployment URL.
4. Copy `.env.example` to `.env.local` and set `VITE_GOOGLE_SHEETS_WEB_APP_URL` to the deployed `/exec` URL.
5. Restart Vite.

On first load, an empty sheet is populated from local data. Later loads read the shared snapshot before saving changes automatically. Anyone with the deployment URL can read or replace this data, so keep the URL private.
