const request = require("supertest");
const {App} = require("../../../../index"); // Asegúrate de que esta ruta sea correcta
const {
  getSidFromToken,
  fetchAllUnitsWialon,
  isUnitReportingWialon,
} = require("../../../../generalFunctions");

jest.mock("../../../../generalFunctions");

jest.mock("firebase-admin", () => {
  const actualAdmin = jest.requireActual("firebase-admin");
  return {
    ...actualAdmin,
    initializeApp: jest.fn(),
    credential: {
      cert: jest.fn(),
    },
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            docs: [],
          }),
        }),
        add: jest.fn().mockResolvedValue(true),
        doc: jest.fn().mockReturnValue({
          update: jest.fn().mockResolvedValue(true),
          delete: jest.fn().mockResolvedValue(true),
        }),
      }),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn().mockReturnValue({
        file: jest.fn().mockReturnValue({
          save: jest.fn().mockResolvedValue(true),
          delete: jest.fn().mockResolvedValue(true),
        }),
        getFiles: jest.fn().mockResolvedValue([
          // Mock de getFiles
          [{delete: jest.fn().mockResolvedValue(true)}],
        ]),
      }),
    }),
  };
});

const languages = ["es", "en"];
const lang = languages[Math.floor(Math.random() * languages.length)];

beforeAll(() => {
  jest.clearAllMocks();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET /units/report", () => {
  it("Should respond with a 404 error if the SID is not found or the access token is invalid", async () => {
    getSidFromToken.mockResolvedValue(null);

    const res = await request(App).get("/units/report").query({lang: lang});

    expect(res.status).toBe(404);
    expect(res.body.meta.message).toBe(
      lang === "es"
        ? "SID no encontrado o Access Token inválido"
        : "SID not found or invalid Access Token"
    );
  });

  it("Should respond with a 404 error if units are not found", async () => {
    getSidFromToken.mockResolvedValue("testSid");
    fetchAllUnitsWialon.mockResolvedValue(null);

    const res = await request(App).get("/units/report").query({lang: lang});

    expect(res.status).toBe(404);
    expect(res.body.meta.message).toBe(
      lang === "es" ? "Unidades no encontradas" : "Units not found"
    );
  });

  it("Should respond with the report data if units are found", async () => {
    getSidFromToken.mockResolvedValue("testSid");
    fetchAllUnitsWialon.mockResolvedValue([
      {
        nm: "Unit1",
        id: 1,
        lmsg: {t: 1738773707},
        pos: {t: 1738773707, y: 20.5215616, x: -103.29266, f: 3},
      },
      {
        nm: "Unit2",
        id: 2,
        lmsg: {t: 1738773707},
        pos: {t: 1738773707, y: 20.5215616, x: -103.29266, f: 3},
      },
    ]);
    isUnitReportingWialon.mockImplementation((unit) => unit.id === 1);

    const res = await request(App).get("/units/report").query({lang: lang});

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual({
      totalUnits: 2,
      totalReportingUnits: 1,
      totalNonReportingUnits: 1,
      reportingUnits: [{nm: "Unit1", id: 1}],
      nonReportingUnits: [{nm: "Unit2", id: 2}],
      effectiveness: "50.00%",
    });
  });
});
