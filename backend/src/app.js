import express from "express";
import cors from "cors";
import helmet from "helmet";
import notFoundHandler from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js"

//swagger
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

app.use("/api/v1/groups", groupRoutes);

app.use("/api/v1", expenseRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);


export default app;