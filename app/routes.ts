import {
  type RouteConfig,
  index,
  route,
  layout,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("features", "routes/features.tsx"),
  route("about", "routes/about.tsx"),
  route("changelog", "routes/changelog.tsx"),
  layout("routes/docs.tsx", [
    route("docs", "routes/docs._index.tsx"),
    route("docs/:slug", "routes/docs.$slug.tsx"),
  ]),
] satisfies RouteConfig;
