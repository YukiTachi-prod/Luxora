import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
// Import the background image from assets
import luxoraBG from './assets/luxorabg.png' 

export default function App() {
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')

  // The Facebook link for orders
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
      className="app-container" 
      style={{ 
        // This adds a dark tint (60% black) over your image
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
        {filteredProducts.length === 0 ? (
          <p className="empty-state">No items found in this category</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(item => (
              <div key={item.id} className="product-card">
                <div className="product-image-wrapper">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="product-image"
                  />
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-category">{item.category}</p>
                  <p className="product-description">{item.description}</p>
                  
                  {item.sub_tags && Object.entries(item.sub_tags).length > 0 && (
                    <div className="product-tags">
                      {Object.entries(item.sub_tags).map(([key, val]) => (
                        <span key={key} className="product-tag">
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="product-footer">
                    <p className="product-price">{item.price}</p>
                    {/* Updated button to link to Facebook */}
                    <a 
                      href={fbLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="view-details-btn"
                    >
                      Order
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="footer">
        <p className="footer-text">© 2024 Luxora Jewelry. Handcrafted with love.</p>
      </footer>
    </div>
  )
}