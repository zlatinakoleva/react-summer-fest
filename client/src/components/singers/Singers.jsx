import './Singers.scss';
import { useGetAllSingers } from '../../hook/useSingers';
import Singer from '../singer/Singer';
import { useAuthContext } from '../../contexts/authContext';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function Singers() {
    const location = useLocation()
    const {userType} = useAuthContext()
    const [singers] = useGetAllSingers(location.key)

    return (
        <>
            <section className="section-singers white">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h1>Our Singers</h1>
                        </div>

                        <div className="section__body">
                            <div className="grid">
                                {singers.length > 0 
                                    ? singers.map(singer => <Singer key={singer._id} singer={singer}/>)
                                    : <div className="grid__col"><h3>No Singers yet</h3></div> 
                                }
                            </div>
                        </div>

                        {userType == "user_admin" && 
                            <div className="section__admin-actions">
                                <ul className="buttons">
                                    <li>
                                        <Link to={`/about/singers/add-singer`} state={{ background: location }} className='btn'>
                                            Add Singer
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        }
                    </div>
                </div>
            </section>
        </>
    )
}