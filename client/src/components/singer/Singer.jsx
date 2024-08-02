import { stringToSlug } from "../../utils/slugUtil";
import { Link } from "react-router-dom";

export default function Singer({
    singer
}) {
    const slug = stringToSlug(singer.name)
    return (
        <>
            <div key={singer._id} className="grid__col grid__col--1of4">
                <div className="tile-singer">
                    <div className="tile__image">
                        <figure>
                            <img src={singer.image} alt={singer.name} />
                        </figure>
                    </div>

                    <div className="tile__content">
                        <h3>{singer.name}</h3>
                        <Link to={`singers/${slug}/${singer._id}`} className="btn">Details</Link>
                    </div>
                </div>
            </div>
        </>
    )
}