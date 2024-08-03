import './Singer-Details.scss'
import { useLocation, useParams } from 'react-router-dom'
import Comments from './comments/Comments'
import { useGetOneSinger } from '../../hook/useSingers'
import { useAuthContext } from "../../contexts/authContext";
import { stringToSlug } from '../../utils/slugUtil';
import { Link } from 'react-router-dom';


export default function SingerDetails() {
    const location = useLocation()
    const { singerName, singerId } = useParams();
    const [singer] = useGetOneSinger(singerId, location.key);
    const {userType} = useAuthContext();

    if (!singer || !singer.details ) {
        return;
    }

    const songs = singer.details.songs;
    const bio = singer.details.bio;

    return (
        <>
            <div className="section-singer bg-white">
                <div className="shell">
                    {userType == "user_admin" && 
                        <div className="section__admin-actions">
                            <ul className="buttons">
                                <li>
                                    <Link to={`/about/singers/${stringToSlug(singerName)}/${singerId}/edit-singer`} state={{ background: location }} className='btn'>
                                        Edit
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="btn">Delete</a>
                                </li>
                            </ul>
                        </div>
                    }
                    <div className="section__head">
                        <div className="grid">
                            <div className="grid__col--1of3">
                                <div className="section__image">
                                    <img src={singer.image} alt={singer.name} />
                                </div>
                            </div>

                            <div className="grid__col--2of3">
                                <div className="section__entry">
                                    <h1>{singer.name}</h1>
                                    <p>{singer.details.bio}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="section__songs">
                        <div className="section__title">
                            <h2>Popular Songs</h2>
                        </div>

                        <div className="section__list">
                            <ul>
                                {songs.map((song, i) => (
                                    <li key={`${singer._id}-song-${i}`}>{song}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="section__icon">
                            <img src="/public/images/svg/song.svg" alt="" />
                        </div>
                    </div>
                </div>
            </div>

            <Comments/>
        </>
    )
}