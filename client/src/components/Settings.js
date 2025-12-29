// src/components/Settings.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Settings({ session }) {
  const [username, setUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  
  const isEmailUser = session.user.app_metadata.provider === 'email'

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    const { data } = await supabase.from('profiles').select('username').eq('id', session.user.id).single()
    if (data) setUsername(data.username)
  }

  async function updateUsername() {
    const { error } = await supabase.from('profiles').update({ username }).eq('id', session.user.id)
    if (error) alert("Erreur ou pseudo déjà pris")
    else alert("Pseudo mis à jour !")
  }

  async function updatePassword() {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) alert("Erreur mot de passe")
    else alert("Mot de passe modifié !")
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>Mon Profil</h3>
      <label>Pseudo: </label>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <button onClick={updateUsername}>Sauvegarder</button>

      <hr />

      {isEmailUser ? (
        <div>
          <label>Nouveau mot de passe: </label>
          <input type="password" onChange={(e) => setNewPassword(e.target.value)} />
          <button onClick={updatePassword}>Changer</button>
        </div>
      ) : (
        <p>Connecté via {session.user.app_metadata.provider}. Gérez le mot de passe là-bas.</p>
      )}
      
      <button onClick={() => supabase.auth.signOut()} style={{marginTop: '20px', backgroundColor: 'red', color: 'white'}}>
        Se déconnecter
      </button>
    </div>
  )
}