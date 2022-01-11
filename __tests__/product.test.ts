import {MongoMemoryServer} from "mongodb-memory-server"
import mongoose from "mongoose";
import supertest from "supertest";
import { createProduct } from "../service/product.service";
import { signJwt } from "../utils/jwt.utils";
import log from "../utils/logger";
import createServer from "../utils/server";

//Tests to be run
//GET PRODUCT ROUTE
//If product doesn't exist, should get a 404
//If product exists, you should get the product
//CREATE PRODUCT ROUTE
//If you are not logged in, should get a 403
//If you are logged in, should get the product document object back

const userId = new mongoose.Types.ObjectId().toString();

const userPayload = {
    _id: userId,
    name: 'Somedude',
    email: 'somedude@dudethings.com'
}

const productPayload = {
    user: userId,
    title: "Testing Product",
    description: "Is incredibly effective for testing",
    price: 1000,
    image: "https://supertestingimage.com/testingimage.jpg"
}

const productPayloadWithoutUser = {
    title: "Testing Product",
    description: "Is incredibly effective for testing. We all know there are atleast a 100 characters in this description now for sure.",
    price: 1000,
    image: "https://supertestingimage.com/testingimage.jpg"
}

const app = createServer();

describe("product", () => {
    beforeAll(async () => {
        const mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());
    })

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoose.connection.close();
    })
    describe("get product route", () => {
        describe("if product doesn't exist", () => {
            it("should return a 404", async() => {
                const productId = "product-123"

                const {statusCode} = await supertest(app)
                .get(`/api/v1/product/${productId}`)

                expect(statusCode).toBe(404);

            })
        })
        describe("if product does exist", () => {
            it("should return a 200 and the product", async() => {
                const product = await createProduct(productPayload);

                const {body, statusCode} = await supertest(app)
                .get(`/api/v1/product/${product._id}`)

                expect(statusCode).toBe(200);

                // log.info(body);

                // log.info(product.toJSON())

                // expect(String(body._id)).toBe(String(product.toJSON()._id));

                const jsonProduct = product.toJSON()
                expect(body).toStrictEqual({
                    ...productPayload,
                    _id: String(jsonProduct._id),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: 0,
                    user: userId
                })
            })
        })
    })

    describe("create product route", () => {
        describe("if you're not logged in", () => {
            it("should return a 403 error", async () => {
                const {statusCode} = await supertest(app)
                .post('/api/v1/product')
                .send(productPayload)

                expect(statusCode).toBe(403)
            })
        })

        describe("if you're logged in, and create a product", () => {
            it("should return 200 and the product", async() => {
                const jwt = signJwt(userPayload);
                // log.info(jwt);
                
                // const response = await supertest(app)
                const {statusCode, body} = await supertest(app)
                .post('/api/v1/product')
                .set("Authorization", `Bearer ${jwt}`)
                .send(productPayloadWithoutUser)

                // log.info(response)
                // log.info(statusCode);
                // log.info(body);

                expect(statusCode).toBe(200);
                
                

                expect(body).toStrictEqual({
                    ...productPayloadWithoutUser,
                    _id: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    __v: 0,
                    user: userId
                })


            })
        })
    })
})