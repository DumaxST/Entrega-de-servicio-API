const { check, validationResult } = require("express-validator");
const { app } = require("firebase-functions");

const schemas = {
    name: [
        check("product.name" , "SintaxError").custom((value, {req}) =>{
            // POST
            if(["POST"].includes(req.method) && !value){
                throw new Error("Product name is required");
            }
            // POST Y PUT
            if( value && typeof value !== "string"){
                throw new Error("Product name must be a string");
            }
            return true;
        }),
    ],
    noClients :[
        check("product.noClients" , "SintaxError").custom((value, {req}) =>{
            // POST
            if(["POST"].includes(req.method) && !value){
                throw new Error("Product noClients is required");
            }
            // POST Y PUT
            if( value && typeof value !== "number"){
                throw new Error("Product noClients must be a number");
            }
            return true;
        }),
    ],
    status: [
        check("product.status" , "SintaxError").custom((value, {req}) =>{
            // POST
            if(["POST"].includes(req.method) && !value){
                throw new Error("Product status is required");
            }
            // POST Y PUT
            if( value && typeof value !== "string"){
                throw new Error("Product status must be a string");
            }
            return true;
        }),
    ],
    price:[
        check("product.price" , "SintaxError").custom((value, {req}) =>{
            // POST
            if(["POST"].includes(req.method) && !value){
                throw new Error("Product price is required");
            }
            // POST Y PUT
            if( value && typeof value !== "number"){
                throw new Error("Product price must be a number");
            }
            return true;
        }),
    ],
    apiKey: [
        check("product.apiKey" , "SintaxError").custom((value, {req}) =>{
            // POST
            if(["POST"].includes(req.method) && !value){
                throw new Error("Product apiKey is required");
            }
            // POST Y PUT
            if( value && typeof value !== "string"){
                throw new Error("Product apiKey must be a string");
            }
            return true;
        }),
    ],
    description: [
        check("product.description" , "SintaxError").custom((value, {req}) =>{
            // POST
            if(["POST"].includes(req.method) && !value){
                throw new Error("Product description is required");
            }
            // POST Y PUT
            if( value && typeof value !== "string"){
                throw new Error("Product description must be a string");
            }
            return true;
        }),
    ]
}
module.exports = {
    get : [].concat(
        schemas.name,
        schemas.noClients,
        schemas.status,
        schemas.price,
        schemas.apiKey,
        schemas.description
    ),
    post : [].concat(
        schemas.name,
        schemas.noClients,
        schemas.status,
        schemas.price,
        schemas.apiKey,
        schemas.description
    ),
    put : [].concat(
        schemas.name,
        schemas.noClients,
        schemas.status,
        schemas.price,
        schemas.apiKey,
        schemas.description
    ),
    delete : [].concat(
        schemas.name,
        schemas.noClients,
        schemas.status,
        schemas.price,
        schemas.apiKey,
        schemas.description
    )
}