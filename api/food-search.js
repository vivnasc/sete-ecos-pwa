// api/food-search.js
// Proxy para Open Food Facts API (evitar CORS + cache)

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { q, barcode, limit = '10' } = req.query;

  try {
    // Pesquisa por barcode
    if (barcode) {
      const cleanBarcode = barcode.replace(/[^0-9]/g, '');
      if (!cleanBarcode || cleanBarcode.length < 8) {
        return res.status(400).json({ error: 'Barcode inválido' });
      }

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json?fields=code,product_name,product_name_pt,generic_name,brands,nutriments,serving_size,categories_tags,labels_tags,image_front_small_url`,
        {
          headers: {
            'User-Agent': 'SeteEcos-Vitalis/2.0 (https://app.seteecos.com)'
          }
        }
      );

      if (!response.ok) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const data = await response.json();

      if (data.status === 0 || !data.product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      // Cache 1h
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
      return res.status(200).json({ product: data.product });
    }

    // Pesquisa por texto
    if (q) {
      const query = q.trim().substring(0, 100);
      if (query.length < 2) {
        return res.status(400).json({ error: 'Pesquisa muito curta' });
      }

      const numLimit = Math.min(parseInt(limit) || 10, 30);

      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${numLimit}&fields=code,product_name,product_name_pt,generic_name,brands,nutriments,serving_size,categories_tags,labels_tags,image_front_small_url&lc=pt`,
        {
          headers: {
            'User-Agent': 'SeteEcos-Vitalis/2.0 (https://app.seteecos.com)'
          }
        }
      );

      if (!response.ok) {
        return res.status(502).json({ error: 'Erro na API externa' });
      }

      const data = await response.json();

      // Cache 30 min
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');
      return res.status(200).json({
        count: data.count || 0,
        products: data.products || []
      });
    }

    return res.status(400).json({ error: 'Parâmetro q ou barcode obrigatório' });

  } catch (error) {
    console.error('food-search error:', error.message);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
