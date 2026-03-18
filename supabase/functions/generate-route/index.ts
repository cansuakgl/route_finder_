// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// import { GoogleGenerativeAI } from "npm:@google/generative-ai"

// // 1. CORS Ayarları: Mobil uygulamanın bu fonksiyona erişebilmesi için şart.
// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }

// serve(async (req) => {
//   // Browser veya Expo'dan gelen ön kontrol (preflight) isteğini yanıtla
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     // 2. Mobil uygulamadan (llm.ts) gelen veriyi oku
//     const { query } = await req.json()
    
//     // 3. Supabase Dashboard'a eklediğin API Key'i çek
//     const apiKey = Deno.env.get('GEMINI_API_KEY')
//     if (!apiKey) throw new Error("GEMINI_API_KEY eksik! Supabase Secrets'a ekle.")

//     const genAI = new GoogleGenerativeAI(apiKey)
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

//     // 4. Gemini'a talimat ver (Senin sistemindeki tablo yapısına uygun formatta isteyelim)
//     const prompt = `Kullanıcı isteği: "${query}". 
//     Lütfen İstanbul içinde bu isteğe uygun 5 popüler mekanı şu JSON formatında döndür:
//     { "places": [ { "name": "Mekan Adı", "address": "Mekanın Açık Adresi" } ] }
//     Sadece JSON döndür, başka açıklama yapma.`

//     const result = await model.generateContent(prompt)
//     const response = await result.response
//     const text = response.text()

//     // 5. Yanıtı mobil uygulamaya geri gönder
//     return new Response(text, {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 200,
//     })

//   } catch (error) {
//     return new Response(JSON.stringify({ error: error.message }), {
//       headers: { ...corsHeaders, 'Content-Type': 'application/json' },
//       status: 400,
//     })
//   }
// })