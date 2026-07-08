interface OtpTemplateProps {
  name?: string;
  otp: string;
  expiryMinutes?: number;
}

export const otpTemplate = ({
  name = "User",
  otp,
  expiryMinutes = 10,
}: OtpTemplateProps): string => {
  return `
<!DOCTYPE html>
<html lang="en">

    <head>
    <meta charset="UTF-8" />
    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    />

    <title>Animark OTP</title>
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
                    padding: 24px;
                    font-size: 30px;
                    font-weight: bold;
                "
                >
                Animark
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
                    line-height: 24px;
                    font-size: 16px;
                    "
                >
                    We received a request to verify your identity.
                    Please use the OTP below to continue.
                </p>

                <div
                    style="
                    text-align: center;
                    margin: 40px 0;
                    "
                >
                    <span
                    style="
                        display: inline-block;
                        padding: 18px 40px;
                        background: #f3f4f6;
                        border-radius: 8px;
                        font-size: 34px;
                        font-weight: bold;
                        letter-spacing: 8px;
                        color: #111827;
                    "
                    >
                    ${otp}
                    </span>
                </div>

                <p
                    style="
                    margin: 0 0 16px;
                    line-height: 24px;
                    font-size: 15px;
                    "
                >
                    This OTP is valid for
                    <strong>${expiryMinutes} minutes</strong>.
                </p>

                <p
                    style="
                    margin: 0;
                    line-height: 24px;
                    font-size: 15px;
                    color: #666666;
                    "
                >
                    If you didn't request this OTP,
                    you can safely ignore this email.
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
