import type { GetServerSideProps, NextPage } from 'next'
import Link from 'next/link'
import useSwr from "swr"
import fetcher from '../utils/fetcher'

interface LocalsUser{
  _id: string
  name: string,
  email: string,
  createdAt: Date,
  updatedAt: Date
  _v: number
  iat: string,
  exp: number
}

const Home: NextPage<{fallbackData: LocalsUser}> = ({fallbackData}) => {
  // console.log(fallbackData)
  
  const {data} = useSwr<null|LocalsUser>(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/me`,
  fetcher,
  {fallbackData}
  )
  // console.log(data);
  return (
    <>
      {data?<p>Welcome {data.name}</p>:<p>Please login <Link href="/auth/login"><a>Here</a></Link> to acess this page</p>}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const data = await fetcher(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/me`, context.req.headers);
  return {
    props:{
      fallbackData: data
    }
  }
} 

export default Home
