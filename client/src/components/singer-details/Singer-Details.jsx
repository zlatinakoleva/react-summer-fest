import './Singer-Details.scss'
import Comments from './comments/Comments'

export default function SingerDetails() {
    return (
        <>
            <div className="section-singer bg-white">
                <div className="shell">
                    <div className="section__head">
                        <div className="grid">
                            <div className="grid__col--1of3">
                                <div className="section__image">
                                    <img src="/public/images/temp/lady-gaga.png" alt="" />
                                </div>
                            </div>

                            <div className="grid__col--2of3">
                                <div className="section__entry">
                                    <h1>Lady Gaga</h1>
                                    <p>Lady Gaga, born Stefani Joanne Angelina Germanotta on March 28, 1986, in New York City, is a globally acclaimed singer, songwriter, and actress. Known for her flamboyant fashion and powerful vocals, Gaga gained fame with her debut album, The Fame (2008), which included hits like "Just Dance" and "Poker Face." She has won numerous awards, including 13 Grammys, and is celebrated for her versatility across music genres. Gaga also starred in the critically acclaimed film A Star Is Born (2018), earning an Oscar for Best Original Song for "Shallow." Her influence extends beyond music, advocating for mental health and LGBTQ+ rights.</p>
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
                                <li>Bad Romance</li>
                                <li>Poker Face</li>
                                <li>Just Dance (feat. Colby O'Donis)</li>
                                <li>Shallow (with Bradley Cooper)</li>
                                <li>Born This Way</li>
                                <li>Alejandro</li>
                                <li>Paparazzi</li>
                                <li>Telephone (feat. Beyoncé)</li>
                                <li>The Edge of Glory</li>
                                <li>Million Reasons</li>
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