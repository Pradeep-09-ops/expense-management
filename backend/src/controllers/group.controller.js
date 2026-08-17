import { createNewGroup, addMemberToGroup } from "../services/group.service.js";

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

export {
    createGroup,
    addMember
};