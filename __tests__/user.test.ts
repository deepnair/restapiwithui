import mongoose from "mongoose"
import supertest from "supertest"
import * as UserService from "../service/user.service"
import * as SessionService from "../service/session.service"
import createServer from "../utils/server"
import log from "../utils/logger"

//User registration
//If the user's name, email and password are valid return user payload
//If the password and confirmationa password don't match, return 400
//If the route's function throws, return a 400
//Create session
//If the email and password are valid, return accessToken and refreshToken

const userId = new mongoose.Types.ObjectId().toString()

const userPayload = {
    _id: userId,
    name: "Somedude",
    email: "dudeisduder@dudeemail.com",
}

const userInput = {
    name: "Somedude",
    email: "dudeisduder@dudeemail.com",
    password: "dudepassword",
    passwordConfirmation: "dudepassword"
}

const loginInput = {
    email: "dudeisduder@dudeemail.com",
    password: "dudepassword"
}

const sessionPayload = {
    user: userId,
    _id: new mongoose.Types.ObjectId().toString(),
    userAgent: 'Supertest agent',
    valid: true,
    createdAt: 'Correct Time',
    updatedAt: 'Also correct Time'
}

const app = createServer();

describe("user", () => {
    describe("user registration", () => {
        describe("If the user's name, email and password are valid", () => {
            it("should return a user payload", async () => {
                const createUserServiceMock = jest.spyOn(UserService, "createUser")
                //@ts-ignore
                .mockReturnValueOnce(userPayload);

                const {body, statusCode} = await supertest(app)
                .post('/api/v1/user')
                .send(userInput);

                expect(statusCode).toBe(200);

                expect(body).toStrictEqual(userPayload);

                expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
            })
        })
        describe("If the passwords do not match", () => {
            it("should return a 400 status code", async () => {
                const createUserServiceMock = jest.spyOn(UserService, "createUser")
                //@ts-ignore
                .mockReturnValueOnce(userPayload);

                const {statusCode} = await supertest(app)
                .post('/api/v1/user')
                .send({
                    ...userInput,
                    passwordConfirmation: "dudedontmatch"
                })

                expect(statusCode).toBe(400);

                expect(createUserServiceMock).not.toHaveBeenCalled();
            })
        })
        describe("if the createUser Service throws and error", () => {
            it("should return a 400 status code", async () => {
                const createUserServiceMock = jest.spyOn(UserService, "createUser")
                //@ts-ignore
                .mockRejectedValueOnce("You have been REJECTED!")

                const {statusCode} = await supertest(app)
                .post('/api/v1/user')
                .send(userInput);

                expect(statusCode).toBe(400);

                expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
            })
        })
    })
    describe("create session", () => {
        describe("if email and password is valid", () => {
            it("should return an accessToken and refreshToken", async () => {
                const validatePasswordMock = jest.spyOn(UserService, "validatePassword")
                //@ts-ignore
                .mockReturnValueOnce(userPayload);

                const createSessionServiceMock = jest.spyOn(SessionService, "createSession")
                //@ts-ignore
                .mockReturnValueOnce(sessionPayload);

                // const response = await supertest(app)
                const {statusCode, body} = await supertest(app)
                .post('/api/v1/sessions')
                .send(loginInput)
                // log.info(response);
                expect(statusCode).toBe(200)

                expect(body).toStrictEqual({
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String)
                })

            })
        })
    })
})