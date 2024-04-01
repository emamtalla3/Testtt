"use strict"
/**
 * @return {{
 *  score: {
 *    required: {[k:string]:[number,number]},
 *    optional: {[k:string]:[number,number]}
 *  },
 *  weighting: { min:number, ok:number, good:number }
 * }}
 */
export async function test() {
  /**
   * @type {{
   *   required: {[k:string]:[number,number]},
   *   optional: {[k:string]:[number,number]}
   * }}
   */
  const score = { required: { taskDeclared: [1,1] }, optional: {} }
  const weighting = { min: 7, ok: 10, good: 13 }

  const table = absReq(score)
  if (Object.values(score.required).some(r => !r[0])) return { score, weighting }

  const tr = [...document.querySelectorAll(`${qsBase} table tr`)]
  
  optTheadTbodyUsed(score, table, tr)
  reqTableHeadRow(score, tr)

  const th12345 = reqTableComumnTime(score, tr)

  reqFrom08AM(score, th12345)
  reqFrom09AM(score, th12345)
  reqFrom10AM(score, th12345)
  reqFrom11AM(score, th12345)
  reqFrom12PM(score, th12345)

  return { score, weighting }
}


function absReq(score) {
  const table = document.querySelector(`${qsBase} table`)
  score.required.tableTagExists = [Number(table?.tagName === "TABLE"), 1]
  return table
}


function optTheadTbodyUsed(score, table, tr) {
  score.optional.theadUsed = [
      Number(
        table?.children.item(0)?.tagName === "THEAD"
        && tr[0]?.parentElement?.tagName === "THEAD"
      ), 1
  ]
  score.optional.tbodyUsed = [
      Number(
        (table?.children.item(0)?.tagName === "TBODY" ^ table?.children.item(1)?.tagName === "TBODY")
        &&  tr[1]?.parentElement?.tagName === "TBODY"
      ), 1
  ]
}


function reqTableHeadRow(score, tr) {
  if ([...tr[0]?.children].filter(h => h.tagName === "TH").length > 1) {
    const tr0 = tr.shift()
    const tr0td = tr0 ? tr0?.children.item(0) : document.createElement("div")
    const tr0th = tr0 ? [...tr0?.children].filter(r => r.tagName === "TH") : []
    score.required.tableHeadRow = [
        (tr0td?.tagName === "TD" && tr0td?.innerText === "")
        + (tr0th.length === 5) + (
          tr0th[0]?.innerText === "Montag"
          && tr0th[1]?.innerText === "Dienstag"
          && tr0th[2]?.innerText === "Mittwoch"
          && tr0th[3]?.innerText === "Donnerstag"
          && tr0th[4]?.innerText === "Freitag"
        ), 3
    ]
  } else score.required.tableHeadRow = [ 0, 3 ]
}


function reqTableComumnTime(score, tr) {
  const th12345 = tr?.map(r => r.children.item(0)).filter(h => h !== null)
  const isAllTH = th12345.map(h => h?.tagName === "TH")
  score.required.tableColumnTime = [
      (isAllTH.length ? isAllTH.reduce((s,h) => s+h) === 5 : 0) + (
        th12345[0]?.innerText === "8:00 Uhr"
        && th12345[1]?.innerText === "9:00 Uhr"
        && th12345[2]?.innerText === "10:00 Uhr"
        && th12345[3]?.innerText === "11:00 Uhr"
        && th12345[4]?.innerText === "12:00 Uhr"
      ), 2
  ]
  return th12345
}


function reqFrom08AM(score, th12345) {
  /** @type {HTMLTableCellElement[]} */
  const tr1td = [...(th12345[0]?.parentElement.children || [])].filter(d => d.tagName === "TD")
  score.required.from08AM = [
      (tr1td.length === 5) + (
        tr1td[0]?.innerText === "Sport"
        && tr1td[1]?.innerText === "Frei"
        && tr1td[2]?.innerText === "Urlaub"
        && tr1td[3]?.innerText === "Urlaub"
        && tr1td[4]?.innerText === "Urlaub"
      ) + (
        tr1td[0]?.rowSpan === 2 && tr1td[0]?.colSpan === 1
        && tr1td[1]?.rowSpan === 1 && tr1td[1]?.colSpan === 1
        && tr1td[2]?.rowSpan === 4 && tr1td[2]?.colSpan === 1
        && tr1td[3]?.rowSpan === 4 && tr1td[3]?.colSpan === 1
        && tr1td[4]?.rowSpan === 4 && tr1td[4]?.colSpan === 1
      ), 3
  ]
}


function reqFrom09AM(score, th12345) {
  /** @type {HTMLTableCellElement[]} */
  const tr2td = [...(th12345[1]?.parentElement.children || [])].filter(d => d.tagName === "TD")
  score.required.from09AM = [
      Number(
        tr2td.length === 1
        && tr2td[0]?.innerText === "Lesen"
        && tr2td[0]?.rowSpan === 3
        && tr2td[0]?.colSpan === 1
      ), 1
  ]
}


function reqFrom10AM(score, th12345) {
  /** @type {HTMLTableCellElement[]} */
  const tr3td = [...(th12345[2]?.parentElement.children || [])].filter(d => d.tagName === "TD")
  score.required.from10AM = [
    Number(
      tr3td.length === 1
      && tr3td[0]?.innerText === "Rechnen"
      && tr3td[0]?.rowSpan === 1
      && tr3td[0]?.colSpan === 1
    ), 1
  ]
}


function reqFrom11AM(score, th12345) {
  /** @type {HTMLTableCellElement[]} */
  const tr4td = [...(th12345[3]?.parentElement.children || [])].filter(d => d.tagName === "TD")
  score.required.from11AM = [
    Number(
      tr4td.length === 1
      && tr4td[0]?.innerText === "Schreiben"
      && tr4td[0]?.rowSpan === 1
      && tr4td[0]?.colSpan === 1
    ), 1
  ]
}


function reqFrom12PM(score, th12345) {
  /** @type {HTMLTableCellElement[]} */
  const tr5td = [...(th12345[4]?.parentElement.children || [])].filter(d => d.tagName === "TD")
  score.required.from12PM = [
    (tr5td.length === 1 && tr5td[0]?.innerText === "Mittagessen")
    + (tr5td[0]?.colSpan === 5), 2
  ]
}
