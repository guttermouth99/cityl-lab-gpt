const defaultMastraUrl = "http://localhost:4111";

export async function POST(req: Request) {
  const mastraUrl = process.env.MASTRA_API_URL ?? defaultMastraUrl;
  const body = await req.text();

  const response = await fetch(`${mastraUrl}/chat/citylabAgent`, {
    method: "POST",
    headers: {
      "content-type": req.headers.get("content-type") ?? "application/json",
    },
    body,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}
