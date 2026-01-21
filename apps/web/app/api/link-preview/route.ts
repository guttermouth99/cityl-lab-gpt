import { type NextRequest, NextResponse } from "next/server";

interface LinkPreviewData {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

// Pre-compiled regex patterns for meta tag extraction
const OG_TITLE_REGEX =
  /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i;
const OG_TITLE_ALT_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i;
const OG_DESC_REGEX =
  /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i;
const OG_DESC_ALT_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i;
const OG_IMAGE_REGEX =
  /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i;
const OG_IMAGE_ALT_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i;
const OG_SITE_NAME_REGEX =
  /<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i;
const OG_SITE_NAME_ALT_REGEX =
  /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i;
const TWITTER_TITLE_REGEX =
  /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i;
const TWITTER_DESC_REGEX =
  /<meta[^>]*name=["']twitter:description["'][^>]*content=["']([^"']+)["']/i;
const TWITTER_IMAGE_REGEX =
  /<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i;
const META_DESC_REGEX =
  /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i;
const TITLE_TAG_REGEX = /<title[^>]*>([^<]+)<\/title>/i;
const FAVICON_REGEX =
  /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i;

function extractMetaContent(
  html: string,
  property: "title" | "description" | "image" | "site_name"
): string | null {
  // Try og: property first
  let match: RegExpMatchArray | null = null;

  switch (property) {
    case "title": {
      match = html.match(OG_TITLE_REGEX) ?? html.match(OG_TITLE_ALT_REGEX);
      if (match?.[1]) {
        return match[1];
      }
      match = html.match(TWITTER_TITLE_REGEX);
      break;
    }
    case "description": {
      match = html.match(OG_DESC_REGEX) ?? html.match(OG_DESC_ALT_REGEX);
      if (match?.[1]) {
        return match[1];
      }
      match = html.match(TWITTER_DESC_REGEX);
      if (match?.[1]) {
        return match[1];
      }
      match = html.match(META_DESC_REGEX);
      break;
    }
    case "image": {
      match = html.match(OG_IMAGE_REGEX) ?? html.match(OG_IMAGE_ALT_REGEX);
      if (match?.[1]) {
        return match[1];
      }
      match = html.match(TWITTER_IMAGE_REGEX);
      break;
    }
    case "site_name": {
      match =
        html.match(OG_SITE_NAME_REGEX) ?? html.match(OG_SITE_NAME_ALT_REGEX);
      break;
    }
    default: {
      return null;
    }
  }

  return match?.[1] ?? null;
}

function extractTitle(html: string): string | null {
  const titleMatch = html.match(TITLE_TAG_REGEX);
  return titleMatch?.[1]?.trim() ?? null;
}

function extractFavicon(html: string, baseUrl: string): string | null {
  // Try to find favicon in link tags
  const iconMatch = html.match(FAVICON_REGEX);
  if (iconMatch?.[1]) {
    const iconUrl = iconMatch[1];
    if (iconUrl.startsWith("http")) {
      return iconUrl;
    }
    if (iconUrl.startsWith("//")) {
      return `https:${iconUrl}`;
    }
    if (iconUrl.startsWith("/")) {
      return `${baseUrl}${iconUrl}`;
    }
    return `${baseUrl}/${iconUrl}`;
  }

  // Default to /favicon.ico
  return `${baseUrl}/favicon.ico`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const parsedUrl = new URL(url);
    const baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://citylab-berlin.org)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    const preview: LinkPreviewData = {
      url,
      title: extractMetaContent(html, "title") ?? extractTitle(html),
      description: extractMetaContent(html, "description"),
      image: extractMetaContent(html, "image"),
      siteName: extractMetaContent(html, "site_name"),
      favicon: extractFavicon(html, baseUrl),
    };

    // Make image URL absolute if relative
    if (preview.image && !preview.image.startsWith("http")) {
      if (preview.image.startsWith("//")) {
        preview.image = `https:${preview.image}`;
      } else if (preview.image.startsWith("/")) {
        preview.image = `${baseUrl}${preview.image}`;
      } else {
        preview.image = `${baseUrl}/${preview.image}`;
      }
    }

    return NextResponse.json(preview, {
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }

    console.error("Link preview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch link preview" },
      { status: 500 }
    );
  }
}
