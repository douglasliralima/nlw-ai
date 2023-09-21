import { FileVideo, Upload } from "lucide-react";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import api from "@/lib/axios";

type status = 'waiting' | 'converting' | 'done' | 'transcribing' | 'uploading'

interface VideoInputFormProps {
    onVideoUploaded: (id: string) => void
  }

export function VideoInputForm(props: VideoInputFormProps) {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string | null>(null);
    const [status, setStatus] = useState<status>('waiting');

    const statusMessages = {
        waiting: 'Esperando...',
        converting: 'Convertendo vídeo...',
        transcribing: 'Transcrevendo vídeo...',
        uploading: 'Enviando vídeo...',
        done: 'Pronto!'
    }

    const promptInputRef = useRef<HTMLTextAreaElement>(null);

    function handleFileSelected(e: ChangeEvent<HTMLInputElement>) {
        const { files } = e.currentTarget

        if (!files) {
            return
        }

        const selectedFile = files[0]

        setVideoFile(selectedFile)
    }

    async function convertVideoToAudio(video: File) {

        const ffmpeg = await getFFmpeg();

        // ffmpeg roda dentro do webassembly tipo um container, logo precisamos alimentar ele com o arquivo

        await ffmpeg.writeFile("input.mp4", await fetchFile(video))
    
        // ffmpeg.on('log', log => {
        //   console.log(log)
        // })
    
        ffmpeg.on('progress', progress => {
          console.log('Convert progress: ' + Math.round(progress.progress * 100))
        })
    
        await ffmpeg.exec([
          '-i',
          "input.mp4",
          '-b:a',
          '20k',
          '-f',
          'mp3',
          'output.mp3'
        ])
    
        const data = await ffmpeg.readFile('output.mp3')
    
        const audioFileBlob = new Blob([data], { type: 'audio/mp3' })
        const audioFile = new File([audioFileBlob], 'output.mp3', {
          type: 'audio/mpeg'
        })
    
        console.log('Convert finished.')
    
        return audioFile
      }

    const handleUploadVideo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const prompt = promptInputRef.current?.value

        if(!videoFile){
            return;
        }

        // Converter áudio em texto para facilitar/baratear envio ao Macken
        setStatus('converting')

        const audioFile = await convertVideoToAudio(videoFile);

        setStatus('uploading');

        const data = new FormData();

        data.append('file', audioFile);

        const response = await api.post('/videos', data);

        const videoId = response.data.data.id;

        setStatus('transcribing');

        const transcription = await api.post(`/videos/${videoId}/transcription`, {
            prompt: prompt
        })

        setTranscription(transcription.data.transcription);

        setStatus('done');

        props.onVideoUploaded(videoId)
    }

    const previewURL = useMemo(() => {
        if (!videoFile) {
            return null
        }

        return URL.createObjectURL(videoFile)
    }, [videoFile])

    return (
        <form onSubmit={handleUploadVideo} className="space-y-6">
            <Label
                htmlFor="video"
                className="flex flex-col gap-2 aspect-video border rounded-md cursor-pointer border-dashed justify-center items-center hover:bg-primary/10"
            >
                {previewURL ? (
                    <video src={previewURL} controls={false} className="pointer-events-none" />
                ) : (
                    <>
                        <FileVideo className="w-4 h-4" />
                        Selecionar video
                    </>
                )}
            </Label>
            <input
                type="file"
                id="video"
                accept="video/mp4"
                className="sr-only"
                onChange={handleFileSelected}
            />

            <Separator />

            <div className="space-y-1">
                <Label htmlFor="transcription_prompt">
                    Prompt de transcrição
                </Label>
                <Textarea
                    id="transcription_prompt"
                    disabled={status !== 'waiting'}
                    ref={promptInputRef}
                    className="min-h-20 leading-relaxed resize-none"
                    placeholder="Inclua palavras-chaves mencionadas no vídeo separadas por virgula (,)"
                />
            </div>

            <Button 
                data-sucess={ status === 'done' } 
                disabled={status !== 'waiting'} 
                type="submit"
                className="w-full data-[sucess=true]:bg-emerald-500"
            >
                {status === 'waiting' ? (<>
                    Carregar vídeo
                <Upload className="x-4 h-4 ml-2" />
                </>) : statusMessages[status]}
            </Button>
        </form>
    )
}