import "@/styles/reset.scss";
import "@/styles/global.scss";

import { Toaster } from "sonner";

export const metadata = {
  title: "SVGenius",
  description: "SVGenius : SVG 작업을 스마트하게 만들어주는 천재 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/ico" />
      </head>

      <body>
        {children}

        <Toaster position="top-right" />
      </body>
    </html>
  );
}
