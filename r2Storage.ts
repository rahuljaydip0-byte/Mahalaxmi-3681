import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import sharp from "sharp";
import path from "path";
import crypto from "crypto";
import fs from "fs";

// Local storage fallback directory when R2 credentials are not set
const LOCAL_R2_FALLBACK_DIR = path.join(process.cwd(), "public", "r2-uploads");
if (!fs.existsSync(LOCAL_R2_FALLBACK_DIR)) {
  fs.mkdirSync(LOCAL_R2_FALLBACK_DIR, { recursive: true });
}

// Check if Cloudflare R2 credentials are present
export function isR2Configured(): boolean {
  const accountId = process.env.R2_ACCOUNT_ID || "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID || "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || "";
  const bucketName = process.env.R2_BUCKET_NAME || "";

  return Boolean(
    accountId &&
    accessKeyId &&
    secretAccessKey &&
    bucketName &&
    !accountId.includes("YOUR_") &&
    !accessKeyId.includes("YOUR_")
  );
}

// Initialize S3 Client for Cloudflare R2
export function getR2Client(): S3Client | null {
  if (!isR2Configured()) {
    return null;
  }

  const accountId = process.env.R2_ACCOUNT_ID!;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

// Get public CDN URL base
export function getR2PublicBaseUrl(): string {
  const customPublicUrl = process.env.R2_PUBLIC_URL || "";
  if (customPublicUrl && !customPublicUrl.includes("YOUR_")) {
    return customPublicUrl.replace(/\/$/, "");
  }
  
  const bucketName = process.env.R2_BUCKET_NAME || "mahalakshmi-creation-storage";
  const accountId = process.env.R2_ACCOUNT_ID || "demo";
  return `https://${bucketName}.${accountId}.r2.cloudflarestorage.com`;
}

export interface ImageVariantUploadResult {
  key: string;
  url: string;
  variants: {
    original: string;
    desktop: string;
    mobile: string;
    thumbnail: string;
    webp: string;
  };
  bucket: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface FileUploadResult {
  key: string;
  url: string;
  bucket: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

/**
 * Optimized Upload Image to Cloudflare R2 with automatic WebP compression & 5 variants:
 * - Original (WebP compressed, quality 85%)
 * - Desktop (max 1920px, quality 85%)
 * - Mobile (max 800px, quality 80%)
 * - Thumbnail (max 300px, quality 80%)
 * - WebP (standard web optimized)
 */
export async function uploadImageToR2(
  fileBuffer: Buffer,
  originalFilename: string,
  category = "products"
): Promise<ImageVariantUploadResult> {
  const r2Client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "mahalakshmi-creation-storage";
  const publicBaseUrl = getR2PublicBaseUrl();
  const now = new Date();
  const fileHash = crypto.randomBytes(8).toString("hex");
  const sanitizeName = path.parse(originalFilename).name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const baseKey = `${category}/${now.getFullYear()}/${now.getMonth() + 1}/${sanitizeName}_${fileHash}`;

  // Process variants using sharp
  const originalWebpBuffer = await sharp(fileBuffer)
    .webp({ quality: 85 })
    .toBuffer();

  const desktopBuffer = await sharp(fileBuffer)
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const mobileBuffer = await sharp(fileBuffer)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const thumbnailBuffer = await sharp(fileBuffer)
    .resize({ width: 300, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const variantKeys = {
    original: `${baseKey}_original.webp`,
    desktop: `${baseKey}_desktop.webp`,
    mobile: `${baseKey}_mobile.webp`,
    thumbnail: `${baseKey}_thumb.webp`,
    webp: `${baseKey}_web.webp`
  };

  const uploadTasks = [
    { key: variantKeys.original, buffer: originalWebpBuffer },
    { key: variantKeys.desktop, buffer: desktopBuffer },
    { key: variantKeys.mobile, buffer: mobileBuffer },
    { key: variantKeys.thumbnail, buffer: thumbnailBuffer },
    { key: variantKeys.webp, buffer: originalWebpBuffer }
  ];

  if (r2Client && isR2Configured()) {
    // Direct Cloudflare R2 S3 Upload
    await Promise.all(
      uploadTasks.map(task =>
        r2Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: task.key,
            Body: task.buffer,
            ContentType: "image/webp",
            CacheControl: "public, max-age=31536000, immutable"
          })
        )
      )
    );

    const mainUrl = `${publicBaseUrl}/${variantKeys.webp}`;
    return {
      key: variantKeys.webp,
      url: mainUrl,
      variants: {
        original: `${publicBaseUrl}/${variantKeys.original}`,
        desktop: `${publicBaseUrl}/${variantKeys.desktop}`,
        mobile: `${publicBaseUrl}/${variantKeys.mobile}`,
        thumbnail: `${publicBaseUrl}/${variantKeys.thumbnail}`,
        webp: mainUrl
      },
      bucket: bucketName,
      contentType: "image/webp",
      sizeBytes: originalWebpBuffer.length,
      uploadedAt: now.toISOString()
    };
  } else {
    // Fallback mode: Save locally in public/r2-uploads for preview environments
    for (const task of uploadTasks) {
      const localFilePath = path.join(LOCAL_R2_FALLBACK_DIR, path.basename(task.key));
      fs.writeFileSync(localFilePath, task.buffer);
    }

    const fallbackBaseUrl = `/r2-uploads`;
    const mainUrl = `${fallbackBaseUrl}/${path.basename(variantKeys.webp)}`;

    return {
      key: variantKeys.webp,
      url: mainUrl,
      variants: {
        original: `${fallbackBaseUrl}/${path.basename(variantKeys.original)}`,
        desktop: `${fallbackBaseUrl}/${path.basename(variantKeys.desktop)}`,
        mobile: `${fallbackBaseUrl}/${path.basename(variantKeys.mobile)}`,
        thumbnail: `${fallbackBaseUrl}/${path.basename(variantKeys.thumbnail)}`,
        webp: mainUrl
      },
      bucket: "local-r2-fallback-bucket",
      contentType: "image/webp",
      sizeBytes: originalWebpBuffer.length,
      uploadedAt: now.toISOString()
    };
  }
}

/**
 * Upload Video, PDF Catalogue, or Document to Cloudflare R2
 */
export async function uploadDocumentOrMediaToR2(
  fileBuffer: Buffer,
  originalFilename: string,
  contentType: string,
  category = "documents"
): Promise<FileUploadResult> {
  const r2Client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "mahalakshmi-creation-storage";
  const publicBaseUrl = getR2PublicBaseUrl();
  const now = new Date();
  const fileHash = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(originalFilename) || ".bin";
  const sanitizeName = path.parse(originalFilename).name.replace(/[^a-zA-Z0-9_-]/g, "_");
  const key = `${category}/${now.getFullYear()}/${now.getMonth() + 1}/${sanitizeName}_${fileHash}${ext}`;

  if (r2Client && isR2Configured()) {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType || "application/octet-stream",
        CacheControl: "public, max-age=31536000, immutable"
      })
    );

    const mainUrl = `${publicBaseUrl}/${key}`;
    return {
      key,
      url: mainUrl,
      bucket: bucketName,
      contentType,
      sizeBytes: fileBuffer.length,
      uploadedAt: now.toISOString()
    };
  } else {
    // Fallback local save
    const localFileName = `${sanitizeName}_${fileHash}${ext}`;
    const localFilePath = path.join(LOCAL_R2_FALLBACK_DIR, localFileName);
    fs.writeFileSync(localFilePath, fileBuffer);

    const mainUrl = `/r2-uploads/${localFileName}`;
    return {
      key: `documents/${localFileName}`,
      url: mainUrl,
      bucket: "local-r2-fallback-bucket",
      contentType,
      sizeBytes: fileBuffer.length,
      uploadedAt: now.toISOString()
    };
  }
}

