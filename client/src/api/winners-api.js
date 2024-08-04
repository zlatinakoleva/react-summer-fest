import * as request from '../api/requester';
const baseUrl = 'http://localhost:3030/data/winners'

export const getAll = async () => {
    const result = await request.get(`${baseUrl}`);

    return result;
};

export const create = async (winnerData) => {
    const result = await request.post(baseUrl, winnerData);

    return result;
};