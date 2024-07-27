import { useState } from "react";

export default function useForm(submitCallback, initialValues) {
    const [formValues, setFormValues] = useState(initialValues)

    const onChange = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = (e) => {
        e.preventDefault();
        submitCallback(formValues)
    } 

    return {
        formValues,
        onChange,
        onSubmit
    }
}