# Infrastructure Reference — photo-indexing Lambda

This file is the source of truth for everything that exists in AWS for this
function. Nothing here applies itself — it's what you read to recreate or
verify the setup by hand in the console. Update it whenever you change a
setting, not after the fact.

## Overview

One Lambda function (`indexPhoto`) triggered by SQS, which is fed by S3
upload-complete events. Downloads a photo, generates a preview (→ R2) and a
resized indexing copy, calls Rekognition `IndexFaces`, writes results to
Postgres (Neon) via Prisma.

Region: **ap-south-1 (Mumbai)** for everything — Lambda, S3, SQS, and
Rekognition all in the same region. Kept deliberately unified rather than
calling Rekognition in a higher-quota region elsewhere, for three reasons:
biometric data residency (face data stays in-region), lower latency on the
live attendee search path, and no cross-region data transfer cost. If
Rekognition's default throughput isn't enough, request a quota increase in
this same region (Service Quotas console → Rekognition) rather than moving
regions.

## Resources

### S3 bucket
- Name: `yourapp-photos-prod`
- Not managed by this doc (created earlier, shared with the backend) —
  referenced here only for the IAM/queue policies below.

### SQS — `photo-indexing-queue`
- Type: Standard
- Visibility timeout: `180` seconds (6× the Lambda timeout, per AWS's
  recommendation for SQS-Lambda integrations)
- Receive message wait time: `20` seconds (long polling)
- Redrive policy: → `photo-indexing-dlq` after `3` failed receives

### SQS — `photo-indexing-dlq`
- Type: Standard
- Message retention: `7 days`

### Lambda — `indexPhoto`
- Runtime: Node.js 20.x
- Architecture: x86_64
- Memory: `512 MB`
- Timeout: `30 seconds`
- Reserved concurrency: `5` (match this to your actual Rekognition TPS
  quota — check Service Quotas console, update both places if it changes)
- Execution role: `photo-indexing-lambda-role`

### Trigger
- Source: SQS `photo-indexing-queue`
- Batch size: `1`
- Report batch item failures: **enabled** (required for the handler's
  `{ batchItemFailures }` return value to work correctly)

## IAM

