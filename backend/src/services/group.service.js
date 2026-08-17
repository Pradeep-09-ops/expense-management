import {createGroup,createGroupMember, findGroupMember, findGroupMemberByUser} from "../repositories/group.repository.js";

import { findById } from "../repositories/user.repository.js";

const createNewGroup = async({name, currency}, userId) =>{
    const group = await createGroup({
        name,
        currency,
        ownerId : userId
    });
    await createGroupMember({
        groupId: group._id,
        userId,
        role : "ADMIN",
        status : "ACTIVE"
    });
    return group;
};

const addMemberToGroup = async (groupId, currentUserId, newUserId) => {
    // 1. Check whether current user is a member
    const currentMember = await findGroupMember(
        groupId,
        currentUserId
    );

    if (!currentMember) {
        const error = new Error(
            "You are not a member of this group"
        );
        error.statusCode = 403;
        throw error;
    }

    // 2. Check whether current user is admin
    if (currentMember.role !== "ADMIN") {
        const error = new Error(
            "Only group admins can add members"
        );
        error.statusCode = 403;
        throw error;
    }

    // 3. Check whether new user exists
    const newUser = await findById(newUserId);

    if (!newUser) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // 4. Check whether user is already a member
    const existingMember = await findGroupMemberByUser(
        groupId,
        newUserId
    );

    if (existingMember) {
        const error = new Error(
            "User is already a member of this group"
        );
        error.statusCode = 409;
        throw error;
    }

    // 5. Add user as MEMBER
    const member = await createGroupMember({
        groupId,
        userId: newUserId,
        role: "MEMBER",
        status: "ACTIVE"
    });

    return member;
};

export{
    createNewGroup,
    addMemberToGroup
};