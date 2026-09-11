import { createFileRoute } from "@tanstack/react-router";

// The "AI Hospital Queue Prediction System" is built as standalone,
// beginner-friendly HTML/CSS/JS files (public/site/). This route simply
// embeds that static site so it appears in the live preview. The actual
// project files — index.html, styles.css, script.js — can be opened
// directly in VS Code or any online HTML compiler without a server.
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Hospital Queue Prediction System" },
      {
        name: "description",
        content:
          "Predict waiting time and manage hospital queues efficiently using AI.",
      },
      { property: "og:title", content: "AI Hospital Queue Prediction System" },
      {
        property: "og:description",
        content:
          "Predict waiting time and manage hospital queues efficiently using AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      src="/site/index.html"
      title="AI Hospital Queue Prediction System"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        border: "none",
      }}
    />
  );
}
