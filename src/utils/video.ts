/*
 * Videos an editor links from YouTube or Vimeo, read from the address they
 * copied out of the browser. Shared by the Studio's validation and the pages,
 * so a link the Studio accepts is one the site can play.
 */

export interface VideoSource {
  provider: "youtube" | "vimeo";
  id: string;
  /** Vimeo's private hash for an unlisted video. */
  hash?: string;
}

const YOUTUBE_ID = /^[\w-]{11}$/;

/** Which video an address points to, or `undefined` when it is not YouTube or Vimeo. */
export function parseVideo(value: string | undefined): VideoSource | undefined {
  if (!value) return undefined;
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }
  const host = url.hostname.replace(/^(www|m|music)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    const id = parts[0];
    return id && YOUTUBE_ID.test(id) ? { provider: "youtube", id } : undefined;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const id =
      parts[0] === "watch"
        ? url.searchParams.get("v")
        : ["embed", "shorts", "live", "v"].includes(parts[0] ?? "")
          ? parts[1]
          : undefined;
    return id && YOUTUBE_ID.test(id) ? { provider: "youtube", id } : undefined;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const rest = parts[0] === "video" ? parts.slice(1) : parts;
    const index = rest.findIndex((part) => /^\d+$/.test(part));
    const id = rest[index];
    if (!id) return undefined;
    const next = rest[index + 1];
    const hash =
      url.searchParams.get("h") ??
      (next && /^[\da-f]+$/i.test(next) ? next : undefined);
    return { provider: "vimeo", id, ...(hash ? { hash } : {}) };
  }
  return undefined;
}

/** The player's address: no tracking cookies until the visitor presses play. */
export function embedUrl(video: VideoSource): string {
  if (video.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${video.id}?rel=0`;
  }
  const params = new URLSearchParams({ dnt: "1" });
  if (video.hash) params.set("h", video.hash);
  return `https://player.vimeo.com/video/${video.id}?${params}`;
}

/** A still from a YouTube video, straight from YouTube's image server. */
export function youtubeThumbnail(video: VideoSource): string | undefined {
  return video.provider === "youtube"
    ? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`
    : undefined;
}
