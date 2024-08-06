import { useNavigate, useParams } from "react-router-dom";
import useForm from '../../../hook/useForm';
import { useEditMerchItem, useGetAllMerchItems } from '../../../hook/useMerchItems';
import { useGetOneMerchItem } from "../../../hook/useMerchItems";


export default function EditMerchItem() {
    const navigate = useNavigate();
    const { merchItemID } = useParams();
    const editMerchItem = useEditMerchItem();
    const [merchItems, dispatch] = useGetAllMerchItems(merchItemID)

    const [merchItem] = useGetOneMerchItem(merchItemID)

    const editMerchItemHandler = async (formValues) => {
        try {
            const updatedMerchItem = await editMerchItem(formValues, merchItemID)
            dispatch({type: 'EDIT_ITEM', payload: updatedMerchItem})
            navigate('/merch')
        } catch (err) {
            console.log(err.message);
        }
    }
    
    const { formValues, onChange, onSubmit } = useForm(editMerchItemHandler, merchItem);

    return (
        <>
            <div className="popup">
                <div className="popup__overlay" onClick={() => navigate(-1)}></div>
                <div className="popup__inner">
                    <div className="popup__close" onClick={() => navigate(-1)}>
                        <img src="/public/images/svg/close-circle.svg" alt="" />
                    </div>

                    <div className="form">
                        <form onSubmit={onSubmit}>
                            <div className="form__head">
                                <h2>Edit {merchItem.title}</h2>
                            </div>

                            <div className="form__body">
                                <div className="form__row">
                                    <label htmlFor="title" className="form__label">Title</label>
                                    
                                    <div className="form__controls">
                                        <input
                                            type="text"
                                            className="field"
                                            id="title"
                                            name="title"
                                            onChange={onChange}
                                            defaultValue={formValues.title}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form__row">
                                    <label htmlFor="description" className="form__label">Description</label>
                                    
                                    <div className="form__controls">
                                        <textarea
                                            className="field"
                                            id="description"
                                            name="description"
                                            onChange={onChange}
                                            defaultValue={formValues.description}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form__row">
                                    <label htmlFor="image" className="form__label">Image URL</label>
                                    
                                    <div className="form__controls">
                                        <input
                                            type="text"
                                            className="field"
                                            id="image"
                                            name="image"
                                            onChange={onChange}
                                            defaultValue={formValues.image}
                                            required
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