function fromFp(v) {
  let e = v[0]
  if (e === 0) { return 0.0 }
  e = e - 128
  const s = (v[1] & 0x80) ? -1 : 1
  v[1] = v[1] | 0x80
  let p = 1
  let m = 0
  for (let by = 1; by <= 4; by++) {
    let vb = v[by]
    for (let bi = 7; bi >= 0; bi--) {
      if (vb & 2**bi) {
        m = m + 2**(-p)
      }
      p = p + 1
    }
  }
  return s*(m * 2**e)
}

const v = [ 0xff, 0xff, 0xff, 0xff, 0xff ]

const fp = fromFp(v)
console.log(v, '=', fp)
