import {useForm} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {object, string, TypeOf} from "zod"
import axios from "axios"
import {useState} from "react"
import {useRouter} from "next/router"

const createSessionSchema = object({
    email: string().email('Must be a valid e-mail')
    .nonempty('Email is required'),
    password: string()
    .nonempty('Password is required')
})

type CreateSessionInput = TypeOf<typeof createSessionSchema>

const LoginPage = () => {

    const {register, formState: {errors}, handleSubmit} = useForm<CreateSessionInput>({
        resolver: zodResolver(createSessionSchema)
    })

    const [loginError, setLoginError] = useState(null)

    const router = useRouter();

    const onSubmit = async (values: CreateSessionInput) => {
        try{
            const {data} = await axios.post(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/sessions`
            , values
            , {
                withCredentials: true
            });
            console.log(data);
            router.push("/")
        }catch(e:any){
            setLoginError(e.message)
        }
    }
    
    
    return (
        <>
            <p>{loginError}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                <button type="submit">Submit</button>
            </form>

            
        </>
    )
}

export default LoginPage
