import {uploadLocalImage} from './src/utils/cloudinary/upload'

const mailImage = "./resource/image.png"
const button = "./resource/button.png"

uploadLocalImage(mailImage)
  .then(url => console.log('업로드된 이미지 URL:', url))
  .catch(error => console.error('업로드 중 오류 발생:', error));

// uploadLocalImage(button)
//   .then(url => console.log('업로드된 이미지 URL:', url))
//   .catch(error => console.error('업로드 중 오류 발생:', error));