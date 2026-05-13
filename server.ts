import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import { setupRoutes } from "./src/server/routes";
import { initializeDatabase } from "./src/server/db";

async function startServer() {
    const app = express();
    const PORT = 3000;

  // Middleware
    app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }),
    );
    app.use(cors());
    app.use(express.json());

  // Initialize Database
    initializeDatabase();

  // API Routes
    setupRoutes(app);

  // Serve uploads
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
    });
    app.use(vite.middlewares);
    } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
