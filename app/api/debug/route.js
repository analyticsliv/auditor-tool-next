import { headers } from "next/headers";

export async function GET() {
    return Response.json({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        // NODE_ENV: process.env.NODE_ENV,
        allEnvKeys: Object.keys(process.env).filter(key =>
            key.includes('NEXT') || key.includes('GOOGLE')
        ),
        headers: {
            host: headers().get('host'),
            'x-forwarded-host': headers().get('x-forwarded-host'),
            'x-forwarded-proto': headers().get('x-forwarded-proto'),
        }
    });
}