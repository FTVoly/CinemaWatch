// src/App.js
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabaseClient' // Import de la config
import Auth from './components/Auth'            // Import des composants
import SetUsername from './components/SetUsername'
import Settings from './components/Settings'

export default function App() {
  const [session, setSession] = useState(null)
  const [hasUsername, setHasUsername] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérification initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) checkProfile(session.user.id)
      else setLoading(false)
    })

    // Écouteur de changements (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) checkProfile(session.user.id)
      else {
        setHasUsername(false)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function checkProfile(userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()
      
      if (data && data.username) setHasUsername(true)
      else setHasUsername(false)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Chargement...</div>

  // 1. Pas connecté -> Page de connexion
  if (!session) {
    return <Auth />
  }

  // 2. Connecté mais Pas de Pseudo -> Onboarding
  if (session && !hasUsername) {
    return <SetUsername session={session} onSuccess={() => setHasUsername(true)} />
  }

  // 3. Connecté et Pseudo OK -> Ton Application (Ici j'affiche les Settings pour l'exemple)
  return (
    <div>
        <h1>Bienvenue dans l'app !</h1>
        <Settings session={session} />
    </div>
  )
}