### Execution role: `photo-indexing-lambda-role`
Trusted entity: Lambda service. Inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::yourapp-photos-prod/originals/*"
    },
    {
      "Effect": "Allow",
      "Action": ["rekognition:IndexFaces"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "sqs:ReceiveMessage",
        "sqs:DeleteMessage",
        "sqs:GetQueueAttributes"
      ],
      "Resource": "arn:aws:sqs:ap-south-1:YOUR_ACCOUNT_ID:photo-indexing-queue"
    },
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

### SQS queue access policy (on `photo-indexing-queue`)
Allows the S3 bucket to publish upload events into the queue — this is the
exact fix for the "unable to validate destination configuration" error from
earlier setup:

```json
{
  "Version": "2012-10-17",
  "Id": "S3PublishPolicy",
  "Statement": [
    {
      "Sid": "AllowS3ToSendMessages",
      "Effect": "Allow",
      "Principal": { "Service": "s3.amazonaws.com" },
      "Action": "SQS:SendMessage",
      "Resource": "arn:aws:sqs:ap-south-1:YOUR_ACCOUNT_ID:photo-indexing-queue",
      "Condition": {
        "ArnLike": { "aws:SourceArn": "arn:aws:s3:::yourapp-photos-prod" }
      }
    }
  ]
}
```

## Environment variables (names only — real values go in Lambda console → Configuration → Environment variables, never in this file or in git)

| Name | What it is | Where to get a fresh value |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | Neon dashboard → project → Connection Details → "Pooled connection" |
| `R2_ENDPOINT` | Cloudflare R2 account endpoint | Cloudflare dashboard → R2 → Overview |
| `R2_ACCESS_KEY_ID` | R2 API token key | Cloudflare dashboard → R2 → Manage API Tokens |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret | Same as above (shown once at creation) |
| `R2_BUCKET` | R2 bucket name for previews | Cloudflare dashboard → R2 |
| `REKOGNITION_REGION` | Optional — only set if intentionally different from the Lambda's own region | N/A, leave unset by default |

`AWS_REGION` is not listed — Lambda sets it automatically, don't add it manually.

## Deployment checklist (every time you update code)

Run the all-in-one deploy script from the project root:

```powershell
.\deploy.ps1
```

This script:
1. `npm install` — installs deps and regenerates the Prisma client into
   `node_modules/@prisma/client` via the `postinstall` hook (no manual
   `prisma generate` needed)
2. Installs the Linux-compatible Sharp binary for the Lambda runtime
3. Prunes `devDependencies`
4. Removes Prisma CLI-only packages that are pulled in as `peerOptional`
   deps but are useless at Lambda runtime (~150 MB of savings):
   `studio-core`, `engines`, `dev`, `effect`, `@electric-sql`, `@img`,
   `elkjs`, `react-dom`, and WASM runtimes for non-postgresql databases
5. Checks the uncompressed size is under the 250 MB Lambda limit
6. Creates `lambda.zip` ready to upload

Then:
- Lambda console → `indexPhoto` → Code tab → Upload from → .zip file
- If the zip exceeds 50 MB: upload to any S3 bucket first, then in the
  console choose "Upload from → Amazon S3 location" and paste the S3 URI

> **Note:** `generated/` no longer exists — the Prisma client now lives in
> `node_modules/@prisma/client` (standard location). Do not include a
> `generated/` path in the zip.


## Testing after a fresh setup or redeploy

1. **Confirm the DB tables exist** — run the schema against Neon if not done yet
   (via Neon's SQL editor, or `npx prisma db push` from this project)
2. **Create a test Rekognition collection** (console: Rekognition → Collections
   → Create collection → id `test-event-123`, region ap-south-1)
3. **Insert a matching test row** in the `photos` table — `id` must exactly
   match the filename you'll upload in step 4:
   ```sql
   insert into photos (id, event_id, s3_key_original, status)
   values ('11111111-1111-1111-1111-111111111111', 'test-event-123',
           'originals/test-event-123/11111111-1111-1111-1111-111111111111.jpg', 'pending');
   ```
4. **Upload a real test photo** (with a visible face) to S3 at exactly that key
5. **Watch it flow through**:
   - SQS console → `photo-indexing-queue` → "Messages available" briefly
     shows `1`, then drops to `0`
   - Lambda console → `indexPhoto` → Monitor → View CloudWatch logs → open
     the latest stream → confirm the structured JSON log lines appear
     ("Processing photo", "Indexing complete" with a face count)
   - Neon → table editor (or `npx prisma studio` locally) → `photos` row
     should now show `status = 'indexed'`, and a `faces` row should exist
     with a `rekognitionFaceId`
   - R2 dashboard → bucket → `previews/test-event-123/` → the resized
     preview file should be there
6. **Test the failure path deliberately** — upload a non-image file (e.g. a
   `.txt` renamed to `.jpg`) to a new test key, confirm: it fails, retries
   twice more, then lands in `photo-indexing-dlq`, and the corresponding
   `photos` row shows `status = 'failed'` with an `errorMessage`
7. **Clean up test data** afterward — delete the test collection, test rows,
   and test files so they don't linger in a "real" environment

## Change log

- 2026-08-02: Initial setup. Manual console deployment (no Serverless
  Framework). Prisma + Neon serverless driver adapter for DB access.
  Region unified at ap-south-1 across all services.
- 2026-08-04: Preview images switched from JPEG to WebP (imageService.js,
  r2Service.js, indexPhoto.js) - smaller files for the attendee-facing
  gallery. The indexing copy fed to Rekognition stays JPEG - Rekognition
  only accepts JPEG/PNG, WebP is not a supported input format there.
- 2026-08-05: Migrated to Prisma 7. Connection config moved out of
  schema.prisma into prisma.config.ts (CLI-only, not used at runtime).
  Generated client now lives in generated/prisma/ (custom output path)
  instead of node_modules/@prisma/client - dbService.js import path
  updated accordingly, and generated/ must now be included in the deploy
  zip. No functional change to what the code does, only how it's wired up.
