# REST API with UI Tutorial
This is based on a tutorial by TomDoesTech at [Build a Login and Registration User Interface in React.js With JWTs and Refresh Tokens](https://www.youtube.com/watch?v=oSz23pPBpFY).

## Approach
___

### Setup
___
1. First clone over the REST API testing repository.
1. Put the server files in a server folder.
1. cd to the server folder then yarn install. Also copy back the config folder which was left out.
1. cd out of the server folder to the root folder. 
1. yarn create next-app ui --typescript
1. Once it completes, open the ui folder in vs code.
1. In the ui folder yarn add swr zod react-hook-form @hookform/resolvers axios

### Register.tsx
___
1. Create an auth folder in the pages folder of the next app. Within it create a register.tsx and a login.tsx.
1. In the register.tsx create a new react function component called RegisterPage. Within it create a form with divs with a formelement class. Within each formelement, put in an input with id, placeholder, and type. Create one for name, email, password and passwordConfirmation with the appropriate types.
1. Go to globals.css in the styles and set a standard style for the forms so that the forms appear decent.
1. Copy over the createUserSchema from user.schema.ts from the schema folder, which in is in the server folder. Remove the outer zod object and the "body:" property. Only keep the zod object within the "body:" property.
1. Make sure the refine object is attached to this zod object.
1. Change the required_user error to a nonempty method on the strings within the zod object.
1. Then create a CreateUserInput type which will be TypeOf\<typeof createUserSchema> where the 'TypeOf' is imported from zod. 
1. To make the string and object in the createUserSchema, you'll also have to import those from zod.
1. Use the useForm hook from react-hook-form to create a const {register, formState:{errors}, handleSubmit}. Set the useForm\<CreateUserInput> so we know what the handleSubmit can accept as input in the onSubmit function we will eventually give it. 
1. We do useForm<CreateUserInput>(resolver: zodResolver(createUserSchema)) where the {zodResolver} is imported from "@hookform/resolvers/zod". We do this to establish to the react-hook-form that the schema is to be resolved by zod. React-hook-form supports other validation libraries like yup as well.
1. Register every input with react-hook-form using {...regiser("email")} or whatever the id of the input is within the input tag.
1. Within every "formelement" we will also create a \<p> tag at the end that will have an errors.email?.message where the "email" will be replaced with the id of each input element. So that if there are any errors with an input field it is shown over there.
1. Next we will create the onSubmit function, but before that we will need the url of the server which will be stored in a .env.local file. It will be called NEXT_PUBLIC_SERVER so that it is accessible in a next app. This will be set to the server endpoint address. This along with the rest of the server endpoint will make for the url that axios will be used to get data from.
1. Create the onSubmit function within the function component using a try catch that takes values of type CreateUserInput. Use const {data} which we get from awaiting an axios.post(url, values) where the url is the API endpoint responsible for creating the user.
1. console.log this and then using router = useRouter() (useRouter is from "next/router"), router.push("/auth/login"). So that it pushes to the Login page once you are done creating the user.
1. Create a state called registerError, with setRegister method to change it using a useState hook from react. Set the initial state to null.
1. In the catch of the onSubmit function make setRegisterError to e.message.
1. At the top of the form in the return of the react component, create a \<p> tag that shows registerError.

### Login.tsx
___

1. Create a login.tsx within the auth folder as well.
1. For this you can literally copy over the exact same code as the register.tsx. There will just be a few minor changes.
1. Instead of the createUserSchema we will use the sessionSchema and make the exact same kind of nonempty() adjustment from the previous required_error setup. 
1. We will change the type to CreateSessionInput.
1. We will change the states and setState to loginError and setLoginError and we will make the corresponding change to the first \<p> tag within the return of the react functional component. 
1. We will also rename the react functional component to LoginPage and make the change to the export as well using Ctrl + D.
1. We will add a {withCredentials: true} as options at the end of the axios.post request because we will actually get credentials when we login. 
1. This will push to the "/" after the login is complete.
1. Finally we will reduce the input elements to just email and login as that is all that is required to login.    

### Adjustments to the back-end
___

1. For the following part, some adjustments will need to be made to the back-end. We need to send the accessTokens and refreshTokens in cookies so we want to make the relevant adjusments to the backend.
1. First if cors isn't already installed in the backend we will have to yarn add cors, and also yarn add @types/cors -D. We will also have to yarn add cookie-parser and yarn add @types/cookie-parser -D. 
1. Then these are to be applied as middleware in the server.ts which is in utils. Ahead of express.json(), first app.use(cors.origin({})). Where within the origin we put down the property origin with a link to the front-end address which we will have in the config. We will also make credentials: true. This makes our back-end more secure.
1. We will also app.use(cookieParser()) where cookieParser is imported from "cookie-parser" so we can actually parse the data the front end will send in cookies.
1. Then in deSerializeUser middleware we will add get(req, "cookies.accessToken) ||ahead of get(req, "headers.authorization") so that we can get the accessToken from cookies.
1. Do the same with refreshToken. Be careful to type "cookies" rather than "cookie". The latter will not work.
1. In the (expired && refreshToken) bit where a newAcessToken is being issued, res.cookie("accessToken", newAccessToken, {}). Where the properties in the object will be maxAge: 900000 (15 minutes in millisends), httpOnly: true, domain: config.get\<string>("domain"), path: "/", sameSite: 'strict', secure: config.get\<boolean>("secure"). At the time of production both the domain and the boolean ought to be changed. When testing the secure will be false because testing on your local machine using localhost doesn't require ssl so is not secure. We are making the cookie httpOnly so it isn't accessible by javascript but only by http requests.
1. Make the same res.cookie change to the createSessionHandler in session.controller.ts which is in the controller folder for both accessToken and refreshToken. The refreshToken maxAge will be 3.516e10 which is 1 year in milliseconds.
1. Finally also create a route for getting the user data on login with a Handler called getCurrentUserHandler which simply returns res.send(res.locals.user) which should have been put there by deserializeUser. In the routes, put this at a GET endpoint at the address "/api/v1/me". Be sure to use the requireUser middleware for this.

### fetcher.ts
___
1. In order to make standardized fetch requests from our front end of the GET type we will create a fetcher.ts utility in a utils folder in the ui folder.
1. This will have a fetcher function that takes in a url of type string and a header = {} by default. It will be async since it will use axios within. Everthing in the function will be in a try catch.
1. Within the try, we do a const {data} = and await axios.get. The url will be the url in the input, and we will pass on the headers and a property 'withCredentials' that is set to true in an object as options with the get request.
1. We return this data in the try. In the catch we have a 'e' of type any and we return null.
1. We define a generic 'T' for the function and make the return type of the axios.get that T and the return type of the function is Promise\<T|null>. Since the function is async the return will be a promise and if the try works the return will be a type 'T', else the return of the catch will be 'null'.
1. Export default this function.

### index.tsx
___
1. Finally we are ready to build the index.tsx. This index.tsx will be the address that you go to once you are logged in.
1. Below the Home function create the getServerSideProps function that has a context input. This will be exported and will be async. The function will be of type {GetServerSideProps} which is imported from next.
1. Set const data = await fetcher(). In the fetcher, within backticks put down the server from process.env.NEXT_PUBLIC_SERVER followed by the endpoint you created to get the current user.
1. Pass on context.req.headers in fetcher after the url. 
1. return an object with a props property which in turn has an object with a fallbackData property which is set equal to data.
1. Destructure the fallbackData property out of the props of the Home function.
1. Create a Typescript interface for the User that will be returned from the endpoint created to getCurrentUser.
1. Suppose we call it interface LocalsUser. Set the NextPage to NextPage<{fallbackData: LocalsUser}>. 
1. Delete everything in the return of the Home function. Import useSwr from "swr". Set a const {data} = useSwr\<LocalsUser|null>(). Within the useSwr put in the url of the endpoint using backticks and the process.env.NEXT_PUBLIC_SERVER. Then pass in fetcher and finally pass in an object with fallbackData in it. This fallbackData will be used in the instance the data hasn't arrived by the time the page has loaded.
1. If we don't do this fallbackData, then when the page loads, for a split second it will show that you aren't logged in and then you are logged in. The whole experience seems shabby.
1. Within the return(<> </>), within {} put in if data, then within a \<p> tag welcome the user, if the data is null, ask them to login and give them a link to the login page.

