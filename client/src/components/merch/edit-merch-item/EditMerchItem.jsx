import { useNavigate, useParams } from "react-router-dom";
import useForm from '../../../hook/useForm';
import { useEditMerchItem } from '../../../hook/useMerchItems';
import { useGetOneMerchItem } from "../../../hook/useMerchItems";

const FormKeys = {
    Title: 'title', 
    Description: 'description',
    Image: 'image'
}

export default function EditMerchItem() {
    const navigate = useNavigate();
    const { merchItemID } = useParams();
    const editMerchItem = useEditMerchItem();

    const [merchItem] = useGetOneMerchItem(merchItemID)

    const initialValues = merchItem ? {
        [FormKeys.Title]: merchItem.title || '',
        [FormKeys.Description]: merchItem.description || '',
        [FormKeys.Image]: merchItem.image || ''
    } : {
        [FormKeys.Title]: '',
        [FormKeys.Description]: '',
        [FormKeys.Image]: ''
    };

    const editMerchItemHandler = async (formValues) => {
        try {
            await editMerchItem(formValues, merchItemID)
            navigate(-1)
        } catch (err) {
            console.log(err.message);
        }
    }

    const { formValues, onChange, onSubmit } = useForm(editMerchItemHandler, initialValues);

    return (
        <>
            <div className="popup">
                <div className="popup__overlay" onClick={() => navigate(-1)}></div>
                <div className="popup__inner">
                    <div className="popup__close" onClick={() => navigate(-1)}>
                        <img src="../public/images/svg/close-circle.svg" alt="" />
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
                                            name={FormKeys.Title}
                                            onChange={onChange}
                                            defaultValue={formValues[FormKeys.Title]}
                                        />
                                    </div>
                                </div>

                                <div className="form__row">
                                    <label htmlFor="description" className="form__label">Description</label>
                                    
                                    <div className="form__controls">
                                        <textarea
                                            className="field"
                                            id="description"
                                            name={FormKeys.Description}
                                            onChange={onChange}
                                            defaultValue={formValues[FormKeys.Description]}
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
                                            name={FormKeys.Image}
                                            onChange={onChange}
                                            defaultValue={formValues[FormKeys.Image]}
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