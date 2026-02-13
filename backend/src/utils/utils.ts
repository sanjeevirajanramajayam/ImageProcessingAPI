import crypto from 'crypto'

const getRandomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');


export default getRandomImageName