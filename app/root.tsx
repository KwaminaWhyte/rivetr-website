import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { SiteNav } from "./components/site-nav";
import { SiteFooter } from "./components/site-footer";
import { getTheme } from "./cookies.server";
import { themeColorFor, type Theme } from "./lib/theme";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
  { rel: "icon", href: "/favicon-16.png", type: "image/png", sizes: "16x16" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
];

export const meta: Route.MetaFunction = () => [
  { title: "Rivetr: Self-hosted PaaS in a single binary" },
  {
    name: "description",
    content:
      "Deploy apps from Git with one binary. 52 MB RSS with 30 containers, no Redis, no PostgreSQL, no Traefik. Docker and Podman, automatic HTTPS, zero-downtime deploys. Open source, MIT.",
  },
  { property: "og:title", content: "Rivetr: Self-hosted PaaS in a single binary" },
  {
    property: "og:description",
    content:
      "A self-hosted Coolify and Dokploy alternative in one Rust binary: 52 MB RSS, 365 one-click services, and zero external services.",
  },
  { property: "og:type", content: "website" },
  { property: "og:site_name", content: "Rivetr" },
  { property: "og:image", content: "/og-image.png" },
  { property: "og:image:width", content: "1200" },
  { property: "og:image:height", content: "630" },
  { name: "twitter:card", content: "summary_large_image" },
  { name: "twitter:title", content: "Rivetr: Self-hosted PaaS in a single binary" },
  {
    name: "twitter:description",
    content:
      "Deploy from Git with one binary. 52 MB RSS with 30 containers. No Redis, PostgreSQL, or Traefik.",
  },
  { name: "twitter:image", content: "/og-image.png" },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Rivetr",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Linux",
  softwareVersion: "1.0.0",
  license: "https://opensource.org/license/mit",
  url: "https://github.com/KwaminaWhyte/rivetr",
  description:
    "Self-hosted platform as a service in a single Rust binary. Deploy from Git with an embedded database, reverse proxy, and automatic HTTPS.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export async function loader({ request }: Route.LoaderArgs) {
  const theme = getTheme(request);
  return { theme, origin: new URL(request.url).origin };
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Layout renders for loader errors too, where loaderData may be undefined.
  const loaderData = useRouteLoaderData<typeof loader>("root");
  const theme: Theme = loaderData?.theme === "light" ? "light" : "dark";

  return (
    <html lang="en" data-theme={theme} style={{ colorScheme: theme }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content={themeColorFor(theme)} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
