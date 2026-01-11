# Luxora Collection

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

A dynamic digital catalog and storefront for **Luxora Jewelry**. This application serves as a showcase for jewelry collections, allowing customers to browse by category, search for specific items, and view detailed product information before being redirected to Facebook to finalize orders.

> **Tagline:** Affordable elegance for every you.

## Features

* **Dynamic Product Catalog:** Fetches real-time product data from Supabase.
* **Category Filtering:** Browse items by specific collections (tags) or view all items.
* **Live Search:** Instantly filter products by name; typing automatically switches the view to results.
* **Product Details Modal:** Pop-up view with high-res images, descriptions, and specific product codes.
* **Inventory Status:** Automatically flags items as "SOLD" and disables the order button.
* **Direct-to-Social Ordering:** "Order on Facebook" button redirects customers to the business page.

## Navigation & UI Logic

The application functions as a Single Page Application (SPA) using React State to handle views without page reloads.

### 1. Header & Branding
* **Main Title ("Luxora Collection"):**
    * Acts as a global **"Home"** button.
    * **Logic:** Clicking the title triggers `setViewMode('categories')`. This resets the interface to the main category grid, regardless of where the user is in the app.
* **Subtitle:**
    * Static branding text: *"Affordable elegance for every you."*

### 2. View Switching (`viewMode`)
The interface toggles between two primary states:
* **Categories View:** Displays large, clickable cards for different jewelry types (e.g., Necklaces, Rings) and an "All Items" option.
* **Products View:** Displays the grid of actual jewelry items based on the selected category or search term.

### 3. Navigation Controls
* **Back Button (← Categories):**
    * Appears only when viewing specific products.
    * **Logic:** Clicking this resets the view to the Category grid and clears the current Search Query.
* **Search Bar:**
    * **Logic:** As soon as the user begins typing, the app automatically detects input and forces `setViewMode('products')` to show real-time search results across the inventory.

## Database Schema (Supabase)

To make the app work, create the following tables in your Supabase project.

### 1. Table: `Items`
Stores the actual jewelry products.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | Primary Key |
| `name` | `text` | Name of the jewelry piece |
| `category` | `text` | Must match a `name` in the `tags` table |
| `price` | `numeric` | Price in PHP |
| `image_url` | `text` | Direct link to image asset |
| `description`| `text` | Product description |
| `is_sold` | `boolean` | `true` marks item as Sold Out |
| `sub_tags` | `jsonb` | JSON object for specific codes (e.g., `{"Gold": "A1"}`) |

### 2. Table: `tags`
Stores the categories shown on the home view.

| Column Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `int8` | Primary Key |
| `name` | `text` | Category name (e.g., "Necklaces") |
| `image_url` | `text` | Thumbnail for the category card |

## Contact Information

```text
Email: gulmaticojaceylorenz@gmail.com
Contact: 09942157325

