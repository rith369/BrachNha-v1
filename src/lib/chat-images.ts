/**
 * Full-size photos a student sent KruAI, for THIS PAGE LOAD ONLY.
 *
 * A message's persisted `image.thumb` (see ChatMsg in types/index.ts) is ~320px
 * — enough to recognise which exercise was asked about, not enough for the
 * model to read it. The copy the model reads is ~1400px and ~300KB, and
 * localStorage (~5MB, shared with everything else in the store) cannot hold
 * many of those. So the full copy lives here and is gone on reload.
 *
 * It is kept at all, rather than sent once and dropped, because the follow-up
 * is the normal case: "explain step 3" or "what about question b" means nothing
 * without the photo. chat-overlay.tsx re-sends the newest few with the history.
 *
 * MODULE scope, not component state: AppShell unmounts ChatOverlay on close,
 * and a student who closes the chat to check the textbook and reopens it to ask
 * a follow-up should not find the photo forgotten.
 */

export interface ChatImage {
  /** Bare base64, no `data:` prefix — what the request body carries. */
  data: string;
  mimeType: string;
}

/**
 * How many full-size photos to hold. Each is ~300–450KB of base64 string, and
 * only the newest two are ever re-sent (MAX_IMAGES_PER_REQUEST in the handler),
 * so a few more than that is plenty and the page's memory stays bounded however
 * long the tab lives.
 */
const MAX_HELD = 6;

const held = new Map<string, ChatImage>();

export function rememberImage(msgId: string, image: ChatImage): void {
  held.delete(msgId);
  held.set(msgId, image);
  // A Map iterates in insertion order, so the first key is the oldest photo.
  while (held.size > MAX_HELD) {
    const oldest = held.keys().next();
    if (oldest.done) break;
    held.delete(oldest.value);
  }
}

export function imageFor(msgId: string | undefined): ChatImage | undefined {
  return msgId ? held.get(msgId) : undefined;
}
