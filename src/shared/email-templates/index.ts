const emailTemplate = (emailContent: string): string => `
    <!doctype html>
<html>

<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>MyEC Emails | MyEcurrencyNG</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sora:wght@100..800&display=swap" rel="stylesheet">
  <style>
    body {
      background-color: #DFE2E4;
      font-family: 'Sora', sans-serif;
      margin: 0;
      padding: 0;
    }

    .body {
      width: 100%;
      background-color: #DFE2E4;
    }

    .container {
      width: 580px;
      margin: 0 auto;
    }

    .content {
      max-width: 600px;
      margin: 0 auto;
    }

    .main {
      background-color: #F6F6F6;
      border-radius: 3px;
      width: 100%;
    }

    .wrapper {
      padding: 20px;
    }

    h2,
    h3 {
      color: #8C1823;
      margin-top: 0;
    }

    p {
      font-family: Sora, sans-serif;
      margin: 0;
      margin-bottom: 15px;
      text-align: justify;
    }

    a {
      color: #8C1823;
    }

    .app-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }

    .app-promo {
      background-color: #B01E28;
      color: white;
      width: 100%;
    }

    .app-content {
      padding: 20px;
    }

    .phone-container {
      width: 40%;
      vertical-align: middle;
      padding-left: 20px;
    }

    .download-container {
      width: 60%;
      vertical-align: middle;
      padding-right: 20px;
      text-align: center;
    }

    .download-heading {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      text-align: center;
    }

    .app-store-buttons {
      margin-top: 20px;
      text-align: center;
    }

    .app-store-button {
      display: inline-block;
      margin-bottom: 10px;
      max-width: 150px;
      text-align: center;
    }

    .social-icons {
      margin-top: 20px;
      text-align: center;
    }

    .social-icon {
      display: inline-block;
      width: 30px;
      height: 30px;
      margin: 0 5px;
      background-color: white;
      border-radius: 50%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    }

    .social-icon img {
      max-width: 20px;
      max-height: 20px;
      object-fit: contain;
    }

    @media only screen and (max-width: 620px) {
      table.body h1 {
        font-size: 28px !important;
      }

      table.body p,
      table.body td,
      table.body a {
        font-size: 16px !important;
      }

      table.body .container {
        width: 100% !important;
      }

      .container {
        width: 100% !important;
      }
    }
  </style>
</head>

<body>
  <table role="presentation" class="body" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td>&nbsp;</td>
      <td class="container" width="580" align="center">
        <div class="content">
          <!-- Banner Image -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td align="center">
                <img src="https://res.cloudinary.com/odevserver/image/upload/v1746444196/Frame_1_1_u37pau.png" alt="banner" style="width: 100%; max-width: 600px;">
              </td>
            </tr>
          </table>

          <!-- Main Content -->
          <table role="presentation" class="main" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 0;">
            <tr>
            ${emailContent}
            </tr>
          </table>
          <!-- App Download Section -->
          <table class="app-container" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top: 0;">
            <tr>
              <td class="app-promo">
                <table class="app-content" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td class="phone-container" width="40%" valign="middle">
                      <img src="https://res.cloudinary.com/odevserver/image/upload/v1746445604/phone_1_v34v1t.png" alt="MyCurrency App Interface" style="max-width: 100%; border-radius: 15px; border: 4px solid #FFCC00;" width="180">
                    </td>
                    <td class="download-container" width="60%" valign="middle">
                      <div class="download-heading">DOWNLOAD<br>MYCURRENCY<br> APP NOW</div>
                      <table class="app-store-buttons" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td align="center">
                            <table cellpadding="0" cellspacing="0" border="0" align="center">
                              <tr>
                                <td class="app-store-button" style="padding-right: 5px;">
                                  <a href="https://apps.apple.com/us/app/my-ec-nigeria/id1628443545" target="_blank">
                                    <img src="https://res.cloudinary.com/odevserver/image/upload/v1746450020/Group_3_nepuya.png" alt="Download on the App Store" width="135" style="max-width: 100%;">
                                  </a>
                                </td>
                              </tr>
                              <tr>
                                <td class="app-store-button" style="padding-right: 5px;">
                                  <a href="https://play.google.com/store/apps/details?id=com.myecurrency&pli=1" target="_blank">
                                    <img src="https://res.cloudinary.com/odevserver/image/upload/v1746450020/Group_4_tf1sg6.png" alt="Get it on Google Play" width="135" style="max-width: 100%;">
                                  </a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      <div class="social-icons">
                        <a href="#" class="social-icon" style="color: #8C1823; text-decoration: none;"><img src="https://res.cloudinary.com/odevserver/image/upload/v1747045189/twitter_iuauv6.png"></a>
                        <a href="#" class="social-icon" style="color: #8C1823; text-decoration: none;"><img src="https://res.cloudinary.com/odevserver/image/upload/v1747045189/Vector_amgwmq.png"></a>
                        <a href="#" class="social-icon" style="color: #8C1823; text-decoration: none;"><img src="https://res.cloudinary.com/odevserver/image/upload/v1747045189/instagram_mf7wq7.png"></a>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>
      </td>
      <td>
      <td>&nbsp;</td>
    </tr>
  </table>
</body>

</html>`;

