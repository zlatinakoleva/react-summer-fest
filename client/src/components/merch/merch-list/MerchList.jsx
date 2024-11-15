import './MerchList.scss'
import MerchItem from '../merch-item/MerchItem';
import { Link, useLocation } from "react-router-dom";
import { useGetAllMerchItems } from '../../../hook/useMerchItems';
import { useAuthContext } from "../../../contexts/authContext";

export default function MerchList() {
    const location = useLocation();
    const {userType} = useAuthContext();
    
    const [merchItems] = useGetAllMerchItems(location.key);

    return (
        <>
            <section className="section-tiles">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h1>Festival Merchandise</h1>
                        </div>
                        { userType == "user_admin" && 
                            <div className="section__admin-button">
                                <Link to="/merch/create-merch-item" state={{ background: location }} className='btn'>
                                    Add Merch Item
                                </Link>
                            </div>
                        }

                        <div className="section__body">
                            <div className="grid">
                                { merchItems.length > 0 
                                    ? merchItems.map(merchItem => <MerchItem key={merchItem._id} merchItem={merchItem}/>)
                                    : <h3>No Merch Items yet</h3> 
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}