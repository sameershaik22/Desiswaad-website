"""
email_service.py — Gmail SMTP email sender for DesiSwad.

Uses Python's built-in smtplib + ssl (no extra dependencies needed).
Set GMAIL_USER and GMAIL_PASS (App Password) in .env.local to enable.

If credentials are missing, emails are silently skipped so the rest
of the order flow always succeeds.
"""
import smtplib
import ssl
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

GMAIL_USER = os.getenv("GMAIL_USER", "")
GMAIL_PASS = os.getenv("GMAIL_PASS", "")
SITE_NAME  = os.getenv("NEXT_PUBLIC_SITE_NAME", "DesiSwad Foods")
SITE_URL   = os.getenv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000")


def _send(to_email: str, subject: str, html_body: str) -> bool:
    """Send an HTML email via Gmail SMTP. Returns True on success."""
    if not GMAIL_USER or not GMAIL_PASS or GMAIL_PASS == "your_16_char_app_password_here":
        # Credentials not configured — skip silently
        print(f"[email] Skipping email to {to_email} — GMAIL credentials not set")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"]    = f"{SITE_NAME} <{GMAIL_USER}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(html_body, "html"))

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=context) as server:
            server.login(GMAIL_USER, GMAIL_PASS)
            server.sendmail(GMAIL_USER, to_email, msg.as_string())
        print(f"[email] Sent '{subject}' to {to_email}")
        return True
    except Exception as exc:
        print(f"[email] Failed to send to {to_email}: {exc}")
        return False


def send_status_update_email(order, items, status_type: str) -> bool:
    """Send order status email (confirmed or cancelled)."""
    items_rows = "".join(
        f"""
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">{i.name}{' (' + i.weight + ')' if getattr(i, 'weight', '') else ''}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">{i.qty}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right">₹{i.price * i.qty:.0f}</td>
        </tr>
        """
        for i in items
    )

    track_url = f"{SITE_URL}/track?id={order.id}"
    
    if status_type == "Confirmed":
        subject_line = f"[{SITE_NAME}] Order Confirmed! #{order.id}"
        header_text = "Order Confirmed! 🎉"
        body_text = "Great news! Our kitchen has officially confirmed your order and is preparing your fresh authentic snacks!"
        color = "#1E5B3A"
    elif status_type == "Cancelled":
        subject_line = f"[{SITE_NAME}] Order Cancelled #{order.id}"
        header_text = "Order Cancelled 🚫"
        body_text = "Your order has been successfully cancelled. If you paid online, your refund will be processed shortly."
        color = "#B22222"
    else:
        return False

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
        <!-- Header -->
        <div style="background:{color};padding:32px 40px;text-align:center">
          <h1 style="color:#D4AF37;margin:0;font-size:26px;font-weight:800">🌿 {SITE_NAME}</h1>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:15px">{header_text}</p>
        </div>

        <!-- Body -->
        <div style="padding:32px 40px">
          <p style="color:#333;font-size:16px">Hi <strong>{order.customer_name}</strong>,</p>
          <p style="color:#555;font-size:14px;line-height:1.6">
            {body_text}
          </p>

          <!-- Order ID Box -->
          <div style="background:#fdfaf4;border:2px solid #D4AF37;border-radius:10px;padding:16px 20px;text-align:center;margin:24px 0">
            <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;font-weight:700">Order ID</p>
            <p style="margin:0;font-size:28px;font-weight:900;color:#B22222;font-family:monospace;letter-spacing:2px">{order.id}</p>
          </div>

          <!-- Order Items Table -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
            <thead>
              <tr style="background:#f8f8f8">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">Item</th>
                <th style="padding:10px 12px;text-align:center;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">Qty</th>
                <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:1px">Price</th>
              </tr>
            </thead>
            <tbody>{items_rows}</tbody>
          </table>

          <div style="text-align:center;margin-top:32px">
            <a href="{track_url}" style="background:#D4AF37;color:#fff;text-decoration:none;padding:14px 28px;border-radius:30px;font-size:16px;font-weight:700;display:inline-block">Track Your Order</a>
          </div>
        </div>
      </div>
    </body>
    </html>
    """
    return _send(order.email, subject_line, html)


def send_order_status_update(order, new_status: str, message: str = "") -> bool:
    """Notify customer when admin updates their order status."""
    status_emoji = {
        "Pending":    "⏳",
        "Processing": "🔄",
        "Shipped":    "🚚",
        "Delivered":  "🎉",
        "Cancelled":  "❌",
    }.get(new_status, "📦")

    track_url = f"{SITE_URL}/track?id={order.id}"

    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
        <div style="background:linear-gradient(135deg,#1E5B3A,#2d7a4f);padding:28px 40px;text-align:center">
          <h1 style="color:#D4AF37;margin:0;font-size:22px;font-weight:800">🌿 {SITE_NAME}</h1>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px">Order Status Update</p>
        </div>
        <div style="padding:32px 40px">
          <p style="color:#333;font-size:16px">Hi <strong>{order.customer_name}</strong>,</p>
          <p style="color:#555;font-size:14px">Your order status has been updated:</p>

          <div style="background:#f0f7f4;border-left:4px solid #1E5B3A;border-radius:8px;padding:20px 24px;margin:20px 0">
            <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px">Order #{order.id}</p>
            <p style="margin:0;font-size:22px;font-weight:800;color:#1E5B3A">{status_emoji} {new_status}</p>
            {f'<p style="margin:8px 0 0;color:#555;font-size:14px">{message}</p>' if message else ''}
          </div>

          <div style="text-align:center;margin-top:24px">
            <a href="{track_url}" style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#1E5B3A,#2d7a4f);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px">
              📦 Track My Order
            </a>
          </div>
        </div>
        <div style="background:#f8f8f8;padding:16px 40px;text-align:center;border-top:1px solid #eee">
          <p style="margin:0;color:#aaa;font-size:12px">© 2025 {SITE_NAME}</p>
        </div>
      </div>
    </body>
    </html>
    """
    return _send(order.email, f"{status_emoji} Order {new_status} — #{order.id} | {SITE_NAME}", html)


def send_password_reset_email(email: str, token: str) -> bool:
    """Send a password reset link to user."""
    reset_url = f"{SITE_URL}/reset-password?token={token}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
      <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1E5B3A,#2d7a4f);padding:32px 40px;text-align:center">
          <h1 style="color:#D4AF37;margin:0;font-size:26px;font-weight:800">🌿 {SITE_NAME}</h1>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:15px">Password Reset Request</p>
        </div>

        <!-- Body -->
        <div style="padding:32px 40px">
          <p style="color:#333;font-size:16px">Hello,</p>
          <p style="color:#555;font-size:14px;line-height:1.6">
            We received a request to reset the password for your {SITE_NAME} account. 
            Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
          </p>

          <!-- Button -->
          <div style="text-align:center;margin:32px 0">
            <a href="{reset_url}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#B22222,#8B1A1A);color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(178,34,34,0.3)">
              🔑 Reset My Password
            </a>
          </div>

          <p style="color:#888;font-size:12px;line-height:1.6;margin-top:24px">
            If you did not request a password reset, please ignore this email or contact support. No changes will be made to your account.
          </p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#bbb;font-size:11px;word-break:break-all">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            {reset_url}
          </p>
        </div>

        <!-- Footer -->
        <div style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eee">
          <p style="margin:0;color:#aaa;font-size:12px">
            © 2025 {SITE_NAME} · Pure Taste • Pure Trust
          </p>
        </div>
      </div>
    </body>
    </html>
    """
    return _send(email, f"🔑 Reset your password | {SITE_NAME}", html)
