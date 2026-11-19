import { useEffect, useRef, useState } from 'react'

/** Speaking mashqi: tayyorgarlik → gapirish taymeri, ixtiyoriy ovoz yozish */
export default function Speaking({ data }) {
  const [qi, setQi] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | prep | talk | done
  const [left, setLeft] = useState(0)
  const [recordings, setRecordings] = useState({})
  const [micError, setMicError] = useState(null)
  const recRef = useRef(null)
  const chunks = useRef([])

  const question = data.questions[qi]

  useEffect(() => {
    if (phase !== 'prep' && phase !== 'talk') return
    if (left <= 0) {
      if (phase === 'prep') startTalk()
      else stop()
      return
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, left])

  useEffect(() => () => recRef.current?.stream?.getTracks().forEach((t) => t.stop()), [])

  const startTalk = async () => {
    setPhase('talk')
    setLeft(data.answer_seconds || 30)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunks.current = []
      rec.ondataavailable = (e) => chunks.current.push(e.data)
      rec.onstop = () => {
        const url = URL.createObjectURL(new Blob(chunks.current, { type: rec.mimeType }))
        setRecordings((r) => ({ ...r, [qi]: url }))
        stream.getTracks().forEach((t) => t.stop())
      }
      rec.start()
      recRef.current = rec
      setMicError(null)
    } catch {
      setMicError("Mikrofonga ruxsat berilmadi — taymer baribir ishlaydi.")
    }
  }

  const stop = () => {
    if (recRef.current?.state === 'recording') recRef.current.stop()
    recRef.current = null
    setPhase('done')
  }

  const start = () => {
    setPhase('prep')
    setLeft(data.prep_seconds || 5)
  }

  const go = (i) => {
    stop()
    setPhase('idle')
    setQi(i)
  }

  return (
    <div className="grid gap-md">
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <span className="tag tag-blue">Part {data.part}</span>
          <span className="tertiary">{qi + 1} / {data.questions.length}</span>
        </div>
        <p className="text-2xl m-0 my-sm font-display">{question}</p>

        {phase === 'idle' && <button className="btn btn-primary" onClick={start}>▶ Boshlash</button>}
        {(phase === 'prep' || phase === 'talk') && (
          <div className="flex items-center gap-md">
            <span className={`font-mono text-4xl ${phase === 'talk' ? 'text-bad' : ''}`}>{left}s</span>
            <span>{phase === 'prep' ? 'Tayyorlaning…' : <><span className="live-dot mr-1" /> Gapiring!</>}</span>
            {phase === 'talk' && <button className="btn" onClick={stop}>■ Tugatish</button>}
          </div>
        )}
        {phase === 'done' && (
          <div className="flex items-center gap-sm flex-wrap">
            {recordings[qi] && <audio controls src={recordings[qi]} />}
            <button className="btn" onClick={start}>↻ Qayta</button>
          </div>
        )}
        {micError && <p className="tertiary m-0 mt-1">{micError}</p>}
      </div>

      <div className="flex gap-sm justify-between">
        <button className="btn" disabled={qi === 0} onClick={() => go(qi - 1)}>← Oldingi</button>
        <button className="btn" disabled={qi === data.questions.length - 1} onClick={() => go(qi + 1)}>Keyingi →</button>
      </div>

      {data.tips?.length > 0 && (
        <div className="paper-sheet p-md pl-14 md:pl-20 border-2 border-bg-tertiary leading-8">
          <b>Maslahatlar:</b>
          <ul className="m-0 pl-5">{data.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      )}
    </div>
  )
}
