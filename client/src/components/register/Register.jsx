import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useRegister } from "../../hook/useAuth";
import useForm from "../../hook/useForm";
import { useFormik } from "formik";
import * as Yup from 'yup'


const initialValues = {
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
}

const validSchema = Yup.object({
    username: Yup.string().min(3, 'Username must be at least 3 characters long').max(20, 'Username must be max 20 characters long'),
    email: Yup.string().email('Invalid email address').required('Required'),
    password: Yup.string().required('Required'),
    confirmPassword: Yup.string().oneOf([Yup.ref("password"), null], "Passwords must match"),
})

export default function Register() {
    const register = useRegister();
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validSchema,
        onSubmit: async (values, {setErrors}) => {
            const registerResult = await register(values.email, values.password, values.username);
            if (registerResult == 'success') {
                navigate(-1);
            } else {
                setErrors({server: `${registerResult}`})
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
                            <h2>Register</h2>

                            {formik.errors.server &&
                                <div className="form__error">
                                    {formik.errors.server}
                                </div>
                            }
                        </div>

                        <div className="form__body">
                            <div className="form__row">
                                <label htmlFor="username" className="form__label">Username</label>
                                
                                <div className="form__controls">
                                    <input
                                        type="username"
                                        className="field"
                                        id="username"
                                        {...formik.getFieldProps('username')}
                                    />
                                </div>

                                {formik.touched.username && formik.errors.username 
                                    ? <div className="form__error">
                                        {formik.errors.username} 
                                    </div>
                                    : null
                                }
                            </div>

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

                            <div className="form__row">
                                <label htmlFor="confirm-password" className="form__label">Confirm Password</label>
                                
                                <div className="form__controls">
                                    <input
                                        type="password"
                                        className="field"
                                        id="confirm-password"
                                        {...formik.getFieldProps('confirmPassword')}
                                    />
                                </div>

                                {formik.touched.confirmPassword && formik.errors.confirmPassword 
                                    ? <div className="form__error">
                                        {formik.errors.confirmPassword} 
                                    </div>
                                    : null
                                }
                            </div>
                        </div>

                        <div className="form__actions">
                            <button className="btn secondary" type="submit" value="Submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
