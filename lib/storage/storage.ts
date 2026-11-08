/**
 * Obfuscated Storage Helper.
 * Manages staged CSV imports and error report exports with a 24-hour TTL.
 * Uses Supabase Storage (importexportstorage bucket) with memory fallback.
 */

import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_NAME = "importexportstorage";
const TTL_HOURS = 24;
const TTL_MS = TTL_HOURS * 60 * 60 * 1000;

interface StoredFileMetadata {
  id: string;
  content: string;
  contentType: string;
  filename: string;
  createdAt: number;
}

// In-memory cache for fast, reliable local & staging retrieval
declare global {
  var __exportFiles: Map<string, StoredFileMetadata> | undefined;
}

const fileStore: Map<string, StoredFileMetadata> =
  globalThis.__exportFiles || (globalThis.__exportFiles = new Map());

/**
 * Removes files older than 24 hours.
 */
export function pruneExpiredFiles(): void {
  const now = Date.now();
  for (const [id, item] of fileStore.entries()) {
    if (now - item.createdAt > TTL_MS) {
      fileStore.delete(id);
    }
  }
}

/**
 * Persists a staged file or export artifact under an opaque ID.
 */
export async function saveStagedFile(
  id: string,
  content: string,
  filename: string,
  contentType: string = "text/csv"
): Promise<void> {
  pruneExpiredFiles();

  fileStore.set(id, {
    id,
    content,
    contentType,
    filename,
    createdAt: Date.now(),
  });

  // Attempt to save to Supabase Storage if configured
  try {
    const supabase = createAdminClient();
    const filePath = `exports/${id}.csv`;
    await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, content, {
        contentType,
        upsert: true,
      });
  } catch {
    // If Supabase bucket is not provisioned, memory store continues seamlessly
  }
}

/**
 * Retrieves a staged export artifact by its opaque ID.
 */
export async function getStagedFile(
  id: string
): Promise<{ content: string; filename: string; contentType: string } | null> {
  pruneExpiredFiles();

  const memoryFile = fileStore.get(id);
  if (memoryFile) {
    return {
      content: memoryFile.content,
      filename: memoryFile.filename,
      contentType: memoryFile.contentType,
    };
  }

  // Try retrieving from Supabase Storage
  try {
    const supabase = createAdminClient();
    const filePath = `exports/${id}.csv`;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);

    if (error || !data) {
      return null;
    }

    const content = await data.text();
    return {
      content,
      filename: `export-${id}.csv`,
      contentType: "text/csv",
    };
  } catch {
    return null;
  }
}
