

const stripe = require("stripe")("sk_test_51L6AcuSGzq7ss3Oqy8cB5Tz2IGKxFMWz44vnJMtDPf9tFUtWJxZXQqyHqPLGw9Fm6ti8vlRAMhEUYZh9w26cupO900eRLsUaze");
const Razorpay = require('razorpay'); 
const razorpayInstance = new Razorpay({
  
    // Replace with your key_id
    key_id: 'rzp_test_V96wpIY3qLs4zo',
  
    // Replace with your key_secret
    key_secret: '4B1zY9aMw1wFINVO2P6EbNYR'
});
export class PaymentController {
    static async checkOut(req: any, res: any, next: any) {
        try {
            const token = req.body;
            console.log('token', token.id)
            const customer = stripe.customers
                .create({
                    email: "gautam1997@gmail.com",
                    source: token.id
                })
                .then((customer: any) => {
                    console.log('customer', customer.id)
                    return stripe.charges.create({
                        amount: 1000,
                        description: "watch",
                        currency: "USD",
                        customer: customer.id,
                    });
                })
                .then((charge: any) => {
                    console.log('charge', charge);
                    res.json({
                        data: "success"
                    })
                })
                .catch((err: any) => {
                    console.log('err', err);
                    res.json({
                        data: "failure",
                    });
                });
            return true;
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    static async refundPayment(req: any, res: any, next: any) {
        const paymentId = req.body.razorpay_payment_id; 
        try {
     
            razorpayInstance.payments.refund(paymentId,{
                "amount": 5000,
                "speed": "optimum",
              }).then((data:any) => {
                  res.json('suceessfully refund')

              }).catch((error:any) => {
                res.json(error)
            });
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }

    static async capturePayment(req: any, res: any, next: any) {
        const data = req.body; 
        console.log(Number(data.amount))
        try {
     
            razorpayInstance.payments.capture(data.razorpay_payment_id, 10000, 'INR').then((data:any) => {
                  res.json('suceessfully capture')

              }).catch((error:any) => {
                  console.log('error', error);
                res.json(error)
            });
        } catch (error) {
            console.log('error', error);
            return false;
        }
    }
}


