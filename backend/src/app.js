import express from "express";
import cors from "cors";
import helmet from "helmet";
import notFoundHandler from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.get("/", (req, res)=>{
    res.status(200).json({
        success : true,
        message : "Api is running, and this is the root path!",
    });
});


// Test error route
app.get("/api/v1/test-error", (req, res, next) => {
    const error = new Error("This is a test error");

    next(error);
});
app.use("/api/v1/auth", authRoutes);
// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);



export default app;