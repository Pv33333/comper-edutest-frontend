import React from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    try {
      const accepted = localStorage.getItem('cookieAccepted') === 'true'
      if (!accepted) setVisible(true)
    } catch {}
  }, [])

  const accept = () => {
    try { localStorage.setItem('cookieAccepted', 'true') } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl bg-gradient-to-r from-white to-blue-50 border border-gray-200 shadow-xl rounded-2xl p-6 z-50 text-center text-gray-800">
      <h2 className="text-xl md:text-2xl font-semibold text-blue-800 mb-3">📢 Politica de Cookie-uri</h2>
      <p className="text-gray-700 mb-4">
        Folosim cookie-uri esențiale pentru funcționalitate, analize și personalizare.
        Continuând navigarea, ești de acord cu{' '}
        <a className="underline text-blue-700 hover:text-blue-900" href="/politica_cookie.html" target="_blank" rel="noreferrer">politica noastră</a>.
      </p>
      <button onClick={accept} className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">Accept</button>
    </div>
  )
}
