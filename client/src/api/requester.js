import { getAccessToken, getUserType } from "../utils/authUtils";

const buildOptions = (data) => {
    const options = {};
 
    if (data) {
        options.body = JSON.stringify(data);
        options.headers = {
            ...options.headers,
            'content-type': 'application/json'
        }
    }

    const token = getAccessToken();
    const userType = getUserType();

    if (token) {
        options.headers = {
            ...options.headers,
            'X-Authorization': token
        };
    }

    if (userType == "user_admin" && token) {
        options.headers = {
            ...options.headers,
            'X-Admin': true
        };
    }

    return options;
}

const request = async (method, url, data) => {
    const response = await fetch(url, {
        ...buildOptions(data),
        method
    })

    if (response.status === 204) {
        return
    }

    const result = await response.json();
    
    if (!response.ok) {
        throw result;
    }
    
    return result;
}

export const get = request.bind(null, "GET");
export const post = request.bind(null, "POST");
export const patch = request.bind(null, "PATCH");
export const remove = request.bind(null, "DELETE");
export const put = request.bind(null, "PUT");
