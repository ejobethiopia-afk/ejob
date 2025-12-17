"use server";

/**
 * Verifies a reCAPTCHA token with Google's API
 * @param token The reCAPTCHA response token from the client
 * @returns Object with success status and optional error message
 */
export async function verifyCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
        console.error("RECAPTCHA_SECRET_KEY is not configured");
        return { success: false, error: "CAPTCHA verification not configured" };
    }

    if (!token) {
        return { success: false, error: "CAPTCHA token is required" };
    }

    try {
        const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${secretKey}&response=${token}`,
        });

        const data = await response.json();

        if (!data.success) {
            console.error("reCAPTCHA verification failed:", data["error-codes"]);
            return {
                success: false,
                error: "CAPTCHA verification failed. Please try again."
            };
        }

        return { success: true };
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        return {
            success: false,
            error: "Failed to verify CAPTCHA. Please try again."
        };
    }
}
