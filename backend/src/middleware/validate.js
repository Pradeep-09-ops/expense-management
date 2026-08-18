const validate = (schema, source = "body") => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req[source]);

            req[source] = validatedData;

            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: error.issues
            });
        }
    };
};

export default validate;