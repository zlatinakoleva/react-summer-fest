import { useDeleteComment, useEditComment, useGetOneSingerComments } from "../../hook/useComments";
import { useState } from 'react';
import DeleteModal from "../delete-modal/DeleteModal";
import { useAuthContext } from "../../contexts/authContext";
import { formatDate } from "../../utils/formatDate";

export default function Comment({
    comment,
    stateChanger
}) {
    const singerID = comment._singerId
    const deleteComment = useDeleteComment();
    const editComment = useEditComment();
    const [deleteClick, setDeleteClick] = useState(false);
    const [ editClick, setEditClick ] = useState(false);
    const { userId } = useAuthContext();

    function deleteCommentClickHandler() {
        setDeleteClick(true)
    }

    const preventCommentDelete = () => {
        setDeleteClick(false)
    }
    
    const confirmCommentDelete = () => {
        deleteComment(comment._id);
        stateChanger({type: 'DELETE_COMMENT', payload: comment._id})
        setDeleteClick(false)
    }

    function editCommentClickHandler() {
        setEditClick(!editClick)
    }

    const editCommentSubmit = async(e) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget);
        const values = Object.fromEntries(formData);
        const formDataObj = {content: `${values.updatedComment}`};
        const commentId = comment._id;
 
        try {
            const result = await editComment(formDataObj, commentId)
            stateChanger({type: 'EDIT_COMMENT', payload: result})
            setEditClick(!editClick)
        } catch(err) {
            console.log(err)
        }
    }
    
    return (
        <li>
            {deleteClick && <DeleteModal confirmDelete={confirmCommentDelete} closeDelete={preventCommentDelete} deleteTargetName={'your comment'}/>}

            <div className="comment">
                
                <div className="comment__head">
                    <h5>{comment.author?.username}</h5>
                    <small>{formatDate(comment._createdOn)}</small>
                    {comment.author._id == userId &&
                        <div className="comment__actions">
                            <button onClick={editCommentClickHandler}>Edit</button>
                            <button onClick={deleteCommentClickHandler}>Delete</button>
                        </div>
                    }
                </div>
                {!editClick
                    ? <p>{comment.content}</p>
                    : <div className="form-small">
                        <form onSubmit={editCommentSubmit}>
                            <div className="form__body">
                                <div className="form__field-holder">
                                    <label htmlFor="updatedComment"></label>
                                    <textarea type="text" name="updatedComment" id={`edit-${comment._id}`} defaultValue={comment.content} /> 
                                </div>
                            </div>
                            <div className="form__actions">
                                <span className="btn" onClick={editCommentClickHandler}>Close</span>   

                                <button type="submit" className="btn">Update</button>   
                            </div>
                        </form> 
                    </div>
                }
                
            </div>
        </li>
    )
}