import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Admin() {
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState([])
  const [session, setSession] = useState(null)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [tags, setTags] = useState([])
  const [newTagName, setNewTagName] = useState('')
  const [editingItem, setEditingItem] = useState(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Use a reliable placeholder for sold items to save storage
  const SOLD_PLACEHOLDER = "https://placehold.co/400x400/1a1a1a/d4a574?text=SOLD"

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

  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        if (img.width !== img.height) {
          return reject(new Error(`Validation Failed: Image must be a perfect square (1:1).`));
        }
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const targetSize = Math.min(img.width, 1000);
        canvas.width = targetSize;
        canvas.height = targetSize;
        ctx.drawImage(img, 0, 0, targetSize, targetSize);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Image compression failed."));
          resolve(blob);
        }, 'image/jpeg', 0.7);
      };
      img.onerror = () => reject(new Error("Could not load image file."));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const form = e.target
    const file = form.image.files[0]
    const isSoldValue = form.isSold ? form.isSold.checked : false
    const subTags = form.subTagKey.value ? { [form.subTagKey.value]: form.subTagValue.value } : {}

    try {
      let finalImageUrl = editingItem?.image_url || ''

      // 1. Handle Image Logic
      if (file && !isSoldValue) {
        const compressedBlob = await processImage(file);
        const fileName = `${Date.now()}-jewelry.jpg`
        const { error: storageError } = await supabase.storage
          .from('jewelry')
          .upload(fileName, compressedBlob, { contentType: 'image/jpeg' })
        if (storageError) throw storageError
        const { data: urlData } = supabase.storage.from('jewelry').getPublicUrl(fileName)
        finalImageUrl = urlData.publicUrl
      }

      // 2. Storage Cleanup: If marked as Sold, delete the existing file
      if (isSoldValue && editingItem?.image_url && !editingItem.image_url.includes('placehold.co')) {
        const oldFileName = editingItem.image_url.split('/').pop()
        await supabase.storage.from('jewelry').remove([oldFileName])
        finalImageUrl = SOLD_PLACEHOLDER
      }

      const itemData = {
        name: form.name.value,
        price: form.price.value,
        description: form.description.value,
        category: form.category.value,
        sub_tags: subTags,
        image_url: finalImageUrl,
        is_sold: isSoldValue 
      }

      if (editingItem) {
        const { error } = await supabase.from('Items').update(itemData).eq('id', editingItem.id)
        if (error) throw error
        alert(isSoldValue ? "Item Sold & Image Purged!" : "Listing updated!")
      } else {
        const { error } = await supabase.from('Items').insert([itemData])
        if (error) throw error
        alert("Item added successfully!")
      }

      setEditingItem(null)
      form.reset()
      fetchItems()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.name}?`)) {
      try {
        if (item.image_url && !item.image_url.includes('placehold.co')) {
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

  const inputStyle = {
    padding: '12px', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '1rem', fontFamily: '"Playfair Display", serif', width: '100%', boxSizing: 'border-box'
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
            
            {editingItem && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#d9534f', fontWeight: 'bold', background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #d9534f' }}>
                <input type="checkbox" name="isSold" defaultChecked={editingItem.is_sold} style={{ transform: 'scale(1.5)' }} />
                MARK AS SOLD (Deletes Photo)
              </label>
            )}

            <input name="name" defaultValue={editingItem?.name || ''} placeholder="Jewelry Name" required style={inputStyle} />
            <input name="price" defaultValue={editingItem?.price || ''} placeholder="Price" required style={inputStyle} />
            <textarea name="description" defaultValue={editingItem?.description || ''} placeholder="Description..." style={{ ...inputStyle, minHeight: '80px' }} />
            
            <select name="category" defaultValue={editingItem?.category || 'Uncategorized'} style={inputStyle}>
              <option value="Uncategorized">Select Category</option>
              {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input name="subTagKey" defaultValue={editingItem?.sub_tags ? Object.keys(editingItem.sub_tags)[0] : ''} placeholder="Label" style={inputStyle} />
              <input name="subTagValue" defaultValue={editingItem?.sub_tags ? Object.values(editingItem.sub_tags)[0] : ''} placeholder="Value" style={inputStyle} />
            </div>

            <input type="file" name="image" accept="image/*" required={!editingItem} style={{ fontFamily: 'sans-serif' }} />
            
            <button type="submit" disabled={loading} style={{ padding: '15px', background: '#d4a574', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? "Syncing..." : editingItem ? "Update Listing" : "Upload to Shop"}
            </button>
            {editingItem && <button type="button" onClick={() => setEditingItem(null)} style={{ background: 'none', color: '#666', border: 'none', cursor: 'pointer' }}>Cancel Edit</button>}
          </form>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
          <h3>Inventory</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #f0f0f0', opacity: p.is_sold ? 0.5 : 1 }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{p.name} {p.is_sold && <span style={{ color: 'red' }}>[SOLD]</span>}</div>
                  <div style={{ fontSize: '0.8rem', color: '#888' }}>{p.category} • ₱{p.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={() => startEditing(p)} style={{ border: 'none', color: '#d4a574', cursor: 'pointer', background: 'none' }}>Edit</button>
                  <button onClick={() => handleDelete(p)} style={{ border: 'none', color: '#ff4d4d', cursor: 'pointer', background: 'none' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}