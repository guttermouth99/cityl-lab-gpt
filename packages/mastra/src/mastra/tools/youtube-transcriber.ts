import { ofetch } from "ofetch";

/**
 * Regex patterns for extracting YouTube video IDs
 */
const YOUTUBE_URL_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
];

/**
 * Individual transcript segment from YouTube Transcript API
 */
export interface TranscriptSegment {
  text: string;
  duration: string;
  offset: string;
  lang: string;
}

/**
 * Response from YouTube Transcript API
 */
export interface YouTubeTranscriptResponse {
  success: boolean;
  transcript: TranscriptSegment[];
}

/**
 * Parsed transcript content from YouTube
 */
export interface YouTubeTranscriptContent {
  videoId: string;
  fullTranscript: string;
  segments: TranscriptSegment[];
  segmentCount: number;
  totalDuration: number;
}

/**
 * Fetch transcript from a YouTube video using RapidAPI
 *
 * Uses youtube-transcript3.p.rapidapi.com to fetch the transcript
 * of a YouTube video and return it in a clean, LLM-friendly format.
 *
 * @param videoId - The YouTube video ID (e.g., "ZacjOVVgoLY")
 * @returns Parsed transcript with full text and individual segments
 */
export async function fetchYouTubeTranscript(
  videoId: string
): Promise<YouTubeTranscriptContent> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey) {
    throw new Error("RAPIDAPI_KEY environment variable is not configured");
  }

  const response = await ofetch<YouTubeTranscriptResponse>(
    "https://youtube-transcript3.p.rapidapi.com/api/transcript",
    {
      query: {
        videoId,
      },
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com",
      },
    }
  );

  if (!(response.transcript && Array.isArray(response.transcript))) {
    throw new Error(
      `YouTube Transcript API failed: Unable to fetch transcript for video ${videoId}`
    );
  }

  const segments = response.transcript;
  const fullTranscript = segments.map((segment) => segment.text).join(" ");
  const lastSegment = segments.at(-1);
  const totalDuration = lastSegment
    ? Number.parseFloat(lastSegment.offset) +
      Number.parseFloat(lastSegment.duration)
    : 0;

  return {
    videoId,
    fullTranscript,
    segments,
    segmentCount: segments.length,
    totalDuration,
  };
}

/**
 * Extract video ID from a YouTube URL
 *
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 *
 * @param url - The YouTube URL
 * @returns The video ID or null if not found
 */
export function extractVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Fetch transcript from a YouTube URL or video ID
 *
 * Convenience function that accepts either a full YouTube URL
 * or just the video ID.
 *
 * @param urlOrVideoId - YouTube URL or video ID
 * @returns Parsed transcript content
 */
export function fetchYouTubeTranscriptFromUrl(
  urlOrVideoId: string
): Promise<YouTubeTranscriptContent> {
  const videoId = extractVideoId(urlOrVideoId) ?? urlOrVideoId;
  return fetchYouTubeTranscript(videoId);
}
