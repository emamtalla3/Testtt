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
  const weighting = { min: 5, ok: 7, good: 11 }

  const heading = headingDefined(score)
  const image = await imageDefined(score)
  const form = formDefined(score)

  const [ inputs, labels ] = formattedInputs(score, form)
  const options = logInOn(score, inputs)
  shortText(score, form)
  sendButton(score, form)

  return { score, weighting }
}


function headingDefined(score) {
  const headings = document.querySelectorAll(`${qsBase} h1`)
  score.required.headingDefined = [
    headings.length === 1
      ? Number(headings[0].innerText.length > 0)
      : -headings.length + (headings.length === 0 ? 0 : 1), 1
  ]
  return headings[0]
}


async function imageDefined(score) {
  const image = document.querySelector(`${qsBase} img`)
  let errored = image ? await new Promise((resolve) => {
    image.onerror = () => { resolve(true) }
    image.onload = () => { resolve(false) }
    image.src = image.src
  }) : true
  score.required.imageDefined = [
    ((image?.src.length > 0 && !errored) + (image?.alt.length > 0))/2, 1
  ]
  return image
}


function formDefined(score) {
  const form = document.querySelector(`${qsBase} form`)
  score.required.formDefined = [ Number(form !== null), 1 ]
  return form
}


function formattedInputs(score, form) {
  /** @type {(HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement)[]} */
  const inputs = [ ...(form?.querySelectorAll("input:not([type='submit']), select") || []) ]
  /** @type {HTMLLabelElement[]} */
  const labels = [ ...(form?.querySelectorAll("label") || []) ]

  if (inputs.length && labels.length) {
    score.required.labelsAndTheirInputs = [ 
      labels.every(i => i.innerText.length > 0) + (
        inputs.every((i,n) => (i.parentElement === labels[n]) ^ (
          i.id === labels[n].getAttribute("for")
          && i.id === i.name
        ))
      ), 2 ]

    score.required.wellFormattedInputs = [ 
      inputs?.every(i => i.tagName === "INPUT" ? i.getAttribute("type") !== null : 1)*2
      + inputs?.every(i => i.getAttribute("name") !== null), 3
    ]
  } else {
    score.required.labelsAndTheirInputs = [0,2]
    score.required.wellFormattedInputs  = [0,3]
  }

  return [ inputs, labels ]
}


function logInOn(score, inputs) {
  const select   = inputs?.filter(i => i.tagName === "SELECT")[0]
  const children = [...(select?.children || [])]
  const options  = [{}, ...children?.filter(o => o.tagName === "OPTION")].reduce((c,v) => {
    if (!c[v.value]) c[v.value] = v
    return c
  })
  score.required.logInOn = [(
    (children.length !== 0 && children.length === Object.keys(options).length)
    + (
      Object.keys(options).length
        ? Object.values(options).every(o => o.value.length > 0 && o.innerText.length > 0)
        : 0
    )
  ), 2]
  return options
}


function shortText(score, form) {
  const text = form?.querySelector("p")
  const link = text?.children.item(0)
  score.optional.shortText = [
    Number(text?.innerText.length > 0 && link.href.length > 0), 1
  ]
}


function sendButton(score, form) {
  const inputs = [...(form?.querySelectorAll("input, select, textarea") || [])]
  const send = inputs.filter(i => i.type.toLowerCase() === "submit")
  score.required.sendButton = [
    Number(send.length === 1 && send[0] === inputs.at(-1)), 1
  ]
}
