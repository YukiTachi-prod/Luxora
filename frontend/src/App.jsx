import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import luxoraBG from './assets/luxorabg.png'

export default function App() {
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
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

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedTag === 'All' || p.category === selectedTag;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  })

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
        <p className="header-subtitle">Affordable elegance for every you.</p>
      </header>

      <div className="filter-container">
        <div className="filter-group">
          <label className="filter-label">Category:</label>
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

        <div className="filter-group">
          <label className="filter-label">Search:</label>
          <input
            type="text"
            placeholder="Search jewelry..."
            className="filter-dropdown"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="products-wrapper">
        {filteredProducts.length === 0 ? (
          <p className="empty-state">No items found matching your criteria</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(item => (
              <div key={item.id} className="product-card" style={{position: 'relative'}}>
                {/* SOLD OVERLAY FOR CARD */}
                {item.is_sold && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'rgba(217, 83, 79, 0.9)',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '5px',
                    zIndex: 10,
                    fontWeight: 'bold',
                    fontSize: '0.8rem',
                    letterSpacing: '1px'
                  }}>SOLD</div>
                )}
                
                <div className="product-image-wrapper" style={{ opacity: item.is_sold ? 0.6 : 1 }}>
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
                  style={{ filter: selectedProduct.is_sold ? 'grayscale(0.5)' : 'none' }}
                />
              </div>

              <div className="popup-details-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h2 className="popup-title">{selectedProduct.name}</h2>
                  {selectedProduct.is_sold && <span style={{color: '#d9534f', fontWeight: 'bold'}}>OUT OF STOCK</span>}
                </div>
                <p className="popup-category">{selectedProduct.category}</p>
                
                <div className="popup-price-section">
                  <span className="popup-price">₱{selectedProduct.price}</span>
                </div>

                {selectedProduct.description && (
                  <div className="popup-description-section">
                    <h3 className="popup-section-title" style={{color: '#d4a574', marginBottom: '10px'}}>Description</h3>
                    <p className="popup-description">{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.sub_tags && Object.entries(selectedProduct.sub_tags).length > 0 && (
                  <div className="popup-tags-section">
                    <h3 className="popup-section-title" style={{color: '#d4a574', marginBottom: '10px'}}>Details</h3>
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

                {/* CONDITIONAL ORDER BUTTON */}
                {!selectedProduct.is_sold ? (
                  <a
                    href={fbLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="popup-order-btn"
                  >
                    Order on Facebook
                  </a>
                ) : (
                  <div className="popup-order-btn" style={{ background: '#555', cursor: 'not-allowed', transform: 'none', opacity: 0.7 }}>
                    Item Unavailable
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p className="footer-text">© 2024 Luxora Jewelry. Affordable elegance for every you.</p>
      </footer>
    </div>
  )
}