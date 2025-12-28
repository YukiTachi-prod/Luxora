import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Link } from 'react-router-dom'

export default function Admin() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [session, setSession] = useState(null)
  
  // Category/Tag Management
  const [tags, setTags] = useState([])
  const [newTagName, setNewTagName] = useState('')

  // Login States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    fetchItems()
    fetchTags()
  }, [])

  async function fetchItems() {
    const { data } = await supabase.from('Items').select('*').order('id', { ascending: false })
    setProducts(data || [])
  }

  async function fetchTags() {
    const { data } = await supabase.from('tags').select('*').order('name', { ascending: true })
    setTags(data || [])
  }

  const handleAddTag = async () => {
    if (!newTagName.trim()) return
    const { error } = await supabase.from('tags').insert([{ name: newTagName.trim() }])
    if (error) alert("Error: " + error.message)
    else { setNewTagName(''); fetchTags(); }
  }

  const handleDeleteTag = async (id) => {
    if (window.confirm("Remove this category?")) {
      await supabase.from('tags').delete().eq('id', id)
      fetchTags()
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else {
      setEmail(''); setPassword('')
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    const file = form.image.files[0]
    
    // Formatting the sub-tags as JSON
    const subTags = form.subTagKey.value ? { [form.subTagKey.value]: form.subTagValue.value } : {}

    try {
      const fileName = `${Date.now()}-${file.name}`
      
      // FIX: Explicitly catch the storage error like your working code did
      const { error: storageError } = await supabase.storage.from('jewelry').upload(fileName, file)
      if (storageError) throw storageError

      const { data: urlData } = supabase.storage.from('jewelry').getPublicUrl(fileName)

      // Insert into Items table
      const { error: dbError } = await supabase.from('Items').insert([
        { 
          name: form.name.value, 
          price: form.price.value, 
          description: form.description.value,
          category: form.category.value,
          sub_tags: subTags,
          image_url: urlData.publicUrl 
        }
      ])

      if (dbError) throw dbError
      alert("Item added successfully!")
      form.reset()
      fetchItems()
    } catch (err) { 
      alert("Upload failed: " + err.message) 
    } finally { 
      setLoading(false) 
    }
  }

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.name}?`)) {
      try {
        if (item.image_url) {
          const fileName = item.image_url.split('/').pop()
          await supabase.storage.from('jewelry').remove([fileName])
        }
        const { error } = await supabase.from('Items').delete().eq('id', item.id)
        if (error) throw error
        fetchItems() 
      } catch (err) {
        alert("Delete failed: " + err.message)
      }
    }
  }

  if (!session) {
    return (
      <div key="login-view" style={{ padding: '50px 20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px' }} />
          <div style={{ position: 'relative', display: 'flex' }}>
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', flex: 1 }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ marginLeft: '5px', padding: '0 10px' }}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          <button type="submit" disabled={loading} style={{ padding: '10px', background: '#000', color: '#fff' }}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div key="admin-view" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Jewelry Admin Portal</h2>
        <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer' }}>Logout</button>
      </div>

      <section style={{ background: '#f4f4f4', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>1. Manage Categories</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New category..." style={{ padding: '10px', flex: 1 }} />
          <button onClick={handleAddTag} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {tags.map(t => (
            <span key={t.id} style={{ background: '#fff', padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd' }}>
              {t.name} <button onClick={() => handleDeleteTag(t.id)} style={{ border: 'none', color: 'red', background: 'none', cursor: 'pointer' }}>×</button>
            </span>
          ))}
        </div>
      </section>

      <form key="upload-form" onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <h3>2. Post New Item</h3>
        <input type="text" style={{ display: 'none' }} tabIndex="-1" />
        <input name="name" placeholder="Jewelry Name" required style={{ padding: '10px' }} autoComplete="new-password" />
        <input name="price" placeholder="Price" required style={{ padding: '10px' }} />
        <textarea name="description" placeholder="Description..." style={{ padding: '10px', minHeight: '60px' }} />

        <select name="category" style={{ padding: '10px' }}>
          <option value="Uncategorized">-- Select Category --</option>
          {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input name="subTagKey" placeholder="Detail Label (Size)" style={{ padding: '10px', flex: 1 }} />
          <input name="subTagValue" placeholder="Detail Value (7)" style={{ padding: '10px', flex: 1 }} />
        </div>

        <input type="file" name="image" accept="image/*" required />
        <button type="submit" disabled={loading} style={{ padding: '15px', background: '#000', color: '#fff', cursor: 'pointer' }}>
          {loading ? "Saving..." : "Upload to Shop"}
        </button>
      </form>

      <hr style={{ margin: '40px 0' }} />
      <h3>Current Inventory</h3>
      {products.map(p => (
        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid #eee' }}>
          <span><strong>{p.name}</strong> ({p.category})</span>
          <button onClick={() => handleDelete(p)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
        </div>
      ))}
    </div>
  )
}