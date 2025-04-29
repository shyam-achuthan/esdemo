# esdemo
# Elasticsearch Product Search Example URLs

Here are example URLs for all types of searches in our enhanced Elasticsearch demo with product catalog data.

## Basic Search Capabilities

### 1. Basic Search
```
http://esdemo.tunerlabs.in/api/search?q=organic
```
Standard search across all fields.

### 2. Fuzzy Search (Spelling Mistakes)
```
http://esdemo.tunerlabs.in/api/fuzzy-search?q=organik
http://esdemo.tunerlabs.in/api/fuzzy-search?q=tomatoe
http://esdemo.tunerlabs.in/api/fuzzy-search?q=ashwaganda
```
Handles misspellings and typos.

### 3. Language-Specific Search
```
http://esdemo.tunerlabs.in/api/language-search?q=organic&lang=en
http://esdemo.tunerlabs.in/api/language-search?q=ಆರ್ಗಾನಿಕ್&lang=kn
```
Searches within a specific language only.

### 4. Category Search
```
http://esdemo.tunerlabs.in/api/category-search?q=chemical-free&category=vegetables
http://esdemo.tunerlabs.in/api/category-search?q=organic&category=fruits
http://esdemo.tunerlabs.in/api/category-search?q=healthy&category=legumes
```
Filters by product category.

### 5. Tag/Keyword Search
```
http://esdemo.tunerlabs.in/api/tag-search?q=organic&tag=fresh
http://esdemo.tunerlabs.in/api/tag-search?q=healthy&tag=chemical-free
```
Searches products with specific tags/keywords.

## Advanced Search Capabilities

### 6. Prefix/Autocomplete Search
```
http://esdemo.tunerlabs.in/api/prefix-search?prefix=org
http://esdemo.tunerlabs.in/api/prefix-search?prefix=tom
http://esdemo.tunerlabs.in/api/prefix-search?prefix=ಆರ್
```
For implementing autocomplete functionality.

### 7. Similar Product Search
```
http://esdemo.tunerlabs.in/api/similar-docs?id=11
http://esdemo.tunerlabs.in/api/similar-docs?id=25
```
Finds products similar to a given product.

### 8. Cross-Language Search
```
http://esdemo.tunerlabs.in/api/cross-language-search?q=organic&sourceLanguage=en&targetLanguage=kn
http://esdemo.tunerlabs.in/api/cross-language-search?q=tomato&sourceLanguage=en&targetLanguage=kn
```
Finds conceptually similar products across different languages.

### 9. Brand Search
```
http://esdemo.tunerlabs.in/api/brand-search?q=organic&brand=Pro%20Nature
http://esdemo.tunerlabs.in/api/brand-search?q=healthy&brand=The%20Organic%20World
```
Searches within a specific brand's products.

### 10. Multilingual Product Search
```
http://esdemo.tunerlabs.in/api/multilingual-product-search?q=organic
http://esdemo.tunerlabs.in/api/multilingual-product-search?q=tomato
http://esdemo.tunerlabs.in/api/multilingual-product-search?q=ಆರ್ಗಾನಿಕ್
http://esdemo.tunerlabs.in/api/multilingual-product-search?q=ಟೊಮೆಟೊ
```
Searches across all languages simultaneously.

### 11. Spelling Correction Search
```
http://esdemo.tunerlabs.in/api/spelling-correction?q=organik
http://esdemo.tunerlabs.in/api/spelling-correction?q=tomatoe
http://esdemo.tunerlabs.in/api/spelling-correction?q=aschwagandha
```
Provides spelling correction suggestions while returning results.

## Testing Specific Product Types

### Organic Vegetables
```
http://esdemo.tunerlabs.in/api/category-search?q=organic&category=vegetables
```

### Spices and Powders
```
http://esdemo.tunerlabs.in/api/category-search?q=powder&category=spices
```

### Beauty and Skin Care
```
http://esdemo.tunerlabs.in/api/category-search?q=natural&category=beauty
```

### Ayurvedic Products
```
http://esdemo.tunerlabs.in/api/category-search?q=health&category=ayurveda
```

## Health Check
```
http://esdemo.tunerlabs.in/health
```
Verifies that the API and Elasticsearch are operational.
