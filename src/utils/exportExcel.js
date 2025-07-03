import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { Message } from 'element-ui'

export function exportExcel(tableId, fileName, vm) {
  try {
    // 1. 获取表格DOM（包含表头）
    const table = document.querySelector(`#${tableId}`)
    if (!table) throw new Error('表格DOM未找到')

    // 2. 克隆表格避免修改原DOM
    const clonedTable = table.cloneNode(true)
    
    // 3. 删除最后一列（不导出的列）
    const rows = clonedTable.querySelectorAll('tr')
    rows.forEach(row => {
      const lastCol = row.querySelector('td:last-child, th:last-child')
      if (lastCol) lastCol.remove()
    })

    // 4. 转换并导出
    const ws = XLSX.utils.table_to_sheet(clonedTable)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

    const wbout = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array'
    })

    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      `${fileName}.xlsx`
    )
    return true
  } catch (e) {
    console.error('导出失败:', e)
    vm?.$message?.error('导出Excel失败: ' + e.message)  // 安全调用
    return false
  }
}