const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('Client.xlsx');
  const result = {};

  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    // Get up to 3 rows to understand the structure
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }).slice(0, 4);
    result[sheetName] = data;
  });

  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error("Failed to read excel:", e.message);
}
