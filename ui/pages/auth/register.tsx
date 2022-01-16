import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {object, string, TypeOf} from "zod"
import axios from "axios"
import {useState} from "react"
import {useRouter} from "next/router"

const createUserSchema = object({
    name: string()
    .nonempty('Name is required'),
    email: string().email('Please enter a valid email')
    .nonempty('Email is a required field'),
    password: string()
    .min(6, 'Password must be atleast 6 characters long')
    .nonempty('Password is required'),
    passwordConfirmation: string()
    .nonempty('Password confirmation is required')
})
    .refine((data) => data.password === data.passwordConfirmation, {
        message: 'Password must be the same as Password confirmation',
        path: ['passwordConfirmation']
    })

type CreateUserInput = TypeOf<typeof createUserSchema>

const RegisterPage = () => {

    const {register, formState: {errors}, handleSubmit} = useForm<CreateUserInput>({
        resolver: zodResolver(createUserSchema)
    })

    const [registerError, setRegisterError] = useState(null)

    const router = useRouter();

    // const onSubmit = async (values: CreateUserInput) => {
    //     try{
    //         const {data} = await axios.post(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user`
    //         , values);
    //         console.log(data);
    //         router.push("/")
    //     }catch(e:any){
    //         setRegisterError(e.message)
    //     }
    // }
    async function onSubmit(values: CreateUserInput){
        try{
            const {data} = await axios.post(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/user`
            , values);
            console.log(data);
            router.push("/")
        }catch(e:any){
            setRegisterError(e.message)
        }
    }
    return (
        <>
            <p>{registerError}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="formelement">
                    <label htmlFor="name">Name</label>
                    <input id="name" type="text" 
                    placeholder="Type in your name"
                    {...register("name")}>
                    </input>
                    <p>{errors.name?.message}</p>
                </div>
                <div className="formelement">
                    <label htmlFor="email">E-mail</label>
                    <input id="email" type="email" 
                    placeholder="Type in your email"
                    {...register("email")}>
                    </input>
                    <p>{errors.email?.message}</p>
                </div>
                <div className="formelement">
                    <label htmlFor="password">Password (At least 6 characters)</label>
                    <input id="password" type="password" 
                    placeholder="**********"
                    {...register("password")}>
                    </input>
                    <p>{errors.password?.message}</p>
                </div>
                <div className="formelement">
                    <label htmlFor="passwordConfirmation">Retype your password again</label>
                    <input id="passwordConfirmation" type="password" 
                    placeholder="**********"
                    {...register("passwordConfirmation")}>
                    </input>
                    <p>{errors.passwordConfirmation?.message}</p>
                </div>
                <button type="submit">Submit</button>
            </form>

            
        </>
    )
}

export default RegisterPage
