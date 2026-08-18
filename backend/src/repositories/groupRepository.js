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

export{
    createGroup,
    createGroupMember,
    findGroupMember,
    findGroupMemberByUser
};