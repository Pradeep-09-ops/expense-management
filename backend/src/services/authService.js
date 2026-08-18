import bcrypt from "bcrypt";
import { findByEmail, findById, createUser } from "../repositories/userRepository.js";
import generateToken from "../utils/jwt.js";

//Register
const registerUser = async ({ name, email, password }) => {
    const existingUser = await findByEmail(email);

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
        name,
        email,
        password: hashedPassword
    });

    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};

//Login
const loginUser = async ({ email, password }) => {
    const user = await findByEmail(email);

    if (!user) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = generateToken(user._id.toString());

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        }
    };
};

const getCurrentUser = async (userId) => {
    const user = await findById(userId);

    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return {
        id: user._id,
        name: user.name,
        email: user.email
    };
};

export {
    registerUser,
    loginUser,
    getCurrentUser
};