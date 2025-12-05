import { env } from "cloudflare:workers"
import { createServerFn } from "@tanstack/react-start"
import { AwsClient } from "aws4fetch"

interface GetUploadUrlInput {
	sessionId: string
	filename: string
}

interface GetUploadUrlOutput {
	uploadUrl: string
	expiresIn: number
}

/**
 * Generate a presigned URL for uploading to R2
 */
export const getUploadUrl = createServerFn({ method: "POST" })
	.inputValidator((data: GetUploadUrlInput) => {
		if (!data.sessionId || typeof data.sessionId !== "string") {
			throw new Error("sessionId is required and must be a string")
		}

		if (!data.filename || typeof data.filename !== "string") {
			throw new Error("filename is required and must be a string")
		}

		// Validate filename format (basic sanitation)
		if (!/^[a-zA-Z0-9_\-.]+$/.test(data.filename)) {
			throw new Error("filename contains invalid characters")
		}

		return data
	})
	.handler(async ({ data }): Promise<GetUploadUrlOutput> => {
		try {
			// Get R2 credentials from environment
			const accountId = env.R2_ACCOUNT_ID
			const accessKeyId = env.R2_ACCESS_KEY_ID
			const secretAccessKey = env.R2_SECRET_ACCESS_KEY
			const bucketName = env.R2_BUCKET_NAME

			if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
				throw new Error("R2 credentials are not configured. Set environment variables, then retry!")
			}

			// Initialize aws4fetch client
			const client = new AwsClient({
				accessKeyId,
				secretAccessKey,
				service: "s3",
				region: "auto",
			})

			// Construct R2 URL
			const r2Url = `https://${accountId}.r2.cloudflarestorage.com`
			const objectKey = `sessions/${data.filename}`

			// Set expiration time (2 hours)
			const expiresIn = 3600 * 2

			// Create the request for signing
			const signedRequest = await client.sign(
				new Request(`${r2Url}/${bucketName}/${objectKey}?X-Amz-Expires=${expiresIn}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/zip",
					},
				}),
				{
					aws: { signQuery: true },
				},
			)

			const uploadUrl = signedRequest.url.toString()

			console.log(`[PRESIGNED URL] Generated for ${objectKey} (expires in ${expiresIn}s)`)

			return {
				uploadUrl,
				expiresIn,
			}
		} catch (error) {
			console.error("Error generating presigned URL:", error)
			throw new Error(error instanceof Error ? error.message : "Failed to generate upload URL")
		}
	})
