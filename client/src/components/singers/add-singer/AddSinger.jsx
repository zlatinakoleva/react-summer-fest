import { useNavigate } from "react-router-dom";
import { Formik, FieldArray, Field, Form, ErrorMessage } from "formik";
import * as Yup from 'yup';
import { useAddSinger, useGetAllSingers } from "../../../hook/useSingers";

const initialValues = {
    name: '',
    image: '',
    details: {
        bio: '',
        songs: ['','','']
    }
}

const validSchema = Yup.object({
    name: Yup.string().required('Required'),
    details: Yup.object({
        bio: Yup.string().required('Required'),
        songs: Yup.array(Yup.string().required('Required')),
    }),
    image: Yup.string().required('Required')
})

export default function AddSinger() {
    const navigate = useNavigate();
    const addSinger = useAddSinger();
    const [singers, dispatch] = useGetAllSingers()
    
    return (
        <div className="popup popup--large">
            <div className="popup__overlay" onClick={() => navigate(-1)}></div>
            <div className="popup__inner">
                <div className="popup__close" onClick={() => navigate(-1)}>
                    <img src="../public/images/svg/close-circle.svg" alt="" />
                </div>


                <div className="form">
                    <div className="form__head">
                        <h2>Add Singer</h2>
                    </div>

                    <div className="form__body">
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validSchema}
                            onSubmit={async (values, {setErrors}) => {
                                const result = await addSinger(values);
                                dispatch({type: 'ADD_SINGER', payload: result})
                                navigate('/about')
                                if (result == 'success') {
                                    navigate(-1);
                                } else {
                                    setErrors({server: `${result}`})
                                }
                            }}
                        >
                            {({ values }) => (
                                <Form>
                                    <div className="grid">
                                        <div className="grid__col grid__col--1of2">
                                            <div className="form__row">
                                                <label htmlFor="name" className="form__label">Name</label>
                                                
                                                <div className="form__controls">
                                                    <Field
                                                        id="singer-name"
                                                        type="text"
                                                        className="field"
                                                        name='name'
                                                    />
                                                </div>
                                                
                                                <ErrorMessage
                                                    name='name'
                                                    component="div"
                                                    className="form__error"
                                                />
                                            </div>

                                            <div className="form__row">
                                                <label htmlFor="bio" className="form__label">Bio</label>
                                                
                                                <div className="form__controls">
                                                    <Field component="textarea"
                                                        id="singer-bio"
                                                        className="field"
                                                        name='details.bio'
                                                    />
                                                </div>

                                                <ErrorMessage
                                                    name='details.bio'
                                                    component="div"
                                                    className="form__error"
                                                />
                                            </div>

                                            <div className="form__row">
                                                <label htmlFor="image" className="form__label">Image URL</label>
                                                
                                                <div className="form__controls">
                                                    <Field
                                                        id="singer-image"
                                                        type="text"
                                                        className="field"
                                                        name='image'
                                                    />
                                                </div>

                                                <ErrorMessage
                                                    name='image'
                                                    component="div"
                                                    className="form__error"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid__col grid__col--1of2">
                                            <p className="form__label">Songs</p>
                                            <div className="form__field form__field--alt">

                                                <FieldArray name="details.songs">
                                                    {({ insert, remove, push }) => (
                                                        <div className="form__group">
                                                            {values.details.songs && values.details.songs.length > 0 && 
                                                                values.details.songs.map((song, i) => (
                                                                    <div className="form__row" key={i}>
                                                                        <label htmlFor={`details.songs[${i}]`} className="form__label form__label--hidden">Song</label>
                                                                        <div className="form__controls">
                                                                            <Field
                                                                                className="field"
                                                                                type="text"
                                                                                name={`details.songs[${i}]`}
                                                                                value={song}
                                                                            />  
                                                                            

                                                                            <button 
                                                                                className="form__remove"
                                                                                type="button"
                                                                                onClick={() => remove(i)}
                                                                            >
                                                                                <img src="/public/images/svg/close-circle.svg" alt="" />
                                                                            </button>
                                                                        </div>

                                                                        <ErrorMessage
                                                                            name={`details.songs[${i}]`}
                                                                            component="div"
                                                                            className="form__error"
                                                                        />
                                                                    </div>
                                                                ))
                                                            }
                                                            <button
                                                                type="button"
                                                                className="btn"
                                                                onClick={() => push('')}
                                                            >
                                                                Add Song
                                                            </button>
                                                        </div>
                                                    )}
                                                </FieldArray>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form__actions">
                                        <button className="btn secondary" type="submit" value="Submit">Submit</button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </div>
    )
};