// Extract original embedded photographs; no image editing or recompression.
import fs from 'node:fs'
const files = ['About Wuai-lai1.svg','About Wuai-lai2.svg','About Wuai-lai3.svg','About Wuai-lai4.svg','About Wuai-lai5.svg']
const names = ['craft','temple','people','street','tourism']
fs.mkdirSync('public/about', {recursive:true})
files.forEach((file,index) => {
  const svg=fs.readFileSync(`sources/ui-v4/${file}`,'utf8')
  const image=svg.match(/<image\b[^>]*xlink:href="data:image\/(jpeg|png);base64,([^"]+)"/)
  if(!image) throw new Error(`Missing photograph: ${file}`)
  fs.writeFileSync(`public/about/${names[index]}.${image[1]==='jpeg'?'jpg':'png'}`,Buffer.from(image[2],'base64'))
})
