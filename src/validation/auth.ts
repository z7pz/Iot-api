import Joi from "joi";
export const registerSchema = Joi.object({
    // name:Joi.string().min(3).max(80).required(),
    username: Joi.string().lowercase().min(3).max(80).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().min(8).max(32),
    repeat_password: Joi.ref('password'),
    gender: Joi.string().valid("male", "female"),
    birthdate: Joi.date(),
    topics: Joi.array().items(Joi.string())
});
export const loginSchema = Joi.object({
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: Joi.string().min(8).max(32),
});