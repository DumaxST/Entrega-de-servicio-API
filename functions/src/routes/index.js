const {producRouter} = require("./app/product/product.routes.js");
const unitsRouter = require("./app/units/units.routes.js");
const clientsRouter = require("./app/clients/clients.routes.js");
const devicesRouter = require("./app/devices/devices.routes.js");
const serviceTicketsRouter = require("./app/serviceTickets/serviceTickets.routes.js");
const usersRouter = require("./app/users/users.routes.js");
const systemConfigRouter = require("./app/systemConfig/systemConfig.routes.js");

module.exports = {
    producRouter,
    unitsRouter,
    clientsRouter,
    devicesRouter,
    serviceTicketsRouter,
    usersRouter,
    systemConfigRouter
};