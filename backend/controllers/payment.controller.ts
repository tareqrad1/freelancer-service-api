import { pool } from "../config/db.config";
import { stripe } from "../config/stripe.config";
import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/protectedRoute";


interface PaymentBody {
    freelancer_id: string;
    service_id: string;
    service_title: string;
    service_price: number;
    service_image: string;
}

export const createCheckoutSession = async (req: Request, res: Response) => {
    const { freelancer_id, service_id, service_title, service_price, service_image } = req.body as PaymentBody;
    if(!service_id || !service_title || !service_price || !service_image) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: service_title,
                            images: [service_image],
                        },
                        unit_amount: service_price * 100, //in cents
                    },
                    quantity: 1,
                }
            ],
            metadata: {
                service_id: service_id,
                freelancer_id: freelancer_id,
            },
            success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/checkout-cancel`,
        });
        res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const checkoutSuccess = async (req: CustomRequest, res: Response) => {
    const { sessionId } = req.body as { sessionId: string };
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId); //retrieve mean get the information from stripe sessionId
        if(!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        };
        if(session.payment_status !== 'paid') {
            res.status(400).json({ error: 'Payment not completed' });
            return;
        };
        const newOrder = await pool.query(
            "INSERT INTO orders (client_id, freelancer_id, service_id, amount, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [
                req.user?.id,
                session.metadata?.freelancer_id as string,
                session.metadata?.service_id as string,
                Number(session.metadata?.amount),
                'Paid',
            ]
        );
        res.status(200).json({ message: 'Payment successful', order: newOrder.rows[0] });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};