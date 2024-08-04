import { useEffect, useReducer, useState } from "react";
import * as winnersAPI from '../api/winners-api';

function winnersReducer(state, action) {
    switch (action.type) {
        case 'GET_ALL':
            return action.payload;
        case 'ADD_WINNER':
            return [...state, action.payload];
        default:
            return state;
    }
}

export function useGetAllWinners() {
    const [winners, dispatch] = useReducer(winnersReducer,[])

    useEffect(() => {
        (async()=>{
            try {
                const result = await winnersAPI.getAll();
                dispatch({type: 'GET_ALL', payload: result})
            } catch (err) {
                console.log(err);
            }
        })();
    },[])

    return [winners, dispatch];    
}

export function useAddWinner() {
    const addWinner = (winnerData) => winnersAPI.create(winnerData);
    
    return addWinner;
}