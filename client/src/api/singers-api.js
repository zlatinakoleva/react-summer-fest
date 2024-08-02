import * as request from '../api/requester';
const baseUrl = 'http://localhost:3030/data/singers'

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const getOne = async (singerID) => {
    const result = await request.get(`${baseUrl}/${singerID}`);

    return result;
};

export const edit = async (singerData, singerID) => {
    const result = await request.patch(`${baseUrl}/${singerID}`, singerData);
    return result;
};

export const create = async (singerData) => {
    const result = await request.post(baseUrl, singerData);

    return result;
};


export const remove = async (singerID) => request.remove(`${baseUrl}/${singerID}`);

