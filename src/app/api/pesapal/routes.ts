import { NextResponse, type NextRequest } from 'next/server';
interface PaymentRequestBody {
    amount: number;
    currency: string;
    description: string;
    orderId: string;
    email: string;
    phone: string;
}

export async function POST(request: NextRequest){
    try {
        const { amount, currency, description, orderId, email, phone }: PaymentRequestBody = await request.json();
        const consumerkey = process.env.PESAPAL_CONSUMER_KEY;
        const consumersecret = process.env.PESAPAL_CONSUMER_SECRET;
        const authUrl = 'https://pesapal.com/api/Auth/RequestToken';
        const authResponse = await fetch (authUrl, {
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
                'Accept':'application/json',
            },
            body: JSON.stringify({
                consumer_key: consumerkey,
                consumer_secret: consumersecret,
            })
        });
        const {token} = await authResponse.json() as {token: string};
        const orderUrl='https://pesapal.com/api/Transactions/SubmitOrderRequest';
        const orderData = {
            id: orderId,
            currency,
            amount,
            description,
            callbackurl:'https://yourdomain.com/api/pesapal/callback',
            notification_id:'12345',
            billing_address:{
                email_address: email,
                phone_number: phone
            }
        };
        const orderResponse = await fetch (orderUrl, {
            method: 'POST',
            headers:{
                'Content-Type':'application/json',
                'Accept':'application/json',
                'Authorization': 'Bearer ${token}'
            },
            body:JSON.stringify(orderData)
        });
        const pesapalResponse = await orderResponse.json();
        return NextResponse.json(pesapalResponse);
    }catch (error) {
        console.error('Pesapal API error:', error);
        return NextResponse.json({ error:'Failed to process payement'},{ status: 500 });

    }

}