import Joi from "joi";
export const registerSchema = Joi.object({
	username: Joi.string().lowercase().min(3).max(80).required(),
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required(),
	password: Joi.string().min(8).max(32),
    token: Joi.string().optional(),
});
export const loginSchema = Joi.object({
	email: Joi.string()
		.email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		.required(),
	password: Joi.string().min(8).max(32),
	token: Joi.string().optional(),
});
