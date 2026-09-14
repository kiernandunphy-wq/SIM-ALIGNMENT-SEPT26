# Security

## Current Security Posture

This app keeps Gemini API access server-side. The browser calls `/api/parse-syllabus`; only the backend reads `GEMINI_API_KEY`.

The app is faculty decision-support only. Simulation recommendations must be reviewed by qualified faculty before curriculum, grading, or program decisions are made.

## Secrets

- Never place a real Gemini API key in frontend code.
- Never use `VITE_GEMINI_API_KEY` or any other browser-exposed environment variable for production.
- Store `GEMINI_API_KEY` only as a server-side environment variable or deployment secret.
- Restrict the key to the Gemini API only.
- Use separate development and production Google Cloud projects/keys.
- Rotate keys immediately if exposure is suspected.

## Uploaded Syllabus Data

Syllabi may contain confidential institutional or student-related information.

- Do not log pasted syllabus text.
- Do not log uploaded file contents.
- Do not log Gemini parsed output unless a formal retention policy exists.
- Prefer short retention windows or no persistence for uploaded documents.
- Encrypt stored documents if persistence is later added.

## Existing Controls

- Server-side Gemini proxy at `/api/parse-syllabus`.
- Server-side API key only.
- `gemini-2.5-flash` model configuration.
- Accepted file type validation for PDF, DOC, DOCX, and TXT.
- File size and pasted text limits.
- Rate limiting for parse requests.
- Schema-style validation of Gemini JSON before the frontend uses it.
- Prompt-injection guard text treating syllabi as untrusted source data.
- Metadata-only request logging.

## Logging Policy

The backend logs operational metadata only:

- request id
- event type
- duration
- text length
- file MIME type
- file size
- response/error category
- module count on successful parse

It must not log syllabus text, uploaded file bytes, raw Gemini output, or parsed syllabus content.

## Reporting Issues

Report suspected security issues privately to the product owner or repository maintainer. Do not share API keys, syllabus contents, or confidential customer data in issue reports.
