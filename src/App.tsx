import { Show, createEffect, createSignal, onMount } from 'solid-js'
import './App.css'
import { LOCAL_STORAGE_KEYS, SYSTEM_PROMPT } from './constants'
import robot from '../assets/robot.png'
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai'

function App() {
  const [token, setToken] = createSignal(
    localStorage.getItem(LOCAL_STORAGE_KEYS.GEMINI_API_KEY) ?? '',
  )
  let file: Blob | undefined = void 0
  const [getImageUrl, setImageUrl] = createSignal('')
  const [generatedText, setGeneratedText] = createSignal('')
  createEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.GEMINI_API_KEY, token())
  })

  const generate = async () => {
    if (!file) {
      return
    }
    const b64 = await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(
          (reader.result as string).replace(/^data:image\/.+?;base64,/, ''),
        )
      }
      reader.readAsDataURL(file as Blob)
    })

    const genAI = new GoogleGenerativeAI(token())
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const chat = model.startChat({
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.5
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE
        }
      ]
    })
    const result = await chat.sendMessage([
      {
        text: SYSTEM_PROMPT,
      },
      {
        inlineData: {
          data: b64,
          mimeType: file.type,
        },
      },
    ])
    const res = result.response.text()
    console.log(res)
    setGeneratedText(res)
  }
  return (
    <>
    <div class="flex flex-col h-[100dvh]">
      <div>
        <label>
          Enter Gemini API Key:
          <input
            class="border p-1 m-1 rounded-full"
            placeholder="xxxx-xxxx"
            type="password"
            value={token()}
            onInput={(e) => setToken(e.target.value)}
          />
        </label>
        <div class="flex justify-around">
          <button
            type="button"
            class="p-2 rounded-full bg-blue-500 text-white"
            onClick={() => {
              const inp = document.createElement('input')
              inp.type = 'file'
              inp.onchange = () => {
                file = inp?.files?.[0]
                if (file) {
                  const url = URL.createObjectURL(file)
                  setImageUrl(url)
                }
                inp.remove()
              }
              inp.click()
            }}
          >
            ファイルを選択
          </button>
          <button
            type="button"
            class="rounded-full p-2 bg-blue-500 text-white disabled:opacity-30"
            disabled={!getImageUrl()}
            onClick={() => {
              generate()
            }}
          >
            生成
          </button>
        </div>
      </div>
      <div class="grow h-full">
        <Show when={!!getImageUrl()}>
          <div class="relative w-full h-full">
            <div class="h-full">
              <img src={getImageUrl()} alt="target" class="max-w-full max-h-full" />
            </div>
            <div class="absolute right-0 bottom-0">
              <img src={robot} alt="target" />
              <div
                class="absolute text-center text-2xl grid place-items-center font-bold"
                style={{
                  //  bottom: '500px',
                  right: '70px',
                  top: '50px',
                  height: '200px',
                  width: '400px',
                }}
              >
                <div>{generatedText()}</div>
              </div>
            </div>
          </div>
        </Show>
      </div>
      </div>
    </>
  )
}

export default App
