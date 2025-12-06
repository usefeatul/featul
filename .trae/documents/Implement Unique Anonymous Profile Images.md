I will implement the unique profile image generation system by leveraging the existing browser fingerprinting and IP address data.

1. **Update Database Schema Definition**

   * **File**: `packages/db/schema/comment.ts`

   * **Action**: Update the `metadata` column type definition to include an optional `fingerprint` field. This ensures type safety when storing the fingerprint.

2. **Enhance Comment Creation (Backend)**

   * **File**: `packages/api/src/router/comment.ts`

   * **Action**: Modify the `create` mutation to:

     * Capture the user's IP address and User Agent from the request headers *before* inserting the comment.

     * Store the `ipAddress` and `userAgent` in the respective columns of the `comment` table (currently they are null).

     * Store the client-provided `fingerprint` in the `metadata` JSON column.

3. **Implement Unique Avatar Logic (Backend)**

   * **File**: `packages/api/src/router/comment.ts`

   * **Action**: Modify the `list` query to:

     * Retrieve the `ipAddress` and `metadata` for comments.

     * Update the `formattedComments` logic to determine a unique seed for anonymous users:

       1. Use the `fingerprint` from metadata if available (already a hash).
       2. Fallback to a **hashed** version of the `ipAddress` (using SHA-256) if fingerprint is missing.
       3. Fallback to "anonymous" if neither is available.

     * Pass this unique seed to the DiceBear avatar URL generator (`toAvatar` function).

   * **Privacy Note**: The raw IP address will be hashed server-side before being used in the avatar URL to prevent exposing user IPs.

4. **Verification**

   * I will verify the changes by reviewing the code to ensure the fingerprint is correctly stored and the avatar URL is generated using the deterministic seed.

