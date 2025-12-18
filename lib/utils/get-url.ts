/**
 * Get the site URL dynamically based on environment
 * Works in both local development and production (Vercel)
 */
export const getURL = () => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in Vercel for custom domain
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
        'http://localhost:3000/';

    // Make sure to include https:// when not localhost
    url = url.includes('http') ? url : `https://${url}`;

    // Ensure trailing slash
    url = url.charAt(url.length - 1) === '/' ? url : `${url}/`;

    return url;
};
