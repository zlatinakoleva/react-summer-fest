import './MerchItem.scss'
import { useAuthContext } from "../../../contexts/authContext";


export default function MerchItem({
    merchItem
}) {
    const {userType} = useAuthContext();
    
    return (
        <div className="grid__col grid__col--1of4">
            <div className="tile">
                { userType == "user_admin" && 
                    <div className="admin-buttons">
                        <button className="btn-plain">
                            <img src="../../public/images/svg/edit.svg" alt="delete" />
                        </button>
                        <button className="btn-plain">
                            <img src="../../public/images/svg/bin.svg" alt="delete" />
                        </button>
                    </div>
                }
                <div className="tile__image">
                    <img src={merchItem.image} alt={merchItem.title} />
                </div>
                <div className="tile__content">
                    <h4>{merchItem.title}</h4>
                    <p>{merchItem.description}</p>
                </div>
            </div>
        </div>
    )
}