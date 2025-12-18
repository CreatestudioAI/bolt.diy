import { toast } from 'react-toastify';

const DRIVE_SPACE_ENDPOINT = '/api/drive-space';
const DRIVE_UPLOAD_ENDPOINT = '/api/drive-upload';
const DRIVE_FILE_ENDPOINT = '/api/drive-file';
const DRIVE_FILE_CONTENT_BASE = 'https://drive.createstudio.app/api/v1/drive-custom';

export interface DriveManifestEntry {
  id: string;
  description?: string;
  timestamp: string;
  model?: string;
  provider?: string;
  tokenUsage?: number;
  zipId: string;
  zipName: string;
  fileCount: number;
}

const DEFAULT_FILE_PREFIX = '';
const DUPLICATE_FILE_PREFIX = 'code_'; // backward compatibility for previously double-prefixed files
const LEGACY_FILE_PREFIX = 'bolt_';
const FILE_PREFIX_FALLBACKS = [DEFAULT_FILE_PREFIX, DUPLICATE_FILE_PREFIX, LEGACY_FILE_PREFIX];
const manifestFileName = (email: string, prefix = DEFAULT_FILE_PREFIX) => `${prefix}code_${email}.json`;
const chatFileName = (email: string, prefix = DEFAULT_FILE_PREFIX) => `${prefix}chat_${email}.json`;

export async function checkDriveSpace(email: string): Promise<boolean> {
  const res = await fetch(DRIVE_SPACE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, request_type: 'get_space' }),
  });

  if (!res.ok) {
    return false;
  }

  const data: any = await res.json();

  return Boolean(data?.has_storage_left ?? data?.status);
}

async function readDriveFileResponse(res: Response) {
  if (!res.ok) {
    return null;
  }

  const contentType = res.headers.get('Content-Type') || '';

  if (contentType.includes('application/json')) {
    const data: any = await res.json();

    // API may return a fileEntry without content. Fetch actual content via drive-custom/{id}.
    if (data?.fileEntry?.id) {
      try {
        const download = await fetch(`${DRIVE_FILE_CONTENT_BASE}/${data.fileEntry.id}`);

        if (download.ok) {
          const text = await download.text();

          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        }
      } catch {
        // ignore and fallback
      }
    }

    if (data?.fileContent && typeof data.fileContent === 'string') {
      try {
        return JSON.parse(data.fileContent);
      } catch {
        return data.fileContent;
      }
    }

    if (Array.isArray(data)) {
      return data;
    }

    return data;
  }

  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchDriveManifest(email: string): Promise<DriveManifestEntry[]> {
  for (const prefix of FILE_PREFIX_FALLBACKS) {
    const res = await fetch(DRIVE_FILE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        request_type: 'get_file',
        file_name: manifestFileName(email, prefix),
      }),
    });

    const data = await readDriveFileResponse(res);

    if (Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

export async function uploadToDrive(options: {
  email: string;
  file: Blob;
  filename: string;
  fileNameOverride?: string;
  contentType?: string;
}): Promise<{ id?: string; url?: string }> {
  const formData = new FormData();
  formData.append('email', options.email);
  formData.append('file', options.file, options.filename);
  formData.append('file_name', options.fileNameOverride || options.filename);

  const res = await fetch(DRIVE_UPLOAD_ENDPOINT, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Drive upload failed: ${await res.text()}`);
  }

  const data: any = await res.json();
  const id = data?.fileEntry?.id || data?.id;

  return { id, url: id ? `https://drive.createstudio.app/api/v1/drive-custom/${id}` : undefined };
}

export async function persistManifest(email: string, entries: DriveManifestEntry[]) {
  const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
  await uploadToDrive({
    email,
    file: blob,
    filename: manifestFileName(email),
    fileNameOverride: manifestFileName(email),
  });
}

export async function fetchDriveChats<T = any>(email: string): Promise<T[]> {
  for (const prefix of FILE_PREFIX_FALLBACKS) {
    const res = await fetch(DRIVE_FILE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        request_type: 'get_file',
        file_name: chatFileName(email, prefix),
      }),
    });

    const data = await readDriveFileResponse(res);

    if (Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

export async function persistDriveChats(email: string, chats: any[]) {
  const blob = new Blob([JSON.stringify(chats, null, 2)], { type: 'application/json' });
  await uploadToDrive({
    email,
    file: blob,
    filename: chatFileName(email),
    fileNameOverride: chatFileName(email),
  });
}

export async function ensureDriveSpaceOrToast(email: string) {
  const hasSpace = await checkDriveSpace(email);

  if (!hasSpace) {
    toast.error('Storage is full. Please upgrade to continue.');
    return false;
  }

  return true;
}
