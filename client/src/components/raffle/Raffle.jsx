import './Raffle.scss'
import { motion } from 'framer-motion' 
import Draw from './draw/Draw';
import AllCommentsList from '../all-comments-list/AllCommentsList';
import { useGetAllComments } from "../../hook/useComments";
import { getCommentAuthorsWithoutDuplicates, getCommentAuthorsWithoutWinners } from '../../utils/getCommentAuthorsWithoutDuplicates';
import { useGetAllWinners } from '../../hook/useWinners';
import { useAuthContext } from '../../contexts/authContext';

export default function Raffle() {
    const {userType} = useAuthContext()
    const [comments] = useGetAllComments();
    const participantsArr = getCommentAuthorsWithoutDuplicates(comments)
    const [winners, dispatch] = useGetAllWinners()
    const drawParticipants = getCommentAuthorsWithoutWinners(participantsArr,winners)

    return (
        <>
            <motion.section 
                className="section-raffle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: .5, ease: "easeOut" }}
            >
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h1>Lucky Draw</h1>

                            {winners.length == 3 
                                ? <h2>Congrats to winners</h2>
                                : <>
                                    <p>The draw will take place on 11/08 at 10:30am.</p>
                                    <p>Everybody have a chance to win one of three amazing vouchers worth $300, $200 or $100!</p>
                                </>
                            }
                        </div>

                        <div className="section__awards">
                            <ul>
                                <li>
                                    <div className="voucher">
                                        <h2>$300</h2>
                                    </div>

                                    <h3>{winners[2]?.username || '...'}</h3>
                                </li>

                                <li>
                                    <div className="voucher">
                                        <h2>$200</h2>
                                    </div>

                                    <h3>{winners[1]?.username || '...'}</h3>
                                </li>

                                <li>
                                    <div className="voucher">
                                        <h2>$100</h2>
                                    </div>

                                    <h3>{winners[0]?.username || '...'}</h3>
                                </li>
                            </ul>
                        </div>

                        <div className="section__body">
                            <div className="grid">
                                {winners.length < 3 &&
                                    <div className="grid__col grid__col--1of2">
                                        <div className="section__raffle">
                                            {participantsArr.length &&
                                                <Draw participantsArr={drawParticipants} stateChanger={dispatch} />
                                            }
                                        </div>
                                    </div>
                                }
                                { winners.length == 3 && userType == 'user_admin' &&
                                    <div className="grid__col grid__col--1of2"> 
                                        <div className="section__raffle">
                                            <h3>Campaign Finished Successfully! :)</h3>
                                        </div>
                                    </div>
                                }

                                <div className="grid__col">
                                    <div className="section__comments">
                                        <h4>All Comments:</h4>
                                        <AllCommentsList />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>
        </>
    )
}