import { useEffect, useState, useReducer } from "react";
import * as singersAPI from '../api/singers-api';

function singersReducer(state, action) {
    switch (action.type) {
        case 'GET_ALL':
            return action.payload;
        case 'EDIT_SINGER':
            return {
                ...state.filter(item => item.id !== action.payload.id),
                "item": action.payload
            };
        case 'ADD_SINGER':
            return [action.payload, ...state];
        default:
            return state;
    }
}


export function useGetAllSingers(pageKey) {
    const [singers, dispatch] = useReducer(singersReducer,[]);

    useEffect(() => {
        (async()=>{
            try {
                const result = await singersAPI.getAll();
                dispatch({type: 'GET_ALL', payload: result})
            } catch (err) {
                console.log(err);
            }
        })();
    },[pageKey])

    return [singers, dispatch];    
}

export function useGetOneSinger(singerId,pageKey) {
    const [singer, setSinger] = useState([]);

    useEffect(() => {
        (async()=>{
            try {
                const result = await singersAPI.getOne(singerId);
                console.log(result)
                setSinger(result);
            } catch (err) {
                console.log(err);
            }
        })();
    },[singerId,pageKey])

    return [singer, setSinger];    
}

export function useEditSinger() {
    const editMerchItem = (singerData, singerID) => singersAPI.edit(singerData, singerID);
    
    return editMerchItem;
}

export function useAddSinger() {
    const editMerchItem = (singerData) => singersAPI.create(singerData);
    
    return editMerchItem;
}