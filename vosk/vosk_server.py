import asyncio
import websockets
import json
import sounddevice as sd
import queue
from vosk import Model, KaldiRecognizer

SAMPLE_RATE = 16000
MODEL_PATH = "model"  # Download from https://alphacephei.com/vosk/models and unzip as 'model'

q = queue.Queue()

def audio_callback(indata, frames, time, status):
    q.put(bytes(indata))

async def recognize(websocket):
    model = Model(MODEL_PATH)
    rec = KaldiRecognizer(model, SAMPLE_RATE)
    with sd.RawInputStream(samplerate=SAMPLE_RATE, blocksize=8000, dtype='int16',
                           channels=1, callback=audio_callback):
        print("Listening...")
        while True:
            data = q.get()
            if rec.AcceptWaveform(data):
                result = rec.Result()
                text = json.loads(result).get("text", "")
                msg = json.dumps({"type": "final", "text": text})
                await websocket.send(msg)
                print("Transcript sent to client (final):", text)
            else:
                partial = rec.PartialResult()
                text = json.loads(partial).get("partial", "")
                msg = json.dumps({"type": "partial", "text": text})
                await websocket.send(msg)
                print("Transcript sent to client (partial):", text)

async def main():
    async with websockets.serve(recognize, "localhost", 2700):
        print("Vosk server started on ws://localhost:2700")
        await asyncio.Future()  # run forever

asyncio.run(main()) 