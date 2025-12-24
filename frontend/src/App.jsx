import { useEffect, useState } from 'react'

function App() {
  const [items, setItems] = useState([]);
  const fbLink = "https://www.facebook.com/jl.gulmatico.2025";

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Mom's Jewelry Shop</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        {items.map(item => (
          <div key={item.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '8px' }}>
            <img src={item.image} alt={item.name} />
            <h2>{item.name}</h2>
            <p>{item.price}</p>
            <a href={fbLink} target="_blank" rel="noreferrer">
              <button style={{ cursor: 'pointer' }}>Message to Buy</button>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App