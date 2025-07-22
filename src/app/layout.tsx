import "@/styles/reset.scss";
import "@/styles/global.scss";

import { Toaster } from "sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SVGenius",
    description: "Transform your SVG paths with intelligence. Advanced path morphing, real-time preview, and powerful tools for SVG manipulation.",
    keywords: ["SVG", "path manipulation", "morphing", "animation", "design tools", "vector graphics"],
    authors: [{ name: "yoonhr" }],
    creator: "SVGenius",
    publisher: "SVGenius",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://svgenius.gnyng.com"),
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "SVGenius",
        description: "Transform your SVG paths with intelligence. Advanced path morphing, real-time preview, and powerful tools for SVG manipulation.",
        url: "https://svgenius.gnyng.com",
        siteName: "SVGenius",
        images: [
            {
                url: "/og.jpg",
                width: 1200,
                height: 630,
                alt: "SVGenius ",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "SVGenius",
        description: "Transform your SVG paths with intelligence. Advanced path morphing, real-time preview, and powerful tools for SVG manipulation.",
        images: ["/og.jpg"],
        creator: "@svgenius",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    verification: {
        google: "your-google-verification-code",
        yandex: "your-yandex-verification-code",
        yahoo: "your-yahoo-verification-code",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.ico" type="image/x-icon" />
                <link rel="apple-touch-icon" href="/favicon.ico" />
            </head>

            <body>
                {children}

                <Toaster position="top-right" />
            </body>
        </html>
    );
}
