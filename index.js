import { promises as fs } from 'fs'
import xml2js from 'xml2js'
import XLSX from 'xlsx'

async function readFiles(dirname) {
  const wb = XLSX.utils.book_new()
  // Crea una hoja de cálculo a partir de un array de arrays
  let ws_data = [['Folio', 'Detalle']]

  const filenames = await fs.readdir(dirname)
  for (let file of filenames) {
    const fileContent = await fs.readFile(
      dirname + file,
      'utf-8',
      (err, data) => {
        if (err) {
          console.error('Error al leer el archivo:', err)
          return
        }
        return data
      }
    )
    xml2js.parseString(
      fileContent,
      { explicitArray: false, ignoreAttrs: true },
      (parseErr, result) => {
        if (parseErr) {
          console.error('Error al parsear XML:', parseErr)
          return
        }
        const folio = result.DTE.Documento.Encabezado.IdDoc.Folio
        // Función para extraer el texto de los nodos XML recursivamente
        const extractTextFromObject = (obj) => {
          let text = ''
          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              text += extractTextFromObject(obj[key])
            } else {
              text += obj[key] + ' '
            }
          }
          return text
        }
        // Extraer el texto del objeto result
        const detalle = extractTextFromObject(result)
        // console.log('Folio:', folio)
        // console.log('Detalle:', detalle)
        ws_data = [...ws_data, [folio, detalle]]
      }
    )
  }
  filenames.forEach(async function (filename) {})
//   console.log(ws_data)
  const ws = XLSX.utils.aoa_to_sheet(ws_data)
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  XLSX.writeFile(wb, 'datos.xlsx')
}
readFiles('./XMLs/')
