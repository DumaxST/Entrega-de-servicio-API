const {response, cachedAsync} = require("../../../middlewares");

const get = async (req, res) => {
  const data = req.t("groups");
  return response(res, req, 200, data);
};

module.exports = {
  get: cachedAsync(get),
};
