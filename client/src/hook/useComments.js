import { useEffect, useState } from "react";
import * as commentsAPI from '../api/comments-api';


export function useGetAllComments() {
    const [comments, setComments] = useState([]);

    useEffect(() => {
        (async()=>{
            try {
                const result = await commentsAPI.getAll();
                setComments(result);
            } catch (err) {
                console.log(err);
            }
        })();
    },[])

    return [comments, setComments];    
}

export function useGetOneSingerComments(singerId) {
    const [singerComments, setSingerComments] = useState([]);

    useEffect(() => {
        (async()=>{
            try {
                const result = await commentsAPI.getForOneSinger(singerId);
                setSingerComments(result);
            } catch (err) {
                console.log(err);
            }
        })();
    },[singerId])

    return [singerComments, setSingerComments];    
}

export function useAddComment() {
    const addComment = (commentData, singerId, authorUsername) => commentsAPI.create(commentData,singerId,authorUsername);
    
    return addComment;
}