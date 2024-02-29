import isDev from 'electron-is-dev'
import Jimp from 'jimp'
import util from 'util'
import fs from 'fs'

const readFile = util.promisify(fs.readFile)

const uploadPhoto = async (_, photo_path) => {
  const fileName = isDev
    ? './public/avatar.png'
    : 'http://localhost:3000/avatar.png'

  const width = 500
  const height = 500

  const photo = await readFile(photo_path)
  new Jimp({ data: photo, width, height }, (err, image) => {
    image.write(fileName)
  })
  console.log(`Photo is saved to ${fileName}`)
}

export default uploadPhoto
