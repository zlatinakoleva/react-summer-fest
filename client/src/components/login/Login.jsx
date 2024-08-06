import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hook/useAuth";
import { useFormik } from "formik";

import * as Yup from 'yup'

const initialValues = {
    email: '',
    password: ''
}

const validSchema = Yup.object({
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required')
})


export default function Login() {
    const login = useLogin();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validSchema,
        onSubmit: async (values, {setErrors}) => {
            const loginResult = await login(values.email, values.password);
            if (loginResult == 'success') {
                navigate(-1);
            } else {
                setErrors({server: `${loginResult}`})
            }
        }
    })

    return (
        <div className="popup">
            <div className="popup__overlay" onClick={() => navigate(-1)}></div>
            <div className="popup__inner">
                <div className="popup__close" onClick={() => navigate(-1)}>
                    <img src="../public/images/svg/close-circle.svg" alt="" />
                </div>

                <div className="form">
                    <form onSubmit={formik.handleSubmit}>
                        <div className="form__head">
                            <h2>Login</h2>

                            {formik.errors.server &&
                                <div className="form__error">
                                    {formik.errors.server}
                                </div>
                            }
                        </div>

                        <div className="form__body">
                            <div className="form__row">
                                <label htmlFor="email" className="form__label">Email</label>
                                
                                <div className="form__controls">
                                    <input
                                        type="email"
                                        id="email"
                                        className="field"
                                        {...formik.getFieldProps('email')}
                                    />
                                </div>

                                {formik.touched.email && formik.errors.email 
                                    ? <div className="form__error">
                                        {formik.errors.email} 
                                    </div>
                                    : null
                                }
                            </div>

                            <div className="form__row">
                                <label htmlFor="password" className="form__label">Password</label>
                                
                                <div className="form__controls">
                                    <input
                                        type="password"
                                        className="field"
                                        id="password"
                                        {...formik.getFieldProps('password')}
                                    />
                                </div>

                                {formik.touched.password && formik.errors.password 
                                    ? <div className="form__error">
                                        {formik.errors.password} 
                                    </div>
                                    : null
                                }
                            </div>
                        </div>
                        
                        <div className="form__actions">
                            <button className="btn secondary" type="submit" disabled={formik.isSubmitting}>Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
