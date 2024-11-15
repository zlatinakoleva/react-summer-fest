import { useEffect, useReducer, useState } from "react";
import * as merchAPI from  '../api/merch-api';

function reducer(state, action) {
    switch (action.type) {
        case 'GET_ALL':
            return action.payload;
        case 'EDIT_ITEM':
            return {
                ...state.filter(item => item.id !== action.payload.id),
                "item": action.payload
            };
        case 'ADD_ITEM':
            return [...state, action.payload];
        default:
            return state;
    }
}

export function useGetAllMerchItems(pageKey) {
    const [merchItems, dispatch] = useReducer(reducer,[]); 

    useEffect(() => {
        (async() => {
            try {
                const result = await merchAPI.getAll()
                dispatch({type: 'GET_ALL', payload: result})
            } catch (err) {
                console.log(err);
            }
        })();
    }, [pageKey]);

    return [merchItems, dispatch]
}

export function useGetOneMerchItem(merchItemID) {
    const [merchItem, setMerchItem] = useState({
        title: '',
        description: '',
        image: ''
    });
    
    useEffect(() => {
        merchAPI.getOne(merchItemID)
            .then(result => setMerchItem(result))
            .catch(err => {
                console.log(err);
            });
    }, []);

    return [merchItem]
}

export function useCreateMerchItem() {
    const createMerchItem = (merchItemData) => merchAPI.create(merchItemData);
    
    return createMerchItem;
}

export function useEditMerchItem() {
    const editMerchItem = (merchItemData, merchItemID) => merchAPI.edit(merchItemData, merchItemID);
    
    return editMerchItem;
}

export function useDeleteMerchItem() {
    const deleteMerchItem = (merchItemID) => merchAPI.remove(merchItemID);

    return deleteMerchItem
}