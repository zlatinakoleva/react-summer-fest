import { useEffect, useState } from "react";
import * as merchAPI from  '../api/merch-api';

export function useGetAllMerchItems() {
    const [merchItems, setMerchItems] = useState([]);
    
    useEffect(() => {
        merchAPI.getAll()
            .then(result => setMerchItems(result))
            .catch(err => {
                console.log(err);
            });
    }, []);

    return [merchItems]
}

export function useGetOneMerchItem(merchItemID) {
    const [merchItem, setMerchItem] = useState([]);
    
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
    
    const editMerchItem = (merchItemData, merchItemID) => {
        merchAPI.edit(merchItemData, merchItemID);
    }
    
    return editMerchItem;
}

export function useDeleteMerchItem() {
    const deleteMerchItem = (merchItemID) => merchAPI.remove(merchItemID);
    
    return deleteMerchItem
}