import { useEffect, useReducer, useState } from "react";
import * as commentsAPI from '../api/comments-api';

function commentsReducer(state, action) {
    switch (action.type) {
        case 'GET_ALL':
            return action.payload;
        case 'EDIT_COMMENT':
            return state.map(comment => 
                comment._id === action.payload._id ? action.payload : comment
            );
        case 'ADD_COMMENT':
            return [action.payload, ...state];
        case 'DELETE_COMMENT':
            return [...state.filter(item => item._id !== action.payload)];
        default:
            return state;
    }
}

export function useGetAllComments(filter) {
    const [comments, dispatch] = useReducer(commentsReducer,[])

    useEffect(() => {
        (async()=>{
            try {
                const result = await commentsAPI.getAll(filter);
                dispatch({type: 'GET_ALL', payload: result})
            } catch (err) {
                console.log(err);
            }
        })();
    },[filter])

    return [comments, dispatch];    
}

export function useGetOneSingerComments(singerId) {
    const [singerComments, dispatch] = useReducer(commentsReducer,[])

    useEffect(() => {
        (async()=>{
            try {
                const result = await commentsAPI.getForOneSinger(singerId);
                dispatch({type: 'GET_ALL', payload: result})
            } catch (err) {
                console.log(err);
            }
        })();
    },[singerId])

    return [singerComments, dispatch];    
}

export function useAddComment() {
    const addComment = (content, singerId, authorUsername, authorId) => commentsAPI.create(content,singerId,authorUsername, authorId);
    
    return addComment;
}

export function useEditComment() {
    const editComment = (commentData, commentID) => commentsAPI.edit(commentData, commentID);
    
    return editComment;
}

export function useDeleteComment() {
    const deleteComment = (commentID) => commentsAPI.remove(commentID);
    
    return deleteComment;
}