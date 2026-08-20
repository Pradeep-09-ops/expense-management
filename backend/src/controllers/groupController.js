import { createNewGroup, addMemberToGroup, getUserGroups, getGroupById } from "../services/groupService.js";

const createGroup = async(req, res, next) =>{
    try{
        const group = await createNewGroup(req.body, req.user.userId);
        res.status(201).json({
            success: true,
            message: "Group Created successfully!",
            data: group
        });
    } catch(error){
        next(error);
    }
};

const addMember = async (req, res, next) => {
    try {
        const member = await addMemberToGroup(
            req.params.id,
            req.user.userId,
            req.body.userId
        );

        res.status(201).json({
            success: true,
            message: "Member added successfully",
            data: member
        });
    } catch (error) {
        next(error);
    }
};

const getGroups = async (req, res, next) => {
    try {
        const groups = await getUserGroups(req.user.userId);

        res.status(200).json({
            success: true,
            message: "Groups fetched successfully",
            data: groups
        });
    } catch (error) {
        next(error);
    }
};

const getGroup = async (req, res, next) => {
    try {
        const group = await getGroupById(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Group fetched successfully",
            data: group
        });
    } catch (error) {
        next(error);
    }
};

export {
    createGroup,
    addMember,
    getGroups,
    getGroup
};