/**
 * Automatically delete images/variants/documents from Cloudflare R2
 */
export async function deleteFromR2(fileKeyOrUrl: string): Promise<boolean> {
  const r2Client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "mahalakshmi-creation-storage";

  // Extract key from full URL if provided
  let key = fileKeyOrUrl;
  if (key.startsWith("http://") || key.startsWith("https://")) {
    try {
      const parsed = new URL(key);
      key = parsed.pathname.replace(/^\//, "");
    } catch {
      // keep key
    }
  } else if (key.startsWith("/r2-uploads/")) {
    key = key.replace("/r2-uploads/", "");
  }

  if (!key) return false;

  // Determine variant keys if this is an image key
  const keysToDelete: string[] = [key];
  if (key.includes("_web.webp")) {
    const base = key.replace("_web.webp", "");
    keysToDelete.push(
      `${base}_original.webp`,
      `${base}_desktop.webp`,
      `${base}_mobile.webp`,
      `${base}_thumb.webp`
    );
  }

  if (r2Client && isR2Configured()) {
    try {
      await Promise.all(
        keysToDelete.map(k =>
          r2Client.send(
            new DeleteObjectCommand({
              Bucket: bucketName,
              Key: k
            })
          ).catch(() => {})
        )
      );
      return true;
    } catch (e) {
      console.error("R2 Delete Error:", e);
      return false;
    }
  } else {
    // Local fallback delete
    try {
      for (const k of keysToDelete) {
        const localPath = path.join(LOCAL_R2_FALLBACK_DIR, path.basename(k));
        if (fs.existsSync(localPath)) {
          fs.unlinkSync(localPath);
        }
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * List R2 Bucket objects & stats
 */
export async function listR2BucketObjects(limit = 100) {
  const r2Client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME || "mahalakshmi-creation-storage";
  const publicBaseUrl = getR2PublicBaseUrl();

  if (r2Client && isR2Configured()) {
    try {
      const result = await r2Client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          MaxKeys: limit
        })
      );

      const items = (result.Contents || []).map(obj => ({
        key: obj.Key || "",
        size: obj.Size || 0,
        lastModified: obj.LastModified ? obj.LastModified.toISOString() : "",
        url: `${publicBaseUrl}/${obj.Key}`
      }));

      return {
        isR2Active: true,
        bucketName,
        totalObjectsInPage: items.length,
        objects: items
      };
    } catch (e: any) {
      return {
        isR2Active: true,
        error: e.message || String(e),
        objects: []
      };
    }
  } else {
    // Return local fallback list
    const files = fs.existsSync(LOCAL_R2_FALLBACK_DIR) ? fs.readdirSync(LOCAL_R2_FALLBACK_DIR) : [];
    const items = files.map(f => {
      const p = path.join(LOCAL_R2_FALLBACK_DIR, f);
      const stat = fs.statSync(p);
      return {
        key: `local/${f}`,
        size: stat.size,
        lastModified: stat.mtime.toISOString(),
        url: `/r2-uploads/${f}`
      };
    });

    return {
      isR2Active: false,
      message: "Operating in Fallback Mode until R2_ACCOUNT_ID and credentials are populated",
      bucketName: "local-r2-fallback-bucket",
      totalObjectsInPage: items.length,
      objects: items
    };
  }
}
