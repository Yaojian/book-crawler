import * as xl from "exceljs";

describe("exceljs", () => {
  it("create a workbook and add some cells", async () => {
    const xlWorkbook = new xl.Workbook();
    const xlSheet = xlWorkbook.addWorksheet("books");

    for (let i = 1; i <= 10; i++) {
      const row = xlSheet.getRow(i);
      row.getCell(1).value = `row-${i}/1`;
      row.getCell(2).value = `row-${i}/2`;
      row.getCell(3).value = `row-${i}/3`;
      row.getCell(4).value = `row-${i}/4-very-long\r\nAnother line`;
      row.getCell(4).alignment = { wrapText: true };
    }

    await xlWorkbook.xlsx.writeFile("exceljs-example.xlsx");
  });
});
