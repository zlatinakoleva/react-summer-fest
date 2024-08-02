import * as request from '../api/requester';
const baseUrl = 'http://localhost:3030/data/comments'

export const getAll = async () => {
    const params = new URLSearchParams({
        load: `author=_ownerId:users,singer=_singerId:singers`,
    })
    const result = await request.get(`${baseUrl}?${params.toString()}`);

    return result;
};

export const getForOneSinger = async (singerId) => {
    const params = new URLSearchParams({
        where: `_singerId="${singerId}"`,
        load: `author=_ownerId:users`
    })
    const result = await request.get(`${baseUrl}?${params.toString()}`);

    return result;
};

export const edit = async (commentData) => {
    const result = await request.patch(`${baseUrl}`, commentData);
   
    return result;
};

export const create = async (content, singerId, authorUsername) => {
    const result = await request.post(baseUrl, {
        _singerId: singerId,
        content,
        author: {
            username: authorUsername
        }
    });

    return result;
};


export const remove = async (singerId) => request.remove(`${baseUrl}/${singerId}`);

