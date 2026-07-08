interface WelcomeUserTemplateProps {
  name?: string;
  loginUrl: string;
}

export const welcomeUserTemplate = ({
  name = "User",
  loginUrl,
}: WelcomeUserTemplateProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Welcome to Animark</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
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
            border-radius: 12px;
            overflow: hidden;
            // margin: 40px 0;
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
              🎉 Welcome to Animark
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
                Thank you for joining <strong>Animark</strong>! We're excited to
                have you as part of our creative community.
              </p>

              <p
                style="
                  margin: 0 0 20px;
                  font-size: 16px;
                  line-height: 26px;
                "
              >
                You can now discover high-quality digital assets, purchase
                creative products, and learn from animation courses offered by
                talented creators.
              </p>

              <div
                style="
                  margin: 35px 0;
                  text-align: center;
                "
              >
                <a
                  href="${loginUrl}"
                  style="
                    display: inline-block;
                    background: #111827;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 16px 36px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                  "
                >
                  Explore Marketplace
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
                If you have any questions, simply reply to this email. We're
                always happy to help.
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
                color: #888888;
                font-size: 13px;
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
