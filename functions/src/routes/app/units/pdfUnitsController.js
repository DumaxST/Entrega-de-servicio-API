const {cachedAsync} = require("../../../middlewares");
const {ClientError} = require("../../../middlewares/errors");
const {
  getSidFromToken,
  fetchAllUnitsWialon,
  isUnitReportingWialon,
} = require("../../../../generalFunctions");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const QuickChart = require("quickchart-js");
const path = require("path");
const axios = require("axios");

const generatePdf = async (data, outputPath) => {
  const doc = new PDFDocument({margin: 50});
  const stream = fs.createWriteStream(outputPath);

  doc.pipe(stream);

  // Header
  doc
    .rect(0, 0, doc.page.width, 50)
    .fill("#4CAF50")
    .fillColor("#FFFFFF")
    .fontSize(20)
    .text("Reporte de Unidades", 50, 15, {align: "center"})
    .fillColor("#000000");

  doc.moveDown(2);

  // Verifica si hay unidades
  if (data.totalUnits === 0) {
    doc
      .fontSize(14)
      .text("No hay unidades reportando momentáneamente.", {align: "center"});
    doc.end();
    return new Promise((resolve, reject) => {
      stream.on("finish", () => resolve(outputPath));
      stream.on("error", reject);
    });
  }

  const summaryStartY = doc.y;
  const summaryWidth = doc.page.width / 2 - 60;
  const chartWidth = 100;
  const chartHeight = 100;

  doc
    .fontSize(14)
    .text("Resumen:", {underline: true})
    .moveDown(0.5)
    .fontSize(12)
    .text(`Total de Unidades: ${data.totalUnits}`)
    .text(`Unidades Reportando: ${data.totalReportingUnits}`)
    .text(`Unidades No Reportando: ${data.totalNonReportingUnits}`)
    .text(`Efectividad: ${data.effectiveness}`, {width: summaryWidth});

  // Gráfico radial
  const chart = new QuickChart();
  chart.setConfig({
    type: "radialGauge",
    data: {
      datasets: [
        {
          data: [parseFloat(data.effectiveness)],
          backgroundColor: ["#4CAF50"],
          borderWidth: 2,
        },
      ],
    },
    options: {
      trackColor: "#F44336",
      centerPercentage: 80,
      centerArea: {
        text: `${data.effectiveness}`,
        fontSize: 14,
        fontColor: "#000",
      },
    },
  });
  chart.setWidth(chartWidth).setHeight(chartHeight);

  const chartUrl = await chart.getShortUrl();

  const response = await axios.get(chartUrl, {responseType: "arraybuffer"});
  const chartImage = Buffer.from(response.data, "binary");

  doc.image(chartImage, doc.page.width - chartWidth - 50, summaryStartY, {
    width: chartWidth,
    height: chartHeight,
  });

  doc.moveDown(3);

  // Tabla
  const tableTop = doc.y;
  const columnWidth = (doc.page.width - 100) / 2;
  const rowHeight = 20;

  // Encabezados de la tabla
  doc
    .rect(50, tableTop, columnWidth, rowHeight)
    .fill("#E8F5E9")
    .stroke("#000000")
    .fillColor("#000000")
    .fontSize(12)
    .text("Reportando", 55, tableTop + 5);

  doc
    .rect(50 + columnWidth, tableTop, columnWidth, rowHeight)
    .fill("#FFEBEE")
    .stroke("#000000")
    .fillColor("#000000")
    .fontSize(12)
    .text("No Reportando", 55 + columnWidth, tableTop + 5);

  let y = tableTop + rowHeight;

  const maxRows = Math.max(
    data.reportingUnits.length,
    data.nonReportingUnits.length
  );

  for (let i = 0; i < maxRows; i++) {
    if (y > doc.page.height - 50) {
      doc.addPage();
      y = 50;

      doc
        .rect(50, y, columnWidth, rowHeight)
        .fill("#E8F5E9")
        .stroke("#000000")
        .fillColor("#000000")
        .fontSize(12)
        .text("Reportando", 55, y + 5);

      doc
        .rect(50 + columnWidth, y, columnWidth, rowHeight)
        .fill("#FFEBEE")
        .stroke("#000000")
        .fillColor("#000000")
        .fontSize(12)
        .text("No Reportando", 55 + columnWidth, y + 5);

      y += rowHeight;
    }

    doc
      .rect(50, y, columnWidth, rowHeight)
      .stroke("#000000")
      .fillColor("#000000");

    if (i < data.reportingUnits.length) {
      const unit = data.reportingUnits[i];
      doc.fontSize(10).text(`- ${unit.nm} (ID: ${unit.id})`, 55, y + 5);
    }

    doc
      .rect(50 + columnWidth, y, columnWidth, rowHeight)
      .stroke("#000000")
      .fillColor("#000000");

    if (i < data.nonReportingUnits.length) {
      const unit = data.nonReportingUnits[i];
      doc
        .fontSize(10)
        .text(`- ${unit.nm} (ID: ${unit.id})`, 55 + columnWidth, y + 5);
    }

    y += rowHeight;
  }

  doc.moveDown(2);

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => resolve(outputPath));
    stream.on("error", reject);
  });
};

const getPdfUnits = async (req, res) => {
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

  const outputPath = path.join(__dirname, "units_report.pdf");
  
  try {
    await generatePdf(data, outputPath);

    if (!fs.existsSync(outputPath)) {
      throw new ClientError("PDF generation failed", 500);
    }

    const stats = fs.statSync(outputPath);
    
    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"units_report.pdf\"",
      "Content-Length": stats.size,
    });

    const fileStream = fs.createReadStream(outputPath);
    
    fileStream.on("error", (error) => {
      console.error("Error reading PDF file:", error);
      if (!res.headersSent) {
        res.status(500).json({error: "Error reading PDF file"});
      }
    });

    fileStream.pipe(res);

    fileStream.on("end", () => {
      fs.unlink(outputPath, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      });
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    
    if (fs.existsSync(outputPath)) {
      fs.unlink(outputPath, (err) => {
        if (err) {
          console.error("Error al eliminar el archivo:", err);
        }
      });
    }
    
    throw error;
  }
};

module.exports = {
  getPdfUnits: cachedAsync(getPdfUnits),
};
