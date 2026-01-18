import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import luxoraBG from './assets/luxorabg.png'

export default function App() {
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')
  const [viewMode, setViewMode] = useState('categories') // 'categories' or 'products'
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

  const handleCategoryClick = (tagName) => {
    setSelectedTag(tagName)
    setViewMode('products')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedTag === 'All' || p.category === selectedTag;
    
    const query = searchQuery.toLowerCase();
    const matchesName = p.name.toLowerCase().includes(query);
    const matchesDescription = p.description?.toLowerCase().includes(query) || false;
    
    // Search in sub_tags (size values)
    let matchesSize = false;
    if (p.sub_tags && typeof p.sub_tags === 'object') {
      matchesSize = Object.values(p.sub_tags).some(val => 
        String(val).toLowerCase().includes(query)
      );
    }
    
    const matchesSearch = matchesName || matchesDescription || matchesSize;
    
    return matchesCategory && matchesSearch;
  })

  const openPopup = (product) => setSelectedProduct(product)
  const closePopup = () => setSelectedProduct(null)

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
      <h1 className="header-title" style={{ cursor: 'pointer' }} onClick={() => setViewMode('categories')}>
        <span className="title-main">Luxora</span>
        <span className="title-sub"> Collection</span>
      </h1>
      <p className="header-subtitle">Affordable elegance for every you.</p>
    </header>

      <div className="filter-container" style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
        {viewMode === 'products' && (
          <button 
            className="view-details-btn" 
            style={{ padding: '10px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            onClick={() => {
              setViewMode('categories');
              setSearchQuery('');
            }}
          >
            ← Categories
          </button>
        )}
        
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search jewelry..."
            className="filter-dropdown"
            value={searchQuery}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                if(viewMode === 'categories' && e.target.value !== '') setViewMode('products');
            }}
          />
        </div>
      </div>

      <div className="products-wrapper">
        {viewMode === 'categories' ? (
          <div className="products-grid">
            {/* Default "All Items" Category */}
            <div className="product-card" onClick={() => handleCategoryClick('All')} style={{ cursor: 'pointer' }}>
              <div className="product-image-wrapper">
                <img src="https://placehold.co/600x600/d4a574/ffffff?text=All+Collections" alt="All" className="product-image" />
              </div>
              <div className="product-info" style={{ textAlign: 'center' }}>
                <h3 className="product-name">Browse All Items</h3>
              </div>
            </div>

            {/* Rendered Categories from DB */}
            {tags.map(tag => (
              <div key={tag.id} className="product-card" onClick={() => handleCategoryClick(tag.name)} style={{ cursor: 'pointer' }}>
                <div className="product-image-wrapper">
                  <img 
                    src={tag.image_url || "https://placehold.co/600x600/f3f3f3/d4a574?text=" + tag.name} 
                    alt={tag.name} 
                    className="product-image" 
                  />
                </div>
                <div className="product-info" style={{ textAlign: 'center' }}>
                  <h3 className="product-name">{tag.name}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Items View */
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '30px' 
            }}>
              <h2 style={{ 
                color: '#d4a574', 
                background: '#333',
                padding: '12px 30px',
                borderRadius: '12px',
                margin: 0
              }}>
                {selectedTag === 'All' ? 'Full Collection' : selectedTag}
              </h2>
            </div>
            {filteredProducts.length === 0 ? (
              <p className="empty-state">No items found matching your search</p>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(item => (
                  <div key={item.id} className="product-card" style={{ position: 'relative' }}>
                    {item.is_sold && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(217, 83, 79, 0.9)', color: 'white', padding: '5px 15px', borderRadius: '5px', zIndex: 10, fontWeight: 'bold', fontSize: '0.8rem' }}>SOLD</div>
                    )}
                    <div className="product-image-wrapper" style={{ opacity: item.is_sold ? 0.6 : 1 }}>
                      <img src={item.image_url} alt={item.name} className="product-image" />
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{item.name}</h3>
                      <div className="product-footer">
                        <p className="product-price">₱{item.price}</p>
                        <button onClick={() => openPopup(item)} className="view-details-btn">View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selectedProduct && (
        <div 
          className="popup-overlay" 
          onClick={closePopup}
          style={{
            backgroundImage: `url(${luxoraBG})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div 
            style={{
              position: 'fixed',
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              backgroundImage: `url(${luxoraBG})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(5px)',
              zIndex: 0,
              overflow: 'hidden'
            }}
          ></div>
          <div className="popup-content" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', zIndex: 1 }}>
            <button className="popup-close" onClick={closePopup}>×</button>
            <div className="popup-grid">
              <div className="popup-image-section">
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="popup-image" style={{ filter: selectedProduct.is_sold ? 'grayscale(0.5)' : 'none' }} />
              </div>
              <div className="popup-details-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h2 className="popup-title">{selectedProduct.name}</h2>
                  {selectedProduct.is_sold && <span style={{color: '#d9534f', fontWeight: 'bold'}}>OUT OF STOCK</span>}
                </div>
                <p className="popup-category">{selectedProduct.category}</p>
                <div className="popup-price-section"><span className="popup-price">₱{selectedProduct.price}</span></div>
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
                        <div key={key} className="popup-tag-item"><span className="popup-tag-key">{key}</span><span className="popup-tag-value">Size: {val}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                {!selectedProduct.is_sold ? (
                  <a href={fbLink} target="_blank" rel="noopener noreferrer" className="popup-order-btn">Order on Facebook</a>
                ) : (
                  <div className="popup-order-btn" style={{ background: '#555', cursor: 'not-allowed', transform: 'none', opacity: 0.7 }}>Item Unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">© 2026 Luxora Jewelry. Affordable elegance for every you.</p>
          
          <div className="contact-stack">
            <p>Contact us at:</p>
            <span className="contact-item">
              Email:
              <a href="mailto:kewl_gem@yahoo.com">kewl_gem@yahoo.com</a>
            </span>
            
            <span className="contact-item">
              Phone:
              <a href="tel:+639568633632">0956 863 3632</a>
            </span>
            
            <span className="contact-item">
              Facebook:
              <a 
                href="https://www.facebook.com/superspecialsweetsurprise" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Luxora Collection
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}