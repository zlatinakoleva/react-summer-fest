import './Singers.scss'
import { useGetAllSingers } from '../../hook/useSingers'
import Singer from '../singer/Singer'

export default function Singers() {
    const [singers] = useGetAllSingers()

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
                                    : <h3>No Singers yet</h3> 
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}