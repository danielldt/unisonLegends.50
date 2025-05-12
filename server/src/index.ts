import "reflect-metadata";
import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import path from "path";
import { GameRoom } from "./rooms/GameRoom";
import { AppDataSource } from "./config/database";
import authRoutes from "./routes/auth";
import dungeonRoutes from "./routes/dungeon";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize database
AppDataSource.initialize()
    .then(() => {
        
    })
    .catch((error) => {
        console.error("Error initializing database:", error);
    });

const port = Number(process.env.PORT || 3001);

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dungeons", dungeonRoutes);

// Create HTTP server
const server = createServer(app);

// Create game server
const gameServer = new Server({
    server: server
});

// Register your room handlers
gameServer.define("game_room", GameRoom);

// Start the server
server.listen(port);
 