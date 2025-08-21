const {response, cachedAsync} = require("../../../middlewares");
const {ClientError} = require("../../../middlewares/errors");

const {
  getSidFromToken,
  fetchAllUnitsWialon,
  isUnitReportingWialon,
} = require("../../../../generalFunctions");

const getReport = async (req, res) => {
  const sid = await getSidFromToken();
  if (!sid) {
    throw new ClientError(req.t("SIDNotFound"), 404);
  }

  const units = await fetchAllUnitsWialon(sid);
  if (!units) {
    throw new ClientError(req.t("UnitsNotFound"), 404);
  }

  const reportingUnits = units
    .filter((unit) => isUnitReportingWialon(unit))
    .map((unit) => ({nm: unit.nm, id: unit.id}));

  const nonReportingUnits = units
    .filter((unit) => !isUnitReportingWialon(unit))
    .map((unit) => ({nm: unit.nm, id: unit.id}));


  const totalUnits = units.length;
  const effectiveness = ((reportingUnits.length / totalUnits) * 100).toFixed(2);

  const data = {
    totalUnits,
    totalReportingUnits: reportingUnits.length,
    totalNonReportingUnits: nonReportingUnits.length,
    reportingUnits,
    nonReportingUnits,
    effectiveness: `${effectiveness}%`,
  };

  return response(res, req, 200, data);
};

module.exports = {
  getReport: cachedAsync(getReport),
};
