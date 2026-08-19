import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Expense Management API",
            version: "1.0.0",
            description:
                "REST API for managing users, groups, expenses, summaries and settlements"
        },

        servers: [
            {
                url: "http://localhost:3000",
                description: "Local development server"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: [
        path.join(__dirname, "../routes/*.js")
    ]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;