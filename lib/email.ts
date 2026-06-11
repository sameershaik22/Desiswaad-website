import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface OrderEmailData {
  orderId: number
  customerName: string
  customerEmail: string
  total: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  address: {
    address: string
    city: string
    state: string
    pincode: string
  }
}

export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  const { orderId, customerName, customerEmail, total, items, address } = data

  const itemsHtml = items.map(item =>
    `<tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.price * item.quantity}</td>
    </tr>`
  ).join('')

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d97706;">DesiSwad Foods - Order Confirmation</h1>
      <p>Dear ${customerName},</p>
      <p>Thank you for your order! Here are the details:</p>

      <h3>Order #${orderId}</h3>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Item</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Qty</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Price</th>
            <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr style="background-color: #f3f4f6; font-weight: bold;">
            <td colspan="3" style="border: 1px solid #d1d5db; padding: 8px;">Total</td>
            <td style="border: 1px solid #d1d5db; padding: 8px;">₹${total}</td>
          </tr>
        </tfoot>
      </table>

      <h3>Delivery Address</h3>
      <p>
        ${address.address}<br>
        ${address.city}, ${address.state} ${address.pincode}
      </p>

      <p>You will receive updates on your order status via email.</p>

      <p>Best regards,<br>DesiSwad Foods Team</p>
    </div>
  `

  try {
    await resend.emails.send({
      from: 'DesiSwad Foods <orders@desiswad.com>',
      to: customerEmail,
      subject: `Order Confirmation #${orderId}`,
      html
    })
  } catch (error) {
    console.error('Email send error:', error)
  }
}

export async function sendOrderStatusEmail(
  customerEmail: string,
  orderId: number,
  status: string
) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #d97706;">DesiSwad Foods - Order Update</h1>
      <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
      <p>You can track your order at: <a href="${process.env.NEXT_PUBLIC_SITE_URL}/track/${orderId}">Track Order</a></p>
      <p>Best regards,<br>DesiSwad Foods Team</p>
    </div>
  `

  try {
    await resend.emails.send({
      from: 'DesiSwad Foods <orders@desiswad.com>',
      to: customerEmail,
      subject: `Order Update #${orderId}`,
      html
    })
  } catch (error) {
    console.error('Email send error:', error)
  }
}