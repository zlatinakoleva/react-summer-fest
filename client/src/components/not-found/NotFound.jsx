import './NotFound.scss'
import { Link } from 'react-router-dom'

export default function NotFound() {
    return (
        <div className="section-not-found">
            <div className="shell">
                <div className="section__inner">
                    <div className="section__head">
                        <h1>404</h1>
                        <h2>Page not found. Return to <Link to="/" className='link'>Homepage</Link></h2>
                    </div>
                </div>
            </div>
        </div>
    )
}