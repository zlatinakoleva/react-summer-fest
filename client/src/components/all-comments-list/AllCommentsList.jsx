import './AllCommentsList.scss'
import { formatDate } from '../../utils/formatDate'
import { useGetAllComments } from '../../hook/useComments';
import { useState } from 'react';

export default function AllCommentsList() {
    const [ filter, setFilter ] = useState('desc');
    const [comments, setComments] = useGetAllComments(filter);
    
    function toggleSortHandler() {
        filter == 'asc' ? setFilter('desc') : setFilter('asc')
    }

    return (
        <>
            <div className="widget-comments">
                <div className="widget__filter">
                    <p>Filter:</p>
                    <button onClick={toggleSortHandler}>
                        {filter == 'asc' 
                            ? <span>Oldest First</span>
                            : <span>Newest First</span>
                        }
                    </button>
                </div>
                {comments.length > 0
                    ? <ul className="list-comments">
                        {comments.map(comment => (
                            <li key={comment._id}>
                                <div className="comment">
                                    <div className="comment__head">
                                        <h5>{comment.author?.username} <span> for {comment.singer?.name}</span></h5>
                                        <small>{formatDate(comment._createdOn)}</small>
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    : <>
                        <h4>No Comments Yet</h4>
                        <p>Be the first :)</p>
                    </>
                }
            </div>
        </>
    )
}