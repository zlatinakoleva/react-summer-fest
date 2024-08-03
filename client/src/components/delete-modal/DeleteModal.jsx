import './DeleteModal.scss'

export default function DeleteModal({
    confirmDelete, 
    closeDelete,
    deleteTargetName
}) {
    return (
        <>
            <div className="popup">
                <div className="popup__overlay" onClick={closeDelete}></div>
                <div className="popup__inner">
                    <div className="popup__close" onClick={closeDelete}>
                        <img src="/public/images/svg/close-circle.svg" alt="" />
                    </div>
                    <h2>Are you sure you want to delete {deleteTargetName}</h2>
                    <ul className="buttons">
                        <li>
                            <button className="btn primary" onClick={confirmDelete}>Yes</button>
                        </li>
                        <li>
                            <button className="btn secondary" onClick={closeDelete}>No</button>
                        </li>
                    </ul>
                    
                </div>
            </div>
        </>
    )
}