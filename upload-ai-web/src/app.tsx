import { Wand } from "lucide-react"
import { Header } from "./components/header/header"
import { Textarea } from "./components/ui/textarea"
import { Separator } from "./components/ui/separator"
import { Label } from "./components/ui/label"
import { Button } from "./components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Slider } from "./components/ui/slider"
import { VideoInputForm } from "./components/videoInputForm/videoInputForm"
import { useState } from "react"
import { PromptSelect } from "./components/promptSelect/promptSelect"
import { useCompletion } from 'ai/react'


function App() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)
  
  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading,
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature,
    },
    headers: {
      'Content-Type': 'application/json',
    }
  })

  return (
    <div className='min-h-screen flex flex-col'>

      <Header />

      <div className='p-6 flex-1 flex gap-6'>

        <div className='flex flex-col flex-1 gap-4'>

          <div className='grid grid-rows-2 flex-1 gap-4'>
            <Textarea
              className="p-6 leading-relaxed resize-none"
              placeholder="Inclua o prompt para a IA..."
              value={input} 
              onChange={handleInputChange}
              />
              
            <Textarea
              className="p-6 leading-relaxed resize-none"
              placeholder="Resultado gerado pela IA..."
              readOnly 
              value={completion}/>
          </div>

          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variavel
            <code className="text-violet-400">
              {" {transcription} "}
            </code>
            no seu prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
          </p>

        </div>

        <aside className="w-80 space-y-6 ">

          <VideoInputForm onVideoUploaded={setVideoId}/>

          <Separator />

          <form onSubmit={handleSubmit} className="space-y-6">
            <PromptSelect onPromptSelected={setInput} />

            <div className="space-y-3">
              <Label>Modelo:</Label>
              <Select defaultValue='gpt3.5'>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt3.5">
                    GPT 3.5-turbo 16K
                  </SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-muted-foreground italic text-xs">
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Temperatura:</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[temperature]}
                onValueChange={value => setTemperature(value[0])}
              />
              <span className="block text-muted-foreground italic text-xs">
                Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros.
              </span>
            </div>

            <Separator />

            <Button disabled={isLoading} type="submit" className="w-full">
              Executar
              <Wand className="ml-2" />
            </Button>
          </form>
        </aside>
      </div>
    </div>

  )
}

export default App
