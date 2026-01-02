import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import luxoraBG from './assets/luxorabg.png'

export default function App() {
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const fbLink = "https://www.facebook.com/share/1aXrTSSkXB/"

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

  const openPopup = (product) => {
    setSelectedProduct(product)
  }

  const closePopup = () => {
    setSelectedProduct(null)
  }

  return (
    <div
      className="app-container"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.03)), url(${luxoraBG})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <header className="header">
        <h1 className="header-title">Luxora</h1>
        <p className="header-subtitle">Wear your confidence</p>
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
                  <div className="product-footer">
                    <p className="product-price">₱{item.price}</p>
                    <button
                      onClick={() => openPopup(item)}
                      className="view-details-btn"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {selectedProduct && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="popup-close" onClick={closePopup}>×</button>
            
            <div className="popup-grid">
              <div className="popup-image-section">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="popup-image"
                />
              </div>

              <div className="popup-details-section">
                <h2 className="popup-title">{selectedProduct.name}</h2>
                <p className="popup-category">{selectedProduct.category}</p>
                
                <div className="popup-price-section">
                  <span className="popup-price">₱{selectedProduct.price}</span>
                </div>

                {selectedProduct.description && (
                  <div className="popup-description-section">
                    <h3 className="popup-section-title">Description</h3>
                    <p className="popup-description">{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.sub_tags && Object.entries(selectedProduct.sub_tags).length > 0 && (
                  <div className="popup-tags-section">
                    <h3 className="popup-section-title">Details</h3>
                    <div className="popup-tags">
                      {Object.entries(selectedProduct.sub_tags).map(([key, val]) => (
                        <div key={key} className="popup-tag-item">
                          <span className="popup-tag-key">{key}</span>
                          <span className="popup-tag-value">Code: {val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <a
                  href={fbLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="popup-order-btn"
                >
                  Order on Facebook
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p className="footer-text">© 2024 Luxora Jewelry. Wear your confidence.</p>
      </footer>
    </div>
  )
}