export const OrderProgressTemplate = (
  id: any,
  type: string,
  productName: string,
  usd: number | undefined,
  naira: number,
  status: string,
  reason: string,
): any => {
  const emailContent = `<td class="wrapper" style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h3><span style="text-transform: capitalize;">${productName} </span> ${
                        type === 'coin' ? '' : type
                      } sale ${status === 'declined' ? ' declined' : 'approved'}</h3>
                      <p>${
                        status === 'declined'
                          ? `Unfortunately, your ${productName} ${type} sale order was declined. The summary below contains reasons why your order was declined. Thank you for choosing us.`
                          : 'Congratulations chairman, your order has been approved, your wallet wil credited in a few moment. Thank you for choosing  us, Cheers to good life 🥂🎉.'
                      }
            <h3 style="margin-top: 10px;">Transaction Summary</h3>
            <table style="margin-top: 30px;width:100%;text-align: left;border-collapse: collapse;max-width:100%;">
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Order ID</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;word-break: break-word;"> 
                        ${id}
                    </td>
                </tr>
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Product Name</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;">${productName}</td>
                </tr>
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Value (USD)</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;">USD ${usd}</td>
                </tr>
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Expected Return (NGN)</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;">NGN ${naira}</td>
                </tr>
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Order Status</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;color:#ffc107; font-weight:500;">${status}</td>
                </tr>

                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Reason</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;word-break: break-word;">${reason}</td>
                </tr>
            </table><br>
                      <p>Thank you for choosing MyEC <br><br><br><strong>Best Regards,<br>Humans of MyEC</strong></p>

                    </td>
                  </tr>
                </table>
              </td>`;
  return emailTemplate(emailContent);
};

export const WalletCreditTemplate = (
  id: any,
  amount: number,
  name: string,
  usd: number | undefined,
  naira: number,
): any => {
  const newAmount = amount.toLocaleString();
  const newNaira = naira.toLocaleString();
  const emailContent = `<td class="wrapper" style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h3>Your Wallet Has Been Credited 🤑</h3>
                      <p>Congratulations <strong>chairman</strong>, your wallet has been credited with ₦${newAmount} , you can proceed to withdraw your fund whenever you see fit.</p>
            <h3 style="margin-top: 10px;">Transaction Summary</h3>
            <table style="margin-top: 30px;width:100%;text-align: left;border-collapse: collapse;max-width:100%;">
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Order ID</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;word-break: break-word;"> 
                        ${id}
                    </td>
                </tr>
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Product Name</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;">${name}</td>
                </tr>
                ${
                  usd
                    ? `<tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Value (USD)</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;">USD ${usd}</td>
                </tr>`
                    : ''
                }
                <tr style="border: 1px solid #1b1c1d;">
                    <th style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;">Expected Return (NGN)</th>
                    <td style="border: 1px solid #1b1c1d; padding:10px 20px;width:100px;text-transform: capitalize;">NGN ${newNaira}</td>
                </tr>
            
            </table><br>
                      <p>Thank you for choosing  us, Cheers to good life 🥂🎉 <br><br><br><strong>Best Regards,<br>Humans of MyEC</strong></p>

                    </td>
                  </tr>
                </table>
              </td>`;
  return emailTemplate(emailContent);
};

