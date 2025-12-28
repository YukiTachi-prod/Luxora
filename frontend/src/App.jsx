import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import luxoraBG from './assets/luxorabg.png' 

export default function App() {
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedItem, setSelectedItem] = useState(null) // State for the popup

  const fbLink = "https://www.facebook.com/jl.gulmatico.2025"

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: items } = await supabase.from('Items').select('*').order('id', { ascending: false })
    const { data: tagData } = await supabase.from('tags').select('*').order('name', { ascending: true })
    setProducts(items || [])
    setTags(tagData || [])
  }

  const filteredProducts = selectedTag === 'All' 
    ? products 
    : products.filter(p => p.category === selectedTag)

  return (
    <div 
      className={`app-container ${selectedItem ? 'modal-active' : ''}`} 
      style={{ 
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${luxoraBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <header className="header">
        <h1 className="header-title">Luxora</h1>
        <p className="header-subtitle">Handcrafted Elegance</p>
      </header>

      <div className="filter-container">
        <label className="filter-label">Filter by Category:</label>
        <select 
          value={selectedTag} 
          onChange={(e) => setSelectedTag(e.target.value)}
          className="filter-dropdown"
        >
          <option value="All">All Collections</option>
          {tags.map(t => (
            <option key={t.id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="products-wrapper">
        <div className="products-grid">
          {filteredProducts.map(item => (
            <div key={item.id} className="product-card">
              <div className="product-image-wrapper">
                <img src={item.image_url} alt={item.name} className="product-image" />
              </div>
              
              {/* Simplified Slide-down: Name, Price, View Button Only */}
              <div className="product-info">
                <h3 className="product-name">{item.name}</h3>
                <p className="product-price-preview">{item.price}</p>
                <div className="product-footer">
                  <button className="view-details-btn" onClick={() => setSelectedItem(item)}>
                    View Item
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MODAL / POPUP SECTION --- */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>×</button>
            
            <div className="modal-body">
              <div className="modal-left">
                <img src={selectedItem.image_url} alt={selectedItem.name} className="modal-image" />
              </div>
              
              <div className="modal-right">
                <h2 className="modal-title">{selectedItem.name}</h2>
                <p className="modal-category-tag">{selectedItem.category}</p>
                <p className="modal-description">{selectedItem.description}</p>
                
                {selectedItem.sub_tags && Object.entries(selectedItem.sub_tags).length > 0 && (
                  <div className="modal-subtags">
                    {Object.entries(selectedItem.sub_tags).map(([key, val]) => (
                      <div key={key} className="modal-subtag-item">
                        <strong>{key}:</strong> {val}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="modal-footer">
                  <span className="modal-price">{selectedItem.price}</span>
                  <a href={fbLink} target="_blank" rel="noreferrer" className="order-btn">
                    Order via Messenger
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p className="footer-text">© 2024 Luxora Jewelry. Handcrafted with love.</p>
      </footer>
    </div>
  )
}