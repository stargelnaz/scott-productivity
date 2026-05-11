import { useState, useEffect, useCallback } from 'react'
import './App.css'

function App() {
  const [emails, setEmails] = useState(() => {
    const saved = localStorage.getItem('triage-emails')
    return saved ? JSON.parse(saved) : []
  })
  const [currentIndex, setCurrentIndex] = useState(0)
  const [rawText, setRawText] = useState('')
  const [view, setView] = useState(emails.length > 0 ? 'triage' : 'capture')
  const [showList, setShowList] = useState(false)

  useEffect(() => {
    localStorage.setItem('triage-emails', JSON.stringify(emails))
  }, [emails])

  const copyFollowUps = () => {
    const followUps = emails
      .filter(e => e.status === 'follow-up')
      .map(e => `${e.sender}: ${e.subject}`)
      .join('\n')
    navigator.clipboard.writeText(followUps)
    alert('Follow-ups copied to clipboard!')
  }

  const parseEmails = () => {
    const lines = rawText.split('\n').filter(line => line.trim().length > 0)
    const newEmails = lines.map((line, index) => {
      // Basic heuristic for Outlook tab-separated copy-paste
      const parts = line.split('\t')
      if (parts.length >= 2) {
        return {
          id: Date.now() + index,
          sender: parts[0].trim(),
          subject: parts[1].trim(),
          date: parts[2] ? parts[2].trim() : 'Unknown Date',
          status: 'pending', // pending, done, delete, follow-up
          raw: line
        }
      }
      return {
        id: Date.now() + index,
        sender: 'Unknown',
        subject: line.trim(),
        date: 'Unknown Date',
        status: 'pending',
        raw: line
      }
    })

    setEmails(newEmails)
    setView('triage')
    setCurrentIndex(0)
  }

  const handleAction = useCallback((status) => {
    if (emails.length === 0) return
    
    const updatedEmails = [...emails]
    updatedEmails[currentIndex].status = status
    setEmails(updatedEmails)
    
    // Move to next pending
    if (currentIndex < emails.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [emails, currentIndex])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (view !== 'triage') return
      
      switch(e.key.toLowerCase()) {
        case 'j': // Next
          if (currentIndex < emails.length - 1) setCurrentIndex(prev => prev + 1)
          break
        case 'k': // Previous
          if (currentIndex > 0) setCurrentIndex(prev => prev - 1)
          break
        case 'a': // Actioned/Done
          handleAction('done')
          break
        case 'd': // Delete/Archive
          handleAction('delete')
          break
        case 's': // Snooze/Follow-up
          handleAction('follow-up')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, currentIndex, emails.length, handleAction])

  const reset = () => {
    if (confirm('Clear all data and start over?')) {
      setEmails([])
      setView('capture')
      setRawText('')
    }
  }

  const stats = {
    total: emails.length,
    done: emails.filter(e => e.status === 'done').length,
    delete: emails.filter(e => e.status === 'delete').length,
    followUp: emails.filter(e => e.status === 'follow-up').length,
    pending: emails.filter(e => e.status === 'pending').length
  }

  const progress = stats.total > 0 ? ((stats.total - stats.pending) / stats.total) * 100 : 0

  return (
    <div className="app-container">
      <header className="header">
        <h1>Email Triage</h1>
        <div className="header-actions">
          {view === 'triage' && (
            <button onClick={() => setView('capture')}>Add More</button>
          )}
          <button onClick={reset} style={{ color: '#ff4444', marginLeft: '1rem' }}>Reset</button>
        </div>
      </header>

      {view === 'capture' ? (
        <section className="capture-zone">
          <h2>Paste Email List</h2>
          <p>Copy your email list from Outlook (Select rows, Ctrl+C) and paste it here.</p>
          <textarea 
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="From	Subject	Received..."
          />
          <button onClick={parseEmails} disabled={!rawText.trim()}>
            Start Triaging {rawText.split('\n').filter(l => l.trim()).length} Items
          </button>
        </section>
      ) : (
        <section className="triage-zone">
          <div className="current-email">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={() => setShowList(!showList)}>
                {showList ? 'Show Zen Mode' : 'Show List View'}
              </button>
            </div>

            {showList ? (
              <div className="email-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #444' }}>
                      <th style={{ padding: '0.5rem' }}>Status</th>
                      <th style={{ padding: '0.5rem' }}>Sender</th>
                      <th style={{ padding: '0.5rem' }}>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emails.map((email, index) => (
                      <tr 
                        key={email.id} 
                        onClick={() => { setCurrentIndex(index); setShowList(false); }}
                        style={{ 
                          cursor: 'pointer',
                          background: index === currentIndex ? '#333' : 'transparent',
                          borderBottom: '1px solid #222'
                        }}
                      >
                        <td style={{ padding: '0.5rem', fontSize: '0.8rem' }}>{email.status.toUpperCase()}</td>
                        <td style={{ padding: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>{email.sender}</td>
                        <td style={{ padding: '0.5rem' }}>{email.subject}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : emails[currentIndex] ? (
              <>
                <div className="email-meta">
                  <p>Item {currentIndex + 1} of {emails.length}</p>
                  <h2>{emails[currentIndex].subject}</h2>
                  <p><strong>From:</strong> {emails[currentIndex].sender}</p>
                  <p><strong>Date:</strong> {emails[currentIndex].date}</p>
                  <p><strong>Status:</strong> <span style={{ color: emails[currentIndex].status === 'pending' ? '#aaa' : '#646cff' }}>{emails[currentIndex].status.toUpperCase()}</span></p>
                </div>
                
                <div className="email-body">
                   <p style={{ color: '#888', fontStyle: 'italic' }}>
                     Note: Body content is not available via cut-and-paste list. Use this to triage actions based on subject/sender.
                   </p>
                </div>

                <div className="actions">
                  <button onClick={() => handleAction('done')}>
                    Actioned <span className="shortcut">A</span>
                  </button>
                  <button onClick={() => handleAction('delete')}>
                    Delete/Archive <span className="shortcut">D</span>
                  </button>
                  <button onClick={() => handleAction('follow-up')}>
                    Follow-up <span className="shortcut">S</span>
                  </button>
                </div>
                <div style={{ marginTop: '2rem', color: '#666', fontSize: '0.9rem' }}>
                  Use <kbd>J</kbd> and <kbd>K</kbd> to navigate between items.
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '4rem' }}>
                <h2>All Done! 🎉</h2>
                <p>You've processed all items in this batch.</p>
                <button onClick={() => setView('capture')}>Import More</button>
              </div>
            )}
          </div>

          <aside className="stats-panel">
            <h3>Progress</h3>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <div className="stats-item">
                <span>Total</span>
                <span>{stats.total}</span>
              </div>
              <div className="stats-item" style={{ color: '#44ff44' }}>
                <span>Actioned</span>
                <span>{stats.done}</span>
              </div>
              <div className="stats-item" style={{ color: '#ff4444' }}>
                <span>Delete</span>
                <span>{stats.delete}</span>
              </div>
              <div className="stats-item" style={{ color: '#ffff44' }}>
                <span>Follow-up</span>
                <span>{stats.followUp}</span>
              </div>
              <div className="stats-item" style={{ color: '#aaa', marginTop: '1rem', borderTop: '1px solid #333', paddingTop: '0.5rem' }}>
                <span>Remaining</span>
                <span>{stats.pending}</span>
              </div>
            </div>

            <button 
              onClick={copyFollowUps} 
              disabled={stats.followUp === 0}
              style={{ width: '100%', marginTop: '2rem', background: '#646cff', color: 'white' }}
            >
              Copy Follow-ups List
            </button>
          </aside>
        </section>
      )}
    </div>
  )
}

export default App
