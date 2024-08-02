import './Singer-Details.scss'
import { useParams } from 'react-router-dom'
import Comments from './comments/Comments'
import { useGetOneSinger } from '../../hook/useSingers'

export default function SingerDetails() {
    const { singerName, singerId } = useParams();
    const [singer, setSinger] = useGetOneSinger(singerId)

    if (!singer || !singer.details ) {
        return;
    }

    const songs = singer.details[0].songs;
    const bio = singer.details[0].bio;

    return (
        <>
            <div className="section-singer bg-white">
                <div className="shell">
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
                                    <p>{bio}</p>
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