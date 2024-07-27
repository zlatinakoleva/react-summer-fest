import * as merchAPI from  '../../../api/merch-api';
import { useNavigate } from "react-router-dom";

export default function CreateMerchItem() {
    const navigate = useNavigate();

    const createMerchItemHandler = async (e) => {
        e.preventDefault();

        const merchItemData = Object.fromEntries(new FormData(e.currentTarget));

        try {
            await merchAPI.create(merchItemData);

            navigate(-1);
        } catch(err) {
            console.log(err)
        }
    }

    return (
        <>
            <div className="popup">
                <div className="popup__overlay" onClick={() => navigate(-1)}></div>
                <div className="popup__inner">
                    <div className="popup__close" onClick={() => navigate(-1)}>
                        <img src="../public/images/svg/close-circle.svg" alt="" />
                    </div>

                    <div className="form">
                        <form onSubmit={createMerchItemHandler}>
                            <div className="form__head">
                                <h2>Add New Merch Item</h2>
                            </div>

                            <div className="form__body">
                                <div className="form__row">
                                    <label htmlFor="title" className="form__label">Title</label>
                                    
                                    <div className="form__controls">
                                        <input
                                        type="text"
                                        className="field"
                                        name="title"
                                        id="title"
                                        defaultValue=""
                                        placeholder="Keychains"
                                        />
                                    </div>
                                </div>

                                <div className="form__row">
                                    <label htmlFor="description" className="form__label">Description</label>
                                    
                                    <div className="form__controls">
                                        <textarea
                                        className="field"
                                        name="description"
                                        id="description"
                                        defaultValue=""
                                        placeholder="Durable keychains with intricate festival designs. Perfect for keys, backpacks, or purses."
                                    />
                                    </div>
                                </div>

                                <div className="form__row">
                                    <label htmlFor="image" className="form__label">Image URL</label>
                                    
                                    <div className="form__controls">
                                        <input
                                        type="text"
                                        className="field"
                                        name="image"
                                        id="image"
                                        defaultValue=""
                                        placeholder="../public/images/svg/poster.svg"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form__actions">
                                <button className="btn secondary" type="submit" value="Submit">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}