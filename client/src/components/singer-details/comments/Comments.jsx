import './Comments.scss'
import { Link, useParams } from 'react-router-dom'
import { useAddComment, useGetOneSingerComments } from '../../../hook/useComments';
import { useAuthContext } from '../../../contexts/authContext';
import { useLocation } from 'react-router-dom';
import { useFormik } from "formik";
import * as Yup from 'yup'
import Comment from '../../comment/Comment';

const initialValues = {
    content: ''
}

const validSchema = Yup.object({
    comment: Yup.string().min(3, 'Comment must be ate least 3 characters long'),
})

export default function Comments() {
    const { singerId }  = useParams();
    const location = useLocation();
    const [comments, dispatch] = useGetOneSingerComments(singerId);
    const {userType, name, userId } = useAuthContext();
    const addComment = useAddComment();

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validSchema,
        onSubmit: async (formValues) => {
            const response = await addComment(formValues.content, singerId, name, userId)
            dispatch({type: 'ADD_COMMENT', payload: response})
            formik.resetForm()
        }
    })

    return (
        <>
            <section className="section-comments">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h2>Comments</h2>
                        </div>

                        <div className="section__body">
                            <div className="grid">
                                <div className="grid__col grid__col--1of2">
                                    <div className="section__form">
                                        <div className="form form--alt">
                                            <div className="form__head">
                                                <h3>Leave Comment</h3>
                                            </div>
                                            
                                            <div className="form__body">
                                                {userType != 'user_not_logged' 
                                                    ? <form onSubmit={formik.handleSubmit} className={userType == "user_admin" ? "disabled-admin" : ""}>
                                                        <div className="form__row">
                                                            <label htmlFor="content" className="form__label">Comment</label>
                                                            
                                                            <div className="form__controls">
                                                                <textarea
                                                                    {...formik.getFieldProps('content')}
                                                                    placeholder={userType == "user_admin" ? "Admins not allowed to leave comments" : "My favorite song is..."}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="form__actions">
                                                            <button className="btn secondary" type="submit" value="Submit">Submit</button>
                                                        </div>
                                                    </form>
                                                    :<>
                                                        <h4>Ooop, looks like you are not logged &#128577;</h4>
                                                        <p>
                                                            <Link to="/login" className="link" state={{ background: location }}>
                                                                Login
                                                            </Link> or <Link to="/register" className="link"  state={{ background: location }}>
                                                                Register
                                                            </Link> to leave comment
                                                        </p>
                                                    </>
                                                }
                                            </div>

                                            <div className="form__list">
                                                {comments.length > 0
                                                    ? <ul className="list-comments">
                                                        {comments.map(comment => (
                                                            <Comment key={comment._id} comment={comment} stateChanger={dispatch}/>
                                                        ))}
                                                    </ul>
                                                    : <>
                                                        <h4>No Comments Yet</h4>
                                                        <p>Be the first :)</p>
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid__col grid__col--1of2">
                                    <div className="section__content">
                                        <div className="section__entry">
                                            <h3>Share Your Favorite Song <br />and Win Big! 🎶✨</h3>
                                            <p>Leave a comment below with your favorite song by [name] and you'll automatically be entered into our special raffle.</p>
                                            <p>You have a chance to win one of three amazing vouchers worth <span>$300</span>, <span>$200</span> or <span>$100</span>!</p>
                                            <p>Don't miss out on this opportunity to win! Just share your favorite song and you might be one of the lucky winners.</p>
                                            <p>Good luck to all participants! 🎉</p>
                                        </div>

                                        <div className="section__vouchers">
                                            <ul>
                                                <li>
                                                    <div className="voucher">
                                                        <h2>$300</h2>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="voucher">
                                                        <h2>$200</h2>
                                                    </div>
                                                </li>

                                                <li>
                                                    <div className="voucher">
                                                        <h2>$100</h2>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="section__content-foot">
                                            <p>The prize will be in the form of a voucher that can be loaded onto the wristbands everyone will receive at the festival or redeemed at the event's cash desk.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}