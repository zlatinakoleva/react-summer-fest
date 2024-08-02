import { useEffect, useState } from "react";

export default function useForm(submitCallback, initialValues) {
    const [formValues, setFormValues] = useState(initialValues)

    useEffect(() => {
        setFormValues(initialValues)
    },[initialValues])

    const onChange = (e) => {
        setFormValues(state => ({
            ...state,
            [e.target.name]: e.target.value
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        await submitCallback(formValues)
        setFormValues(initialValues)
    } 

    return {
        formValues,
        onChange,
        onSubmit
    }
}