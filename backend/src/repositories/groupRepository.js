import Group from "../models/groupModel.js"
import GroupMember from "../models/groupMemberModel.js"

const createGroup = async(groupData)=>{
    return await Group.create(groupData);
};

const createGroupMember = async(memberData)=>{
    return await GroupMember.create(memberData);
};

const findGroupMember = async (groupId, userId) => {
    return await GroupMember.findOne({
        groupId,
        userId,
        status: "ACTIVE"
    });
};

const findGroupMemberByUser = async (groupId, userId) => {
    return await GroupMember.findOne({
        groupId,
        userId
    });
};

const findGroupsByUser = async (userId) => {
    return await GroupMember.find({
        userId,
        status: "ACTIVE"
    }).populate("groupId");
};

const findGroupById = async (groupId) => {
    return await Group.findById(groupId);
};

const findGroupMembers = async (groupId) => {
    return await GroupMember.find({
        groupId,
        status: "ACTIVE"
    }).populate("userId", "name email");
};

export{
    createGroup,
    createGroupMember,
    findGroupMember,
    findGroupMemberByUser,
    findGroupsByUser,
    findGroupById,
    findGroupMembers
};