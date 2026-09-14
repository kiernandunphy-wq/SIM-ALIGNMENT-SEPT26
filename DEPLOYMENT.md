# Deployment Notes

## Local Development

Create a local `.env` file from `.env.example` and set `GEMINI_API_KEY`.

```powershell
Copy-Item .env.example .env
```

Then edit `.env` and replace `your_server_side_gemini_api_key`.

Run the backend and frontend together:

```powershell
npm run dev:full
```

The Vite dev server proxies `/api` to `http://127.0.0.1:8787`.

You can also run the backend and frontend separately:

```powershell
npm run api
npm run dev
```

## Supported Upload Parsing

- PDF files are sent to Gemini as inline documents.
- DOCX files are converted to text on the backend before calling Gemini.
- TXT files are converted to text on the backend before calling Gemini.
- Legacy `.doc` files are not supported; save them as DOCX, PDF, or TXT first.

## Production Build

```powershell
npm run build
npm run start
```

The backend serves the built `dist` assets and the `/api/parse-syllabus` endpoint.

## Required Environment Variables

- `GEMINI_API_KEY`: server-side Gemini key. Required.
- `GEMINI_MODEL`: defaults to `gemini-2.5-flash`.
- `PORT`: defaults to `8787`.
- `MAX_PASTED_TEXT_CHARS`: defaults to `200000`.
- `MAX_SYLLABUS_FILE_BYTES`: defaults to `8388608`.
- `RATE_LIMIT_WINDOW_MS`: defaults to `60000`.
- `RATE_LIMIT_MAX_REQUESTS`: defaults to `20`.
- `REQUEST_LOGGING_ENABLED`: defaults to `true`; set to `false` to disable metadata logs.

## Google AI Studio / Cloud Deployment Guidance

- Store `GEMINI_API_KEY` as a server-side secret, not in client code.
- Restrict the Gemini API key to Gemini API only.
- Use separate dev and production keys.
- Deploy as a full-stack app so `/api/parse-syllabus` runs server-side.
- Confirm built frontend assets do not contain `GEMINI_API_KEY` or `VITE_GEMINI_API_KEY`.
- Keep rate limits enabled.
- Review logs to confirm they contain metadata only, not syllabus contents.

## Product Boundary

Gemini parses syllabi into structured JSON. The deterministic TypeScript rule engine assigns simulation recommendations. Do not replace the rule engine with model-generated recommendations without a separate review.

Visible product disclaimer: faculty decision-support, not automatic curriculum approval.

## Cloud Run Deployment

Cloud Run containers must listen on `0.0.0.0` and the port provided by the `PORT` environment variable. The included `Dockerfile` builds the Vite frontend and runs the Node backend, which serves both `dist/` and `/api/parse-syllabus`.

### One-Time Google Cloud Setup

Install and sign in to the Google Cloud CLI:

```powershell
gcloud auth login
gcloud auth application-default login
```

Set your project and region:

```powershell
gcloud config set project YOUR_PROJECT_ID
gcloud config set run/region us-central1
```

Enable required services:

```powershell
gcloud services enable run.googleapis.com cloudbuild.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com
```

Create the Gemini API key secret:

```powershell
echo YOUR_REAL_GEMINI_API_KEY | gcloud secrets create gemini-api-key --data-file=-
```

Grant Cloud Run access to the secret. Replace `PROJECT_NUMBER` with your project number:

```powershell
gcloud secrets add-iam-policy-binding gemini-api-key --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

You can find the project number with:

```powershell
gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)"
```

### Deploy From Local Source

From the repository root:

```powershell
gcloud run deploy syllabus-sim-alignment --source . --allow-unauthenticated --set-secrets GEMINI_API_KEY=gemini-api-key:latest --set-env-vars GEMINI_MODEL=gemini-2.5-flash,MAX_PASTED_TEXT_CHARS=200000,MAX_SYLLABUS_FILE_BYTES=8388608,RATE_LIMIT_WINDOW_MS=60000,RATE_LIMIT_MAX_REQUESTS=20,REQUEST_LOGGING_ENABLED=true
```

After deployment, Cloud Run prints a service URL. Open it and test with a small pasted syllabus first.

### Update An Existing Secret

If the key changes:

```powershell
echo NEW_REAL_GEMINI_API_KEY | gcloud secrets versions add gemini-api-key --data-file=-
```

Redeploy or wait for new instances to use the latest secret version.
