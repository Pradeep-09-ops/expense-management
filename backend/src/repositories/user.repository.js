import User from "../models/User.js";

const findByEmail = async (email) => {
    return await User.findOne({ email });
};

const findById = async (userId) =>{
    return await User.findById(userId);
};

const createUser = async (userData) => {
    return await User.create(userData);
};

export {
    findByEmail,
    findById,
    createUser
};