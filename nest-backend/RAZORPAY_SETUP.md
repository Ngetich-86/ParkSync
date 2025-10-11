# Razorpay Payment Integration Setup

This document explains how to set up Razorpay payment integration for the ParkSync application.

## 🔧 Environment Variables

Add the following environment variables to your `.env` file:

```env
# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## 🚀 Getting Started with Razorpay

### 1. Create Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up for a new account
3. Complete the verification process

### 2. Get Test Credentials
1. Login to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Generate **Test Key** and **Test Secret**
4. Copy the Key ID and Key Secret to your `.env` file

### 3. Set Up Webhooks (Optional)
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret to your `.env` file

## 📱 Frontend Integration

### 1. Install Razorpay SDK
```bash
npm install razorpay
# or
yarn add razorpay
```

### 2. Basic Integration Example
```javascript
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: 'YOUR_RAZORPAY_KEY_ID',
  key_secret: 'YOUR_RAZORPAY_KEY_SECRET'
});

// Create payment order
async function createPayment(amount, customerDetails) {
  try {
    const response = await fetch('/api/payments/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify({
        amount: amount,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        notes: {
          parkingSessionId: 'session-uuid',
          slotNumber: 'A-001'
        }
      })
    });

    const orderData = await response.json();

    // Open Razorpay checkout
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: orderData.name,
      description: orderData.description,
      order_id: orderData.orderId,
      prefill: orderData.prefill,
      notes: orderData.notes,
      theme: orderData.theme,
      handler: function (response) {
        // Verify payment on backend
        verifyPayment(response);
      },
      modal: {
        ondismiss: function() {
          console.log('Payment cancelled');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    console.error('Payment creation failed:', error);
  }
}

// Verify payment
async function verifyPayment(paymentResponse) {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN'
      },
      body: JSON.stringify({
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('Payment verified successfully:', result);
      // Update UI to show success
    } else {
      console.error('Payment verification failed:', result);
      // Show error message
    }
  } catch (error) {
    console.error('Payment verification error:', error);
  }
}
```

## 🔌 API Endpoints

### Create Payment Order
```http
POST /payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 150.50,
  "currency": "INR",
  "customerName": "John Doe",
  "customerEmail": "john.doe@example.com",
  "customerPhone": "+919876543210",
  "notes": {
    "parkingSessionId": "uuid-here",
    "slotNumber": "A-001"
  }
}
```

### Verify Payment
```http
POST /payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "razorpaySignature": "signature_1234567890"
}
```

### Get Payment Details
```http
GET /payments/{paymentId}
Authorization: Bearer <token>
```

### Refund Payment
```http
POST /payments/refund
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentId": "payment-uuid-here",
  "amount": 100.50,
  "reason": "Customer requested refund"
}
```

## 🧪 Testing

### Test Cards (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI IDs
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## 🔒 Security Considerations

1. **Never expose** your Razorpay Key Secret on the frontend
2. **Always verify** payment signatures on the backend
3. **Use HTTPS** for all payment-related requests
4. **Validate** all payment data before processing
5. **Log** all payment activities for audit trails

## 📊 Monitoring

The payment system includes:
- **Event-driven architecture** for payment status updates
- **Comprehensive logging** for debugging
- **Payment statistics** and analytics
- **Webhook support** for real-time updates

## 🚨 Error Handling

Common error scenarios:
- **Invalid credentials**: Check your Razorpay key configuration
- **Signature verification failed**: Ensure proper signature generation
- **Payment not found**: Verify payment ID and transaction ID
- **Refund failed**: Check if payment is eligible for refund

## 📞 Support

For Razorpay-specific issues:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

For application-specific issues:
- Check application logs
- Verify environment configuration
- Test with Razorpay test credentials
