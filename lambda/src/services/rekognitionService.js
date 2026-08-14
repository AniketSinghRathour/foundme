import { RekognitionClient, IndexFacesCommand, CreateCollectionCommand } from "@aws-sdk/client-rekognition";
import { config } from "../config.js";

const client = new RekognitionClient({ region: config.rekognitionRegion });

// Failures worth distinguishing from generic/transient errors: a genuinely
// malformed or oversized image should still go to the DLQ (retrying won't
// fix it), but it's useful to know that's *why* at a glance in logs.
const PERMANENT_FAILURE_CODES = new Set([
  "InvalidImageFormatException",
  "ImageTooLargeException",
  "InvalidParameterException",
]);

export class RekognitionPermanentError extends Error {
  constructor(originalError) {
    super(`Permanent Rekognition failure: ${originalError.name} - ${originalError.message}`);
    this.name = "RekognitionPermanentError";
    this.cause = originalError;
  }
}

// Returns an empty array (not an error) when zero faces are detected -
// that's a normal, expected outcome for scenery/decor/food photos.
export async function indexFaces(collectionId, imageBuffer) {
  try {
    const result = await client.send(
      new IndexFacesCommand({
        CollectionId: collectionId,
        Image: { Bytes: imageBuffer },
        QualityFilter: "AUTO",
      })
    );
    return result.FaceRecords || [];
  } catch (err) {
    if (err.name === "ResourceNotFoundException") {
      // The collection doesn't exist yet! Auto-create it on the fly.
      console.log(`Collection ${collectionId} not found, creating it automatically...`);
      await client.send(new CreateCollectionCommand({ CollectionId: collectionId }));
      
      // Retry indexing now that the collection exists
      const retryResult = await client.send(
        new IndexFacesCommand({
          CollectionId: collectionId,
          Image: { Bytes: imageBuffer },
          QualityFilter: "AUTO",
        })
      );
      return retryResult.FaceRecords || [];
    }

    if (PERMANENT_FAILURE_CODES.has(err.name)) {
      throw new RekognitionPermanentError(err);
    }
    throw err; // transient (throttling, network) - let the caller retry via SQS
  }
}
