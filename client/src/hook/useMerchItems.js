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