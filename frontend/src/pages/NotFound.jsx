import { Link } from 'react-router-dom'
import { Paper } from '../components/ui'

export default function NotFound() {
  return (
    <Paper variant="lined" className="min-h-[60vh]">
      <h1>404 — sahifa topilmadi</h1>
      <p className="secondary">Bu varaq daftardan yirtib olingan ko'rinadi.</p>
      <Link to="/" className="btn">← Bosh sahifa</Link>
    </Paper>
  )
}
