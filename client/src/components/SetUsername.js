// src/components/SetUsername.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function SetUsername({ session, onSuccess }) {
  const [username, setUsername] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const updateProfile = async (e) => {
    e.preventDefault()
    
    const updates = {
      id: session.user.id,
      username: username,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
      if (error.code === '23505') setErrorMsg("Ce pseudo est déjà pris !")
      else setErrorMsg(error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Bienvenue !</h2>
      <p>Choisissez un pseudo unique pour commencer.</p>
      
      <form onSubmit={updateProfile}>
        <input 
          type="text" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          placeholder="MonSuperPseudo"
          minLength={3}
          required
        />
        <button type="submit">Valider</button>
      </form>
      {errorMsg && <p style={{color: 'red'}}>{errorMsg}</p>}
    </div>
  )
}