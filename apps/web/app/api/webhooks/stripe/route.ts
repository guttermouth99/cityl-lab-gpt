import { type NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  // TODO: Implement Stripe webhook handling
  // const body = await _req.text()
  // const signature = _req.headers.get('stripe-signature')

  // Verify webhook signature
  // Process event (subscription created, payment succeeded, etc.)

  return await Promise.resolve(NextResponse.json({ received: true }));
}
