const {response, cachedAsync} = require("../../../middlewares");

const get = async (req, res) => {
  const data = req.t("companies");
  return response(res, req, 200, data);
};

module.exports = {
  get: cachedAsync(get),
};
