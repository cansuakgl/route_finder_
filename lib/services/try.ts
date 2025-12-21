import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'

console.log('KEY:', process.env.EXPO_ANON_GOOGLE_API_KEY)

const genAI = new GoogleGenerativeAI(process.env.EXPO_ANON_GOOGLE_API_KEY!)

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

const res = await model.generateContent('Say hello')
console.log(res.response.text())


