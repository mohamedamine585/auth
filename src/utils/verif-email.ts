export function emailTemplate(activationLink: string) {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activate Your Account</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background: linear-gradient(135deg, #4b6cb7, #182848);
        color: white;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
        text-align: center;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .activate-button {
        display: inline-block;
        background-color: #5a67d8;
        color: white !important;
        padding: 12px 25px;
        font-size: 16px;
        font-weight: bold;
        text-decoration: none;
        border-radius: 5px;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
        transition: 0.3s;
      }
      .activate-button:hover {
        background-color: #434190;
      }
      .footer {
        text-align: center;
        font-size: 14px;
        margin-top: 20px;
        opacity: 0.8;
      }
      .footer a {
        color: #ffffff;
        text-decoration: underline;
      }
      .footer a:hover {
        text-decoration: none;
      }
    </style>
  </head>
  <body>
  
    <div class="email-container">
      <h1>Welcome to Pulse!</h1>
      <p>We’re excited to have you on board. Click the button below to activate your account:</p>
      <div class="button-container">
        <a href="${activationLink}" class="activate-button">Activate Account</a>
      </div>
      <p>If you didn’t request this, you can safely ignore this email.</p>
      <p class="footer">Need help? <a href="mailto:support@pulse.com">Contact Support</a></p>
    </div>
  
  </body>
  </html>`;
}
