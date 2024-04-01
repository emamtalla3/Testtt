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
  const weighting = { min: 2, ok: 4, good: 6 }

  //const _absReq = absReq(score)
  //if (Object.values(score.required).some(r => !r[0])) return { score, weighting }
  noDuplicateIDs(score)
  atMostOneH1(score)
  headingsReachableViaURL(score)
  imagesWellDefined(score)
  placeholders(score)

  return { score, weighting }
}

function noDuplicateIDs(score) {
  const elemsWithID = [...document.querySelectorAll("*[id]")]
  const uniqueIDs = new Set(elemsWithID.map(e => e.id))
  score.required.noDuplicateIDs = [(
    elemsWithID.length === uniqueIDs.size ? 2 : (elemsWithID.length - uniqueIDs.size)
  ), 2]
}

function atMostOneH1(score) {
  const h1s = [...document.querySelectorAll(`${qsBase} h1`)]
  score.optional.atMostOneH1 = [ h1s.length < 2 ? 2 : -(h1s.length-1), 2 ]
}

function headingsReachableViaURL(score) {
  const headings = [...document.querySelectorAll(`${qsBase} :is(h1, h2, h3, h4, h5, h6)`)]
  const ids = new Set(headings.map(h => h.id))
  score.optional.headingsReachableViaURL = [
    (headings.length === ids.size)
    + ([...ids.values()].every(id => id.length > 0)), 2
  ]
}

async function imagesWellDefined(score) {
  const images = [...document.querySelectorAll(`${qsBase} img`)]
  let i = 0
  for (const image of images) {
    const errored = await new Promise((resolve) => {
      image.onerror = () => { resolve(true) }
      image.onload = () => { resolve(false) }
      image.src = image.src
    })
    i += ((image?.src.length > 0 && !errored) + (image?.alt.length > 0)) / 2
  }
  score.required.imagesWellDefined = [ images.length ? i / images.length : 1, 1 ]
}

function placeholders(score) {
  const inputs = [ ...(document.querySelectorAll(`${qsBase} input:not([type='submit'])`) || []) ]
  score.optional.placeholders = [Number(inputs.every(i => i.placeholder.length > 0)), 1]
}

function absReq(score) {
  const thing = document.querySelector(`${qsBase}`)
  score.required.formDefined = [ Number(thing !== null), 1 ]
  return thing
}
