"use strict"
/**
 * @param {string} tag 
 * @return {SVGElement}
 */
function createElementSVG(tag) {
  return document.createElementNS("http://www.w3.org/2000/svg", tag)
}

/** @type {HTMLElement} */
const tias = document.createElement("section")
tias.style.position = "fixed"
tias.style.bottom = 0
tias.style.right = 0
tias.style.margin = "1ch"
tias.style.zIndex = 9
tias.id = "task-indicators"
document.getElementsByTagName("body")[0].appendChild(tias)


function createTaskIndicator() {
  /** @type {HTMLDivElement} */
  const tia = document.createElement("div")
  tia.style.scale = 0
  tia.style.transition = "scale 640ms cubic-bezier(0.34, 1.56, 0.64, 1)"
  /** @type {SVGElement} */
  const tiaSVG = createElementSVG("svg")
  tiaSVG.setAttribute("height", "32")
  tiaSVG.setAttribute("width", "32")
  /** @type {SVGCircleElement} */
  const taskIndicator = createElementSVG("circle")
  taskIndicator.setAttribute("cx", "16")
  taskIndicator.setAttribute("cy", "16")
  taskIndicator.setAttribute("r", "8")
  taskIndicator.style.transition = "fill 420ms ease"
  tias.appendChild(tia)
    .appendChild(tiaSVG)
    .appendChild(taskIndicator)
  return taskIndicator
}

const qsBase = "html head + body"


async function check() {
  const titles = new Set(
    document.querySelector("html head title")?.innerText.split("+").flatMap(t => {
      const dash = t.split("-")
      if (dash.length > 1) {
        const arr = t.split("-").map((p, _, a) => `${a[0]}-${p}`)
        arr.shift()
        return arr
      } else return dash
    }) || ["NoTitleDeclared"]
  )
  const tasks = await fetch("/js/test/tasks.json").then(t => t.json())
  const grade = { "pointsSum": 0, "pointsScored": 0 }
  for (const title of [...titles, "GeneralTests"]) {
    const taskIndicator = createTaskIndicator()
    const { score, weighting } = await test(tasks, title)
    const result = calculateResult(score)
    // erreichte punktzahl    
    grade.pointsScored += result.required + result.optional
    // maximale erreichbare punktzahl
    grade.pointsSum += result.maxReq + result.maxOpt
    taskIndicatorColor(taskIndicator, weighting, result)
    taskIndicatorTitle(taskIndicator, title, score, weighting, result)
  }

  return JSON.stringify(grade);
}


/**
 * @return {{
 *  score: {
 *     required: {[k:string]:[number,number]},
 *     optional: {[k:string]:[number,number]}
 *   },
 *   weighting: { min:number, ok:number, good:number }
 * }}
 */
async function test(tasks, title) {
  try {
    if (title in tasks) return await import(`/js/test/${title}.js`).then(j => j.test())
    else throw new Error(`${title} not in task list`)
  } catch (e) {
    console.log(e)
    return {
      score: {
        required: {
          taskDeclared: [Number(title in tasks), 1]
        }, optional: {}
      },
      weighting: { min: 55, ok: 77, good: 99 }
    }
  }
}


function calculateResult(score) {
  const [reqVal, optVal] = [
    Object.values(score.required),
    Object.values(score.optional)
  ]
  return {
    required: reqVal.length ? reqVal.map(r => r[0]).reduce((s, v) => s + v) : 0,
    maxReq: reqVal.length ? reqVal.map(r => r[1]).reduce((s, v) => s + v) : 0,
    optional: optVal.length ? optVal.map(o => o[0]).reduce((s, v) => s + v) : 0,
    maxOpt: optVal.length ? optVal.map(o => o[1]).reduce((s, v) => s + v) : 0
  }
}


function taskIndicatorColor(taskIndicator, weighting, result) {
  const score = result.required + result.optional
  if (score < weighting.min) taskIndicator.setAttribute("fill", "red")
  else if (score < weighting.ok) taskIndicator.setAttribute("fill", "gold")
  else if (score < weighting.good) taskIndicator.setAttribute("fill", "green")
  else if (score === result.maxReq + result.maxOpt) taskIndicator.setAttribute("fill", "rebeccapurple")
  else if (score >= weighting.good) taskIndicator.setAttribute("fill", "turquoise")
  taskIndicator.parentElement.parentElement.style.scale = 1
}


function taskIndicatorTitle(taskIndicator, title, score, weighting, result) {
  const [reqKey, optKey] = [
    Object.keys(score.required),
    Object.keys(score.optional)
  ]

  const sum = {
    points: `Required: ${reduceDigits(result.required)}/${reduceDigits(result.maxReq)}`
      + ` | Optional: ${reduceDigits(result.optional)}/${reduceDigits(result.maxOpt)}`
      + ` | Total: ${reduceDigits(result.required + result.optional)}/${reduceDigits(result.maxReq + result.maxOpt)}`,

    tasks: `Required:\n${reqKey.length
        ? reqKey.map(r => `${reduceDigits(score.required[r][0])}\t/\t${reduceDigits(score.required[r][1])}\t-\t${r}\n`).reduce((s, r) => s + r)
        : "Something went horribly wrong\n"
      }Optional:\n${optKey.length
        ? optKey.map(o => `${reduceDigits(score.optional[o][0])}\t/\t${reduceDigits(score.optional[o][1])}\t-\t${o}\n`).reduce((s, o) => s + o)
        : "none\n"
      }`,

    score: (score.required.taskDeclared && score.required.taskDeclared[0]
      ? `0\t-\t${weighting.min - 1}\tis below the minimum (RED),\n`
      + `${weighting.min}\t-\t${weighting.ok - 1}\tis just okay (YELLOW),\n`
      + `${weighting.ok}\t-\t${weighting.good - 1}\tis good (GREEN),\n`
      + `${weighting.good}\t-\t${result.maxReq + result.maxOpt - 1}\tis great (TURQUOISE),\n`
      + `and\t\t${result.maxReq + result.maxOpt}\tis awesome (PURPLE)`
      : "Don't forget to declare your task in the head's title field!\n"
      + "We can't find your task otherwise."
    )
  }

  taskIndicator.parentElement.parentElement.title = `${title}\n\n${sum.points}\n\n${sum.tasks}\n${sum.score}`
}

function reduceDigits(x) {
  return x % 1 === 0 ? x : x.toFixed(2)
}


check()
