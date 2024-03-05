import Metadata from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script src="https://source.zoom.us/3.1.4/lib/vendor/lodash.min.js"></Script>
      <body>
        <div id="ZoomEmbeddedApp">ZoomEmbeddedApp</div>
        {children}
      </body>
    </html>
  );
}
