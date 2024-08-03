import * as request from '../api/requester';
const baseUrl = 'http://localhost:3030/data/singers'

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const getOne = async (singerId) => {
    const result = await request.get(`${baseUrl}/${singerId}`);

    return result;
};

export const edit = async (singerData, singerId) => {
    const result = await request.patch(`${baseUrl}/${singerId}`, singerData);
    return result;
};

export const create = async (singerData) => {
    const result = await request.post(baseUrl, singerData);

    return result;
};


export const remove = async (singerId) => request.remove(`${baseUrl}/${singerId}`);

