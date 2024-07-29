import * as request from '../api/requester';
const baseUrl = 'http://localhost:3030/data/merch'

export const getAll = async () => {
    const result = await request.get(baseUrl);

    return result;
};

export const getOne = async (merchItemID) => {
    const result = await request.get(`${baseUrl}/${merchItemID}`);

    return result;
};

export const edit = async (merchItemData, merchItemID) => {
    const result = await request.put(`${baseUrl}/${merchItemID}`, merchItemData);
    return result;
};

export const create = async (merchItemData) => {
    const result = await request.post(baseUrl, merchItemData);

    return result;
};


export const remove = async (merchItemID) => request.remove(`${baseUrl}/${merchItemID}`);

