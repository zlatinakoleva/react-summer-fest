import { useEffect, useState } from "react";
import * as singersAPI from '../api/singers-api';


export function useGetAllSingers() {
    const [singers, setSingers] = useState([]);

    useEffect(() => {
        (async()=>{
            try {
                const result = await singersAPI.getAll();
                setSingers(result);
            } catch (err) {
                console.log(err);
            }
        })();
    },[])

    return [singers, setSingers];    
}

export function useGetOneSinger(singerID) {
    const [singer, setSinger] = useState([]);

    useEffect(() => {
        (async()=>{
            try {
                const result = await singersAPI.getOne(singerID);
                setSinger(result);
            } catch (err) {
                console.log(err);
            }
        })();
    },[singerID])

    return [singer, setSinger];    
}