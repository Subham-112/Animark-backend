interface WelcomeSellerTemplateProps {
  name?: string;
  dashboardUrl: string;
}

export const welcomeSellerTemplate = ({
  name = "Seller",
  dashboardUrl,
}: WelcomeSellerTemplateProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Welcome to Animark Seller</title>
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
              🚀 Welcome to Animark Seller
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
                Welcome to <strong>Animark</strong>! Your seller account has been
                created successfully.
              </p>

              <p
                style="
                  margin: 0 0 20px;
                  font-size: 16px;
                  line-height: 26px;
                "
              >
                You're now ready to start your journey as a creator. Upload your
                digital assets, showcase your creativity, manage your products,
                and track your sales—all from your seller dashboard.
              </p>

              <p
                style="
                  margin: 0 0 20px;
                  font-size: 16px;
                  line-height: 26px;
                "
              >
                Before publishing products, make sure your seller profile is
                complete and follows our marketplace guidelines.
              </p>

              <div
                style="
                  margin: 35px 0;
                  text-align: center;
                "
              >
                <a
                  href="${dashboardUrl}"
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
                  Open Seller Dashboard
                </a>
              </div>

              <p
                style="
                  margin: 0;
                  font-size: 15px;
                  line-height: 24px;
                  color: #666666;
                "
              >
                Need help getting started? Simply reply to this email or contact
                our support team. We're here to help you succeed.
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