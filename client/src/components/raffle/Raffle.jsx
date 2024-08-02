import './Raffle.scss'
import { useGetAllComments } from "../../hook/useComments";
import { formaDate } from "../../utils/formatDate";

export default function Raffle() {
    const [comments] = useGetAllComments();

    if (!comments) {
        return;
    }

    console.log(comments)

    return (
        <>
            <section className="section-raffle">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h2>Lucky Draw</h2>
                            <p>Everybody have a chance to win one of three amazing vouchers worth $300, $200 or $100!</p>
                            <p>The draw will take place on 11/08 at 10:30am.</p>
                        </div>

                        <div className="section__body">
                            <div className="grid">
                                <div className="grid__col grid__col--1of2">
                                    <div className="section__raffle">
                                        <div className="raffle">
                                            <div className="raffle__content">

                                            </div>
                                            <div className="raffle__button">
                                                <button className="btn">
                                                    <span>Start</span>
                                                    <span>Stop</span>
                                                </button>
                                            </div>

                                            <div className="raffle__list">
                                                <h4>Participating users:</h4>
                                                <ul>
                                                    <li><span>Ivan</span></li>
                                                    <li><span>Marin</span></li>
                                                    <li><span>Kalin</span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>    
                                <div className="grid__col grid__col--1of2">
                                    <div className="section__comments">
                                        <ul className="list-comments">
                                            {comments.map(comment => (
                                                <li key={comment._id}>
                                                    <div className="comment">
                                                        <div className="comment__head">
                                                            <h5>{comment.author.username} <span>for {comment.singer.name}</span></h5>
                                                            <small>{formaDate(comment._createdOn)}</small>
                                                        </div>
                                                        <p>{comment.content}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
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