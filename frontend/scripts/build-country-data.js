/**
 * Converts Excel + JSON country data files into static JSON
 * for serving from the public/ directory.
 *
 * Usage: node scripts/build-country-data.js
 */
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

const srcDir = path.join(__dirname, '..', 'data', 'countries')
const outDir = path.join(__dirname, '..', 'public', 'data', 'countries')

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

const xlsxFiles = fs
  .readdirSync(srcDir)
  .filter((f) => f.endsWith('.xlsx'))

console.log(`Found ${xlsxFiles.length} Excel file(s) to process`)

for (const file of xlsxFiles) {
  const code = path.basename(file, '.xlsx')
  const xlsxPath = path.join(srcDir, file)
  const jsonPath = path.join(srcDir, `${code}.json`)

  const workbook = XLSX.readFile(xlsxPath)
  const sheets = {}
  for (const name of workbook.SheetNames) {
    sheets[name] = XLSX.utils.sheet_to_json(workbook.Sheets[name], {
      defval: null,
    })
  }

  const text = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    : {}

  const output = { sheets, text }
  const outPath = path.join(outDir, `${code}.json`)
  fs.writeFileSync(outPath, JSON.stringify(output))

  console.log(`  ${code}: ${workbook.SheetNames.length} sheets → ${outPath}`)
}

console.log('Done.')
