import {
    activateInvitedUser,
    createUserInvitation,
    resendUserInvitation
} from '../services/user-invitation.service.js';

import {sendSuccess} from '../utils/response.js';

export const createUserInvitationController = async (request, response) => {
    const user = await createUserInvitation(
        request.body,
         request.user.id
    );
    return sendSuccess(response, {
        user, 
        message: 'Invitation email sent'
    }, 201);
}

export const resendUserInvitationController = async (request, response) => {
    const user = await resendUserInvitation(
        request.validated.params.id,
        request.user.id
    );
    return sendSuccess(response, {
        user,
        message: 'Invitation email sent again'
    });
}

export const activateAccountController = async (request, response) => {
    const {token, password} = request.body;

    await activateInvitedUser ({token, password });

    return sendSuccess(response, {
        message: 'Account activated. You can now sign in.'
    });
}

