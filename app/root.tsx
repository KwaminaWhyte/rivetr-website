import {
  data,
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
import { getTheme, themeCookie } from "./cookies.server";
import { themeColorFor, type Theme } from "./lib/theme";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "icon", href: "/favicon-32.png", type: "image/png", sizes: "32x32" },
  { rel: "icon", href: "/favicon-16.png", type: "image/png", sizes: "16x16" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/site.webmanifest" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@400..700&display=swap",
  },
];

export const meta: Route.MetaFunction = () => [
  { title: "Rivetr: Self-hosted PaaS in a single binary" },
  {
    name: "description",
    content:
      "Deploy apps from Git with one binary. ~30MB RAM idle, no Redis, no PostgreSQL, no Traefik. Docker + Podman, automatic HTTPS, zero-downtime deploys. Open source, MIT.",
  },
  { property: "og:title", content: "Rivetr: Self-hosted PaaS in a single binary" },
  {
    property: "og:description",
    content:
      "A self-hosted Coolify/Dokploy alternative that runs on ~30MB of RAM with zero external dependencies.",
  },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary_large_image" },
];

export async function loader({ request }: Route.LoaderArgs) {
  const theme = await getTheme(request);
  return { theme };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const raw = formData.get("theme");
  const theme: Theme = raw === "light" ? "light" : "dark";
  return data(
    { theme },
    {
      headers: {
        "Set-Cookie": await themeCookie.serialize(theme),
      },
    },
  );
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
