import "@/styles/reset.scss";
import "@/styles/global.scss";

import { Toaster } from "sonner";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SVGenius",
    description: "Perfect SVG morphing starts here.",
    keywords: ["SVG", "path manipulation", "morphing", "animation", "vector graphics", "svg morphing", "svg path editor", "svg path start point redefinition", "svg path reordering"],
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
        description: "Perfect SVG morphing starts here.",
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
        description: "Perfect SVG morphing starts here.",
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
    // verification: {
    //     google: "your-google-verification-code",
    //     yandex: "your-yandex-verification-code",
    //     yahoo: "your-yahoo-verification-code",
    // },
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
