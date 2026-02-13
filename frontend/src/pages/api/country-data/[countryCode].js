import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

export default function handler(req, res) {
  const { countryCode } = req.query

  if (!countryCode || !/^[A-Z]{3}$/.test(countryCode)) {
    return res.status(400).json({ error: 'Invalid country code' })
  }

  const dir = path.join(process.cwd(), 'data', 'countries')
  const xlsxPath = path.join(dir, `${countryCode}.xlsx`)
  const jsonPath = path.join(dir, `${countryCode}.json`)

  if (!fs.existsSync(xlsxPath)) {
    return res.status(404).json({ error: 'Country data not found' })
  }

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

  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate')
  res.status(200).json({ sheets, text })
}
