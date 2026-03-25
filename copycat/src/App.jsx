import { useEffect, useState } from 'react'
import './App.css'

function extractTextFromRecord(record) {
  if (!record) {
    return ''
  }

  if (typeof record === 'string') {
    return record
  }

  if (typeof record.data === 'string') {
    return record.data
  }

  if (typeof record.text === 'string') {
    return record.text
  }

  return ''
}

function extractLatestText(payload) {
  if (Array.isArray(payload)) {
    if (payload.length === 0) {
      return ''
    }

    const recordsWithDate = payload.filter((item) => item?.createdAt)
    if (recordsWithDate.length > 0) {
      recordsWithDate.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      return extractTextFromRecord(recordsWithDate[0])
    }

    return extractTextFromRecord(payload[payload.length - 1])
  }

  return extractTextFromRecord(payload)
}

function App() {
  const apiBase = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? '/api' : '/apitest/api')
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadLatestEntry = async () => {
      try {
        const response = await fetch(`${apiBase}/LargeTextData`)

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = await response.json()
        const latestText = extractLatestText(payload)

        if (!isMounted) {
          return
        }

        if (latestText) {
          setText(latestText)
          setStatusMessage('Loaded latest entry.')
          return
        }

        setStatusMessage('No saved text found yet.')
      } catch (error) {
        if (isMounted) {
          setStatusMessage(`Could not load latest data: ${error.message}`)
        }
      }
    }

    loadLatestEntry()

    return () => {
      isMounted = false
    }
  }, [apiBase])

  const handleUpdate = async () => {
    if (!text.trim()) {
      setStatusMessage('Please enter some text before updating.')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Saving...')

    try {
      const response = await fetch(`${apiBase}/LargeTextData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: text }),
      })

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      setStatusMessage('Saved to database successfully.')
    } catch (error) {
      setStatusMessage(`Failed to save data: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClear = () => {
    setText('')
    setStatusMessage('Text area cleared.')
  }

  const handleRefresh = async () => {
    setIsSubmitting(true)
    setStatusMessage('Refreshing...')
    try {
      const response = await fetch(`${apiBase}/LargeTextData`)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const payload = await response.json()
      const latestText = extractLatestText(payload)
      setText(latestText)
      setStatusMessage(latestText ? 'Refreshed successfully.' : 'No saved text found.')
    } catch (error) {
      setStatusMessage(`Could not refresh: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <span className="kitty-logo">😸</span>
        <h1>Copycat!!!</h1>
      </header>

      <main className="main-content">
        <textarea
          className="text-box"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter your text here..."
        />

        <div className="button-row">
          <button className="update-btn" onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update'}
          </button>
          <button className="clear-btn" onClick={handleClear} disabled={isSubmitting || !text}>
            Clear
          </button>
          <button className="clear-btn" onClick={handleRefresh} disabled={isSubmitting}>
            Refresh
          </button>
        </div>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </main>
    </div>
  )
}

export default App
