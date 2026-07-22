export interface R2ImageUploadResponse {
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

export interface R2DocumentUploadResponse {
  key: string;
  url: string;
  bucket: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface R2StatusResponse {
  success: boolean;
  isR2Configured: boolean;
  bucketName: string;
  publicCdnUrl: string;
  accountId: string;
  mode: string;
  objectsSummary?: {
    totalObjectsInPage: number;
    objects: Array<{
      key: string;
      size: number;
      lastModified: string;
      url: string;
    }>;
  };
}

/**
 * Upload Image to Cloudflare R2 object storage via secure backend API
 * Automatically compresses, generates WebP & 5 optimized variants.
 */
export async function uploadImageToCloudflareR2(
  fileOrDataUrl: File | string,
  category = 'products',
  onProgress?: (progressPct: number) => void
): Promise<R2ImageUploadResponse> {
  if (onProgress) onProgress(10);

  if (typeof fileOrDataUrl === 'string') {
    // Base64 dataUrl upload
    if (onProgress) onProgress(30);
    const response = await fetch('/api/r2/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl: fileOrDataUrl,
        category,
        filename: `product_${Date.now()}.png`
      })
    });

    if (onProgress) onProgress(90);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.details || 'Failed to upload image to Cloudflare R2');
    }

    const json = await response.json();
    if (onProgress) onProgress(100);
    return json.data;
  } else {
    // Multipart File Upload with XHR progress support
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', fileOrDataUrl);
      formData.append('category', category);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.data);
          } catch (err) {
            reject(new Error('Invalid response from Cloudflare R2 service'));
          }
        } else {
          try {
            const errJson = JSON.parse(xhr.responseText);
            reject(new Error(errJson.error || errJson.details || 'R2 Upload Failed'));
          } catch {
            reject(new Error(`Server error (${xhr.status}) uploading to Cloudflare R2`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error uploading to Cloudflare R2'));
      });

      xhr.open('POST', '/api/r2/upload-image');
      xhr.send(formData);
    });
  }
}

/**
 * Upload Video, PDF Catalogue, or Document to Cloudflare R2
 */
export async function uploadDocumentToCloudflareR2(
  fileOrDataUrl: File | string,
  category = 'documents',
  onProgress?: (progressPct: number) => void
): Promise<R2DocumentUploadResponse> {
  if (typeof fileOrDataUrl === 'string') {
    const response = await fetch('/api/r2/upload-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dataUrl: fileOrDataUrl,
        category,
        filename: `document_${Date.now()}.pdf`
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to upload document to Cloudflare R2');
    }

    const json = await response.json();
    return json.data;
  } else {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', fileOrDataUrl);
      formData.append('category', category);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result.data);
          } catch {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          reject(new Error('Failed to upload document to Cloudflare R2'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error uploading document to R2'));
      });

      xhr.open('POST', '/api/r2/upload-document');
      xhr.send(formData);
    });
  }
}

/**
 * Delete File & Variants from Cloudflare R2
 */
export async function deleteFromCloudflareR2(urlOrKey: string): Promise<boolean> {
  if (!urlOrKey) return false;

  try {
    const res = await fetch('/api/r2/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: urlOrKey, url: urlOrKey })
    });

    return res.ok;
  } catch (err) {
    console.error('Error deleting from Cloudflare R2:', err);
    return false;
  }
}

/**
 * Fetch Cloudflare R2 connection status and stats
 */
export async function fetchR2Status(): Promise<R2StatusResponse> {
  const res = await fetch('/api/r2/status');
  if (!res.ok) {
    throw new Error('Failed to fetch Cloudflare R2 status');
  }
  return res.json();
}
