import { useNavigate } from "react-router-dom";
import useForm from '../../../hook/useForm';
import { useCreateMerchItem, useGetAllMerchItems } from '../../../hook/useMerchItems';

const initialValues = {
    title: '',
    description: '',
    image: ''
}

export default function CreateMerchItem() {
    const navigate = useNavigate();
    const createMerchItem = useCreateMerchItem();
    const [merchItems, dispatch] = useGetAllMerchItems()

    const createMerchItemHandler = async (formValues) => {
        try {
            const response = await createMerchItem(formValues)
            dispatch({
                type: 'ADD_ITEM', 
                payload: response
            })
            navigate('/merch')
        } catch (err) {
            console.log(err.message);
        }
    }

    const { formValues, onChange, onSubmit } = useForm(createMerchItemHandler, initialValues );

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
                                <h2>Add New Merch Item</h2>
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
                                            placeholder="Keychains"
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
                                            placeholder="Durable keychains with intricate festival designs. Perfect for keys, backpacks, or purses."
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
                                            placeholder="../public/images/svg/poster.svg"
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