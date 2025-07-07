import Joi from "joi";

export const validateSchema = Joi.object({
    username: Joi.string().trim().min(3).max(15).required().messages({
        'string.empty': `Username cannot be an empty field`,
        'string.min': `Username must be at least 3 characters long`,
        'string.max': `Username must be at most 15 characters long`,
        'any.required': 'Username is a required field'
    }),
    email: Joi.string().trim().lowercase().email({tlds: { allow: ['com', 'net'] }}).required().messages({
        'string.empty': `Email cannot be an empty field`,
        'string.email': `Email must be a valid email address`,
        'any.required': 'Email is a required field'
    }),
    password: Joi.string().min(6).max(20).required().label('password').regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,15}$/).messages({
        "string.empty": "Password cannot be an empty field",
        "string.min": "Password Must have at least 6 characters",
        "string.pattern.base": "Must have a Strong Password",
        'any.required': 'Password is a required field'
    }),
    confirmPassword: Joi.any().equal(Joi.ref('password')).required().messages({ 
        'any.only': 'Confirm password does not match',
        'any.required': 'Confirm password is a required field'
    }),
});