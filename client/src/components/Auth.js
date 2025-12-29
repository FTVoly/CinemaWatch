// src/components/Auth.js
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient' // Note le chemin '../' pour remonter d'un dossier

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    // Pour créer un compte avec email
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert("Vérifie ta boite mail !")
  }

  const handleSocial = async (provider) => {
    await supabase.auth.signInWithOAuth({ provider: provider })
  }

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Connexion / Inscription</h2>
      <button onClick={() => handleSocial('google')}>Google</button>
      <button onClick={() => handleSocial('apple')}>Apple</button>
      
      <p>— OU —</p>

      <form>
        <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
        />
        <input 
            type="password" 
            placeholder="Mot de passe" 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ display: 'block', margin: '10px 0', width: '100%' }}
        />
        <button onClick={handleLogin}>Se connecter</button>
        <button onClick={handleSignUp} style={{ marginLeft: '10px' }}>Créer compte</button>
      </form>
    </div>
  )
}