import './Contact.scss';
import * as Yup from 'yup'
import emailjs from '@emailjs/browser';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useFormik } from 'formik';
import Map from './map/Map';

const initialValues = {
    user_name: '',
    user_email: '',
    message: ''
}


const validSchema = Yup.object({
    user_name: Yup.string().required('Required').min(3, 'Username must be at least 3 characters long').max(20, 'Username must be max 40 characters long'),
    user_email: Yup.string().email('Invalid email address').required('Required'),
    message: Yup.string().required('Required').min(5, 'Message must be at least 5 characters long')
})

export default function Contact() {
    const [sendStatus, setSendStatus] = useState(false)

    const sendEmail = (formData) => {
        emailjs
            .send('service_8f121bs', 'template_n0nnifo', formData, {
                publicKey: '4H_lypF-9Wyp0E-8u',
            })
            .then(
                () => {
                    setSendStatus(true)
                },
                (error) => {
                    console.log('FAILED...', error.text);
                },
            );
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validSchema,
        onSubmit: async (values) => {
            sendEmail(values);
        }
    })

    return (
        <>
            <div className="section-contacts">
                <div className="shell">
                    <div className="section__inner">
                        <div className="section__head">
                            <h1>Get in touch with us! :)</h1>
                        </div>

                        <div className="section__body">
                            <div className="grid">
                                <div className="grid__col grid__col--1of2">
                                    <div className="section__form">
                                        <div className="form form--alt">
                                            {!sendStatus 
                                                ? <form onSubmit={formik.handleSubmit}>
                                                    <div className="form__body">
                                                        <div className="form__row">
                                                            <label htmlFor="user_name" className="form__label">Name</label>
                                                            <div className="form__controls">
                                                                <input 
                                                                    type="text" 
                                                                    className="field" 
                                                                    id="user_name"
                                                                    {...formik.getFieldProps('user_name')} 
                                                                />
                                                            </div>

                                                            {formik.touched.user_name && formik.errors.user_name 
                                                                ? <div className="form__error">
                                                                    {formik.errors.user_name} 
                                                                </div>
                                                                : null
                                                            }
                                                        </div>
                                                        <div className="form__row">
                                                            <label htmlFor="user_email" className="form__label">Email</label>
                                                            <div className="form__controls">
                                                                <input 
                                                                    type="email" 
                                                                    id="user_email" 
                                                                    className="field" 
                                                                    {...formik.getFieldProps('user_email')}
                                                                />
                                                            </div>

                                                            {formik.touched.user_email && formik.errors.user_email 
                                                                ? <div className="form__error">
                                                                    {formik.errors.user_email} 
                                                                </div>
                                                                : null
                                                            }
                                                        </div>
                                                        <div className="form__row">
                                                            <label htmlFor="message" className="form__label">Message</label>
                                                            <div className="form__controls">
                                                                <textarea 
                                                                    className="field" 
                                                                    id="message" 
                                                                    name="message"
                                                                    {...formik.getFieldProps('message')}
                                                                />
                                                            </div>

                                                            {formik.touched.message && formik.errors.message 
                                                                ? <div className="form__error">
                                                                    {formik.errors.message} 
                                                                </div>
                                                                : null
                                                            }
                                                        </div>
                                                    </div>
                                                    <div className="form__actions"><button className="btn secondary" type="submit" value="Submit">Submit</button></div>
                                                </form>
                                                : <div className="form__confirmation">
                                                    <div className="form__confirmation-content">
                                                        <h2>Thank you</h2>
                                                        <h3>Your message is successfully sent!</h3>
                                                        <p>We will get in touch with you shortly</p>
                                                        <h5>Return to <Link to='/' className='link'>Homepage</Link></h5>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div className="grid__col grid__col--1of2">
                                    <Map />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}