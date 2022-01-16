import {Request, Response} from "express"
import { UserInput } from "../model/user.model"
import {createUser} from "../service/user.service"
import log from "../utils/logger"

const createUserHandler = async (req: Request<{}, {}, UserInput>, res: Response) => {
    try{
        const user = await createUser(req.body)
        log.info('This is in controller')
        log.info(user)
        if(user){
            res.send(user)
        }
    }catch(e:any){
        log.error('Error in controller')
        res.status(400).send(`Error is: ${e}`)
    }
}

export const getCurrentUser = (req: Request, res: Response) => {
    return res.send(res.locals.user)
}

export default createUserHandler;