const checkoutSuccessString = `
import { headers } from 'next/headers'
import { prisma } from '~/server/db'
import Stripe from 'stripe'
import { authOptions } from "./api/auth/[...nextauth]"
import { unstable_getServerSession } from "next-auth/next"

export async function POST(request: Request, response: Response) {
    // Get the user session
    const session = await unstable_getServerSession(request, response, authOptions)
    if (!session) {
        return response.status(401).end()
    }
    
    try {

        // We need to verify the webhook signature
        const payload = await request.text()
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const webHookSecret = process.env.STRIPE_WEBHOOK_SECRET
        const signature = headers().get('stripe-signature')
        
        if (!signature) {
            return response.status(400).end()
        }

        let event
        try {
            event = stripe.webhooks.constructEvent(payload, signature, webHookSecret)
        } catch (err) {
            console.log(err)
            return response.status(400).end()
        }

        // Check if the event is a checkout session completed event
        // They're the only events we're interested in in this route
        if(event.type !== 'checkout.session.completed') {
            return response.status(400).end()
        }

        // Now, we can handle the event itself
        const session = await stripe.checkout.sessions.retrieve(event.data.object.id)
        const checkoutSession = await prisma.checkoutSession.findUnique({
            where: {
                id: session.id
            },
            include: {
                items: true
            }
        })    
        
        if(!checkoutSession) {
            return response.status(400).end()
        }

        // Save the purchase to the database
        await prisma.purchase.create({
            data: {
                userId: checkoutSession.userId,
                items: {
                    createMany: checkoutSession.items.map(item => {
                        return {
                            quantity: item.quantity,
                            productId: item.productId
                        }
                    })
                }
            }
        })

        // Mark the session as processed
        await prisma.checkoutSession.update({
            where: {
                id: session.id
            },
            data: {
                processed: true
            }
        })

        return response.status(200).end()
    }
    catch (error) {
        console.log(error)
        return response.status(500).end()
    }
}
`

export default checkoutSuccessString
