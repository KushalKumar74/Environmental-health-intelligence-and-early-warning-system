const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
        const errorMessage = error.details.map((detail) => detail.message).join(', ');
        return res.status(400).json({
            success: false,
            error: errorMessage,
            details: error.details.map((d) => d.message),
        });
    }
    next();
};

module.exports = validate;
