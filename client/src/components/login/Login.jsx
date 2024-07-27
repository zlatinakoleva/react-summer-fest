import { useNavigate } from "react-router-dom";
import { useLogin } from "../../hook/useAuth";
import useForm from "../../hook/useForm";

const FormKeys = {
    Email: 'email', 
    Password: 'password'
}

const initialValues = {
    [FormKeys.Email]: '',
    [FormKeys.Password]: ''
}


export default function Login() {
    const login = useLogin();
    const navigate = useNavigate();

    const loginHandler = async (formValues) => {
        try {
            await login(formValues.email, formValues.password);
            navigate(-1);
        } catch (err) {
            console.log(err.message);
        }
    };

    const { formValues, onChange, onSubmit } = useForm(loginHandler, initialValues);

    return (
        <div className="popup">
            <div className="popup__overlay" onClick={() => navigate(-1)}></div>
            <div className="popup__inner">
                <div className="popup__close" onClick={() => navigate(-1)}>
                    <img src="../public/images/svg/close-circle.svg" alt="" />
                </div>

                <div className="form">
                    <form onSubmit={onSubmit}>
                        <div className="form__head">
                            <h2>Login</h2>
                        </div>

                        <div className="form__body">
                            <div className="form__row">
                                <label htmlFor="email" className="form__label">Email</label>
                                
                                <div className="form__controls">
                                    <input
                                        type="email"
                                        className="field"
                                        name={FormKeys.Email}
                                        id="email"
                                        onChange={onChange}
                                        value={formValues[FormKeys.Email]}
                                        placeholder="john_smith@gmail.com"
                                    />
                                </div>
                            </div>

                            <div className="form__row">
                                <label htmlFor="password" className="form__label">Password</label>
                                
                                <div className="form__controls">
                                    <input
                                        type="password"
                                        className="field"
                                        name={FormKeys.Password}
                                        id="password"
                                        onChange={onChange}
                                        value={formValues[FormKeys.Password]}
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
    )
}