export const EmailOtp = (code: string, time: string): any => {
  const emailContent = `
  <td class="wrapper" style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h3>Verification Code</h3>
                      <p>Hello <strong>Chairman</strong>, You recently requested an otp on the MyEC app. To complete this action, please enter the secure one-time-password below. Please note that the OTP expires in ${time}
                      <h2 style="background-color: #8C1823; color: #fff; padding: 15px 0; margin: 20px auto; width: 250px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px;">${code}</h2>
                      <p style="font-family:Sora,sans-serif;margin:0; margin-bottom: 15px; text-align:justify">If you did not request this action or believe this is a mistake, please contact our support team immediately at <a href="mailto:support@myecurrencyng.com">support@myecurrencyng.com</a>.
                      </p>
                      <p>Thank you for choosing MyEC. <br><br><br><strong>Best Regards,<br>Humans of MyEC</strong></p>

                    </td>
                  </tr>
                </table>
              </td>
  `;
  return emailTemplate(emailContent);
};

export const AuthenticationEmail = (
  code: string,
  time: string,
  manager: any,
  browser: string,
): any => {
  const emailContent = `<td class="wrapper" style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h3>Dashboard Access Request</h3>
                      <p> Dear Line Manager, ${manager.name} is attempting to access the Administrator Dashboard. <br>As part of our security protocol, 
          please review the login details below and provide the required OTP to complete the login process.</p>
    <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; border: 1px solid #ddd;">
      <thead>
        <tr style="background-color: #f4f4f4;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;" colspan="2">
            <b>Manager Information</b>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%"><b>Fullname:</b></td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 50%">${manager.name}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%"><b>Job Title:</b></td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 50%">${manager.job_title ?? 'Unknown'}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 30%"><b>Browser:</b></td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 50%">${browser}</td>
        </tr>
        <tr style="background-color: #f9f9f9;">
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; width: 40%"><b>One-Time Password (OTP):</b></td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: left; color: red; font-weight: bold; width: 50%">${code}</td>
        </tr>
      </tbody>
    </table><br>
     <p> This OTP is valid for the next ${time} and must be provided to ${manager.name} to complete their login. Thank you for helping us maintain a secure access.</p>
                      <p style="font-family:Sora,sans-serif;margin:0; margin-bottom: 15px; text-align:justify">If you did not request this action or believe this is a mistake, please contact our support team immediately at <a href="mailto:support@myecurrencyng.com">support@myecurrencyng.com</a>.
                      </p>
                      <p>Thank you for choosing MyEC <br><br><br><strong>Best Regards,<br>Humans of MyEC</strong></p>

                    </td>
                  </tr>
                </table>
              </td>`;

  return emailTemplate(emailContent);
};

export const PasswordReset = (password: string): any => {
  const emailContent = `<td class="wrapper" style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h3>Secure Password Reset Instructions</h3>
                      <p>Your password has been successfully reset. Please find your temporary password below:</p>
                      <h2 style="background-color: #8C1823; color: #fff; padding: 15px 0; margin: 20px auto; width: 250px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px;">${password}</h2><br>
                      <p>For security reasons, we <b>strongly recommend</b> changing this password immediately upon logging in. Ensure that your new password is <b>strong</b> and <b>unique</b>, and <b>never share</b> it with anyone.</p>
                      <p style="font-family:Sora,sans-serif;margin:0; margin-bottom: 15px; text-align:justify">If you did not request this action or believe this is a mistake, please contact our support team immediately at <a href="mailto:support@myecurrencyng.com">support@myecurrencyng.com</a>.
                      </p>
                      <p>Thank you for choosing MyEC <br><br><br><strong>Best Regards,<br>Humans of MyEC</strong></p>
                    </td>
                  </tr>
                </table>
              </td>`;

  return emailTemplate(emailContent);
};

export const resetAccessCode = (name: string): any => {
  const emailContent = `<td class="wrapper" style="padding: 20px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td>
                      <h3>Account Access Code Reset</h3>
                      <p>Dear ${name},</p>
                      <p>We want to inform you that your account access code has been successfully removed. You can now proceed to set up a new access code to further secure your account.</p>
                      <p style="font-family:Sora,sans-serif;margin:0; margin-bottom: 15px; text-align:justify">If you did not request this action or believe this is a mistake, please contact our support team. Click here to chat with a Support Agent via<a href="http://wa.me/2348035483635"><strong> Whatsapp</a></strong> or Send us a mail at <a href="mailto:support@myecurrencyng.com">support@myecurrencyng.com</a>.
                      </p>
                      <p>Thank you for choosing MyEC <br><br><br><strong>Best Regards,<br>Humans of MyEC</strong></p>
                    </td>
                  </tr>
                </table>
              </td>`;

  return emailTemplate(emailContent);
};
