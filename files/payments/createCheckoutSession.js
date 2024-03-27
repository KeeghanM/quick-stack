const createCheckoutSessionString = `import { getServerSession } from "next-auth/next"
import Stripe from "stripe"
import prisma from "~/db/db"

import type { NextApiRequest, NextApiResponse } from "next"

export async function POST(request: NextApiRequest, response: NextApiResponse) {
  // Get the user session
  const session = await getServerSession()
  if (!session) {
    return response.status(401).end()
  }
  try {
    // Get the products and return URL from the request body
    const { products, returnUrl } = (await request.body.json()) as {
      products: { productId: string; quantity: number; price: number }[]
      returnUrl: string
    }

    // Get the userId from the email in the session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email,
      },
    })

    if (!user) {
      return response.status(401).end()
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

    // Convert the products to line items for the Stripe Checkout Session
    const lineItems = products.map((product) => {
      return {
        price_data: {
          currency: "{{ CURRENCY }}",
          product_data: {
            name: product.productId,
            metadata: {
              productId: product.productId,
            },
          },
          unit_amount: product.price,
        },
        quantity: product.quantity,
      }
    })

    // Create the Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "link"],
      customer_email: user.email ?? undefined,
      line_items: lineItems,
      mode: "payment",
      success_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success\`,
      cancel_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/\${returnUrl ?? "/"}\`,
      automatic_tax: { enabled: true },
    })

    // Save the Checkout Session to the database
    await prisma.checkoutSession.create({
      data: {
        id: stripeSession.id,
        userId: user.id,
        items: {
          createMany: products.map((product) => {
            return {
              quantity: product.quantity,
              productId: product.productId,
            }
          }),
        },
      },
    })

    // Return the Stripe Checkout Session URL
    return response.status(200).json({ url: stripeSession.url })
  } catch (error) {
    return response.status(500).end()
  }
}
`

export default createCheckoutSessionString
