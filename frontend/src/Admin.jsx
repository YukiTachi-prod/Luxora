import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Admin() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [session, setSession] = useState(null)
  
  // Search & Filtering
  const [searchTerm, setSearchTerm] = useState('')
  const [tags, setTags] = useState([])
  const [newTagName, setNewTagName] = useState('')

  // Edit State
  const [editingItem, setEditingItem] = useState(null)

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

  // Real-time Search Logic
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const startEditing = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    const file = form.image.files[0]
    const subTags = form.subTagKey.value ? { [form.subTagKey.value]: form.subTagValue.value } : {}

    try {
      let finalImageUrl = editingItem?.image_url || ''

      if (file) {
        const fileName = `${Date.now()}-${file.name}`
        const { error: storageError } = await supabase.storage.from('jewelry').upload(fileName, file)
        if (storageError) throw storageError
        const { data: urlData } = supabase.storage.from('jewelry').getPublicUrl(fileName)
        finalImageUrl = urlData.publicUrl
      }

      const itemData = {
        name: form.name.value,
        price: form.price.value,
        description: form.description.value,
        category: form.category.value,
        sub_tags: subTags,
        image_url: finalImageUrl
      }

      if (editingItem) {
        const { error } = await supabase.from('Items').update(itemData).eq('id', editingItem.id)
        if (error) throw error
        alert("Listing updated!")
      } else {
        const { error } = await supabase.from('Items').insert([itemData])
        if (error) throw error
        alert("Item added successfully!")
      }

      setEditingItem(null)
      form.reset()
      fetchItems()
    } catch (err) {
      alert("Operation failed: " + err.message)
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
        await supabase.from('Items').delete().eq('id', item.id)
        fetchItems() 
      } catch (err) {
        alert("Delete failed: " + err.message)
      }
    }
  }

  // --- STYLE CONSTANTS FOR CONSISTENCY ---
  const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    fontFamily: '"Playfair Display", serif', // Matches brand font
    width: '100%',
    boxSizing: 'border-box'
  }

  if (!session) {
    return (
      <div style={{ padding: '50px 20px', maxWidth: '400px', margin: '0 auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <div style={{ position: 'relative', display: 'flex' }}>
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={inputStyle} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ marginLeft: '5px', cursor: 'pointer' }}>{showPassword ? "👁" : "🕶"}</button>
          </div>
          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#d4a574', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '8px' }}>Login</button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: '"Playfair Display", serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2>Luxora Admin Portal</h2>
        <button onClick={handleLogout} style={{ background: '#333', color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '5px' }}>Logout</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* LEFT COLUMN: Categories & Forms */}
        <div>
          <section style={{ background: '#f9f9f9', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' }}>
            <h3>Categories</h3>
            <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
              <input value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="New tag..." style={inputStyle} />
              <button onClick={handleAddTag} style={{ background: '#28a745', color: '#fff', border: 'none', padding: '0 15px', borderRadius: '8px' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {tags.map(t => (
                <span key={t.id} style={{ background: '#fff', padding: '5px 10px', borderRadius: '15px', border: '1px solid #ddd', fontSize: '0.8rem' }}>
                  {t.name} <button onClick={() => handleDeleteTag(t.id)} style={{ border: 'none', color: 'red', background: 'none' }}>×</button>
                </span>
              ))}
            </div>
          </section>

          <form key={editingItem ? editingItem.id : 'new'} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: editingItem ? '#fffef0' : '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #d4a574' }}>
            <h3>{editingItem ? 'Edit Listing' : 'Add New Item'}</h3>
            <input name="name" defaultValue={editingItem?.name || ''} placeholder="Jewelry Name" required style={inputStyle} />
            <input name="price" defaultValue={editingItem?.price || ''} placeholder="Price (e.g. P1,200)" required style={inputStyle} />
            <textarea name="description" defaultValue={editingItem?.description || ''} placeholder="Description..." style={{ ...inputStyle, minHeight: '80px' }} />
            
            <select name="category" defaultValue={editingItem?.category || 'Uncategorized'} style={inputStyle}>
              <option value="Uncategorized">Select Category</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input name="subTagKey" defaultValue={editingItem?.sub_tags ? Object.keys(editingItem.sub_tags)[0] : ''} placeholder="Label (Size)" style={inputStyle} />
              <input name="subTagValue" defaultValue={editingItem?.sub_tags ? Object.values(editingItem.sub_tags)[0] : ''} placeholder="Value (7)" style={inputStyle} />
            </div>

            <input type="file" name="image" required={!editingItem} style={{ fontFamily: 'sans-serif' }} />
            
            <button type="submit" disabled={loading} style={{ padding: '15px', background: '#d4a574', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? "Saving..." : editingItem ? "Update Listing" : "Upload to Shop"}
            </button>
            {editingItem && <button type="button" onClick={() => setEditingItem(null)} style={{ background: 'none', color: '#666', border: 'none', cursor: 'pointer' }}>Cancel Edit</button>}
          </form>
        </div>

        {/* RIGHT COLUMN: Search & Inventory */}
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Inventory</h3>
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ ...inputStyle, background: '#f0f0f0', border: 'none' }} 
            />
          </div>

          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{p.category} • {p.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => startEditing(p)} style={{ border: 'none', color: '#d4a574', cursor: 'pointer', background: 'none' }}>Edit</button>
                  <button onClick={() => handleDelete(p)} style={{ border: 'none', color: '#ff4d4d', cursor: 'pointer', background: 'none' }}>Delete</button>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && <p style={{ color: '#999', textAlign: 'center' }}>No items found.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}