import * as request from '../api/requester';
const baseUrl = 'http://localhost:3030/data/comments'

export const getAll = async (filter) => {
    const params = new URLSearchParams({
        load: `author=_ownerId:users,singer=_singerId:singers`,
    })
    const fetchURL = filter== 'asc' ? `${baseUrl}?${params.toString()}` : `${baseUrl}?sortBy=_createdOn%20desc&${params.toString()}`
    const result = await request.get(fetchURL);

    return result;
};

export const getForOneSinger = async (singerId) => {
    const params = new URLSearchParams({
        where: `_singerId="${singerId}"`,
        load: `author=_ownerId:users`
    })
    const result = await request.get(`${baseUrl}?sortBy=_createdOn%20desc&${params.toString()}`);

    return result;
};

export const edit = async (commentData, commentId) => {

    const result = await request.patch(`${baseUrl}/${commentId}`, commentData);
   
    return result;
};

export const create = async (content, singerId, authorUsername, authorId) => {
    const result = await request.post(baseUrl, {
        _singerId: singerId,
        content,
        author: {
            username: authorUsername,
            _id: authorId,
        }
    });

    return result;
};


export const remove = async (singerId) => request.remove(`${baseUrl}/${singerId}`);

