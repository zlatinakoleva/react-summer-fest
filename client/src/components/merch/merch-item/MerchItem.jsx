import './MerchItem.scss'
import { useAuthContext } from "../../../contexts/authContext";
import { Link, useLocation } from 'react-router-dom';
import { useDeleteMerchItem } from '../../../hook/useMerchItems';
import { useNavigate } from 'react-router-dom';

export default function MerchItem({
    merchItem
}) {
    const {userType} = useAuthContext();
    const location = useLocation();
    const navigate = useNavigate();
    const deleteMerchItem = useDeleteMerchItem()

    const deleteMerchItemHandler = async () => {
        try {
            await deleteMerchItem(`${merchItem.id}`)
            navigate(-1)
        } catch (err) {
            console.log(err.message);
        }
    }
    
    return (
        <div className="grid__col grid__col--1of4">
            <div className="tile">
                { userType == "user_admin" && 
                    <div className="admin-buttons">
                        <Link 
                            to={`/merch/edit-merch-item/${merchItem.id}`} 
                            state={{ background: location }} 
                            className="btn-plain" 
                        >
                            <img src="../../public/images/svg/edit.svg" alt="edit" />
                        </Link>
                        <button className="btn-plain" onClick={deleteMerchItemHandler}>
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