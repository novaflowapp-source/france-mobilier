import { NextResponse } from "next/server";
import { z } from "zod";
import { headers } from "next/headers";
import { auth, prepareAuth } from "@/lib/auth";
import { createReview, listApprovedReviews } from "@/lib/reviews";

const createSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(10).max(2000),
  displayName: z.string().min(2).max(40),
});

export async function GET(request: Request) {
  await prepareAuth();
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }
  const reviews = await listApprovedReviews(productId);
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  await prepareAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const id = await createReview({
      userId: session.user.id,
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      title: parsed.data.title,
      body: parsed.data.body,
      displayName: parsed.data.displayName,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur";
    if (message === "AVIS_NOM_REQUIS") {
      return NextResponse.json(
        { error: "Enter the name to show with your review." },
        { status: 400 },
      );
    }
    if (message === "AVIS_ACHAT_REQUIS") {
      return NextResponse.json(
        {
          error:
            "Reviews are limited to verified purchases. After your order is delivered, you can leave a comment.",
        },
        { status: 403 },
      );
    }
    if (message === "AVIS_EN_ATTENTE") {
      return NextResponse.json(
        { error: "Your review is already awaiting approval." },
        { status: 409 },
      );
    }
    if (message === "AVIS_DEJA_PUBLIE") {
      return NextResponse.json(
        { error: "You already have a published review for this product." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Could not save the review" }, { status: 500 });
  }
}
