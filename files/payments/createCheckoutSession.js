// NextJS API Route, using TypeScript
// It needs to take in an array of products (productIds, quantities, and prices/discounts)
// It creates a CheckoutSession in the database
// It creates a Stripe Checkout Session
// It returns the Stripe Checkout Session URL
const createCheckoutSessionString = `
import { unstable_getServerSession } from "next-auth/next"
import Stripe from 'stripe'
import { prisma } from '~/server/db'
import { authOptions } from "./api/auth/[...nextauth]"

export async function POST(request: Request, response: Response) {
    // Get the user session
    const session = await unstable_getServerSession(request, response, authOptions)
    if (!session) {
        return response.status(401).end()
    }
    try {
    // Get the products and return URL from the request body
    const { products, returnUrl } = await request.body.json() as { products: { productId: string, quantity: number, price: number }[], returnUrl: string }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Convert the products to line items for the Stripe Checkout Session
    const lineItems = products.map(product => {
        return {
            price_data: {
                currency: {{CURRENCY}},
                product_data: {
                    name: product.productId,
                    metadata: {
                        productId: product.productId
                    }
                },
                unit_amount: product.price,
            },
            quantity: product.quantity,
        }
    })

    // Create the Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card','link'],
        customer_email: session.user.email ?? undefined,
        line_items: lineItems,
        mode: 'payment',
        success_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success\`,
        cancel_url: \`\${process.env.NEXT_PUBLIC_SITE_URL}/\${returnUrl ?? '/'}\`,
        automatic_tax: { enabled: true },
    })

    // Save the Checkout Session to the database
    await prisma.checkoutSession.create({
        data: {
            id: session.id,
            userId: session.user.id,
            items: {
                createMany: products.map(product => {
                    return {
                        quantity: product.quantity,
                        productId: product.productId,
                    }
                })
            }
        })

    // Return the Stripe Checkout Session URL
    return response.status(200).json({ url: session.url })
    } catch (error) {
        return response.status(500).end()
    }
}
`

export default createCheckoutSessionString
