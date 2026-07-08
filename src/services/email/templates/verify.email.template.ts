interface VerifyEmailTemplateProps {
  name?: string;
  verifyUrl: string;
  expiryHours?: number;
}

export const verifyEmailTemplate = ({
  name = "User",
  verifyUrl,
  expiryHours = 24,
}: VerifyEmailTemplateProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Verify Your Email</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background: #f5f5f5;
    font-family: Arial, Helvetica, sans-serif;
  "
>
  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
  >
    <tr>
      <td align="center">

        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            background: #ffffff;
            margin: 40px 0;
            border-radius: 12px;
            overflow: hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                background: #111827;
                color: #ffffff;
                padding: 28px;
                font-size: 30px;
                font-weight: bold;
              "
            >
              📧 Verify Your Email
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td
              style="
                padding: 40px;
                color: #333333;
              "
            >

              <h2
                style="
                  margin: 0 0 20px;
                "
              >
                Hello ${name},
              </h2>

              <p
                style="
                  margin: 0 0 20px;
                  font-size: 16px;
                  line-height: 26px;
                "
              >
                Welcome to <strong>Animark</strong>! Before you can start using
                your account, please verify your email address.
              </p>

              <p
                style="
                  margin: 0 0 20px;
                  font-size: 16px;
                  line-height: 26px;
                "
              >
                Verifying your email helps us secure your account and ensures
                you receive important notifications about your purchases,
                orders, and account activity.
              </p>

              <div
                style="
                  margin: 35px 0;
                  text-align: center;
                "
              >
                <a
                  href="${verifyUrl}"
                  style="
                    display: inline-block;
                    padding: 16px 36px;
                    background: #111827;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p
                style="
                  margin: 0 0 16px;
                  font-size: 15px;
                  line-height: 24px;
                "
              >
                This verification link will expire in
                <strong>${expiryHours} hours</strong>.
              </p>

              <p
                style="
                  margin: 0;
                  font-size: 15px;
                  line-height: 24px;
                  color: #666666;
                "
              >
                If you didn't create an Animark account, you can safely ignore
                this email.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                background: #f9fafb;
                padding: 24px;
                font-size: 13px;
                color: #888888;
              "
            >
              © ${new Date().getFullYear()} Animark. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>

</html>
`;
};