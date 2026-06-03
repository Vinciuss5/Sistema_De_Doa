import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase clients
const getSupabaseAdmin = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

const getSupabaseClient = () => createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to verify user authentication
async function verifyAuth(authHeader: string | undefined) {
  if (!authHeader) {
    return { authorized: false, userId: null };
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return { authorized: false, userId: null };
  }

  const supabase = getSupabaseAdmin();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { authorized: false, userId: null };
  }

  return { authorized: true, userId: user.id };
}

// Health check endpoint
app.get("/make-server-9a2c3dfe/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Signup route
app.post("/make-server-9a2c3dfe/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: 'Email, senha e nome são obrigatórios' }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Create user with auto-confirmed email
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store additional user info in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true,
      message: 'Usuário cadastrado com sucesso',
      userId: data.user.id 
    });
  } catch (error) {
    console.error('Error in signup route:', error);
    return c.json({ error: 'Erro ao cadastrar usuário' }, 500);
  }
});

// ==================== DONOR ROUTES ====================

// Get all donors
app.get("/make-server-9a2c3dfe/donors", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const donors = await kv.getByPrefix('donor:');
    return c.json({ donors });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return c.json({ error: 'Erro ao buscar doadores' }, 500);
  }
});

// Get donor by ID
app.get("/make-server-9a2c3dfe/donors/:id", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const id = c.req.param('id');
    const donor = await kv.get(`donor:${id}`);
    
    if (!donor) {
      return c.json({ error: 'Doador não encontrado' }, 404);
    }

    return c.json({ donor });
  } catch (error) {
    console.error('Error fetching donor:', error);
    return c.json({ error: 'Erro ao buscar doador' }, 500);
  }
});

// Create donor
app.post("/make-server-9a2c3dfe/donors", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const body = await c.req.json();
    const { code, name, email, phone, cpf, address } = body;

    if (!code || !name) {
      return c.json({ error: 'Código e nome são obrigatórios' }, 400);
    }

    // Check if code already exists
    const existing = await kv.get(`donor:${code}`);
    if (existing) {
      return c.json({ error: 'Código de doador já existe' }, 400);
    }

    const donor = {
      code,
      name,
      email,
      phone,
      cpf,
      address,
      createdAt: new Date().toISOString(),
      createdBy: auth.userId
    };

    await kv.set(`donor:${code}`, donor);

    return c.json({ success: true, donor });
  } catch (error) {
    console.error('Error creating donor:', error);
    return c.json({ error: 'Erro ao criar doador' }, 500);
  }
});

// Update donor
app.put("/make-server-9a2c3dfe/donors/:id", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await kv.get(`donor:${id}`);
    if (!existing) {
      return c.json({ error: 'Doador não encontrado' }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      code: id, // Don't allow code changes
      updatedAt: new Date().toISOString()
    };

    await kv.set(`donor:${id}`, updated);

    return c.json({ success: true, donor: updated });
  } catch (error) {
    console.error('Error updating donor:', error);
    return c.json({ error: 'Erro ao atualizar doador' }, 500);
  }
});

// ==================== BENEFICIARY ROUTES ====================

// Get all beneficiaries
app.get("/make-server-9a2c3dfe/beneficiaries", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const beneficiaries = await kv.getByPrefix('beneficiary:');
    return c.json({ beneficiaries });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return c.json({ error: 'Erro ao buscar beneficiários' }, 500);
  }
});

// Get beneficiary by ID
app.get("/make-server-9a2c3dfe/beneficiaries/:id", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const id = c.req.param('id');
    const beneficiary = await kv.get(`beneficiary:${id}`);
    
    if (!beneficiary) {
      return c.json({ error: 'Beneficiário não encontrado' }, 404);
    }

    return c.json({ beneficiary });
  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    return c.json({ error: 'Erro ao buscar beneficiário' }, 500);
  }
});

// Create beneficiary
app.post("/make-server-9a2c3dfe/beneficiaries", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const body = await c.req.json();
    const { code, name, email, phone, cpf, address } = body;

    if (!code || !name) {
      return c.json({ error: 'Código e nome são obrigatórios' }, 400);
    }

    // Check if code already exists
    const existing = await kv.get(`beneficiary:${code}`);
    if (existing) {
      return c.json({ error: 'Código de beneficiário já existe' }, 400);
    }

    const beneficiary = {
      code,
      name,
      email,
      phone,
      cpf,
      address,
      createdAt: new Date().toISOString(),
      createdBy: auth.userId
    };

    await kv.set(`beneficiary:${code}`, beneficiary);

    return c.json({ success: true, beneficiary });
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    return c.json({ error: 'Erro ao criar beneficiário' }, 500);
  }
});

// Update beneficiary
app.put("/make-server-9a2c3dfe/beneficiaries/:id", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await kv.get(`beneficiary:${id}`);
    if (!existing) {
      return c.json({ error: 'Beneficiário não encontrado' }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      code: id, // Don't allow code changes
      updatedAt: new Date().toISOString()
    };

    await kv.set(`beneficiary:${id}`, updated);

    return c.json({ success: true, beneficiary: updated });
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    return c.json({ error: 'Erro ao atualizar beneficiário' }, 500);
  }
});

// ==================== PRODUCT/CLOTHING ROUTES ====================

// Get all products
app.get("/make-server-9a2c3dfe/products", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const products = await kv.getByPrefix('product:');
    return c.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Erro ao buscar produtos' }, 500);
  }
});

// Get product by ID
app.get("/make-server-9a2c3dfe/products/:id", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const id = c.req.param('id');
    const product = await kv.get(`product:${id}`);
    
    if (!product) {
      return c.json({ error: 'Produto não encontrado' }, 404);
    }

    return c.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ error: 'Erro ao buscar produto' }, 500);
  }
});

// Create product
app.post("/make-server-9a2c3dfe/products", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const body = await c.req.json();
    const { donorCode, type, size, color, quality, quantity, observations } = body;

    if (!donorCode || !type || !size || !color || !quality || !quantity) {
      return c.json({ error: 'Todos os campos obrigatórios devem ser preenchidos' }, 400);
    }

    // Verify donor exists
    const donor = await kv.get(`donor:${donorCode}`);
    if (!donor) {
      return c.json({ error: 'Doador não encontrado' }, 404);
    }

    // Generate unique product ID
    const productId = `${donorCode}-${Date.now()}`;

    const product = {
      id: productId,
      donorCode,
      type,
      size,
      color,
      quality,
      quantity: parseInt(quantity),
      observations,
      status: 'available', // available, distributed
      createdAt: new Date().toISOString(),
      createdBy: auth.userId
    };

    await kv.set(`product:${productId}`, product);

    return c.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json({ error: 'Erro ao criar produto' }, 500);
  }
});

// Update product (for distribution)
app.put("/make-server-9a2c3dfe/products/:id", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json();

    const existing = await kv.get(`product:${id}`);
    if (!existing) {
      return c.json({ error: 'Produto não encontrado' }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id, // Don't allow ID changes
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${id}`, updated);

    return c.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Erro ao atualizar produto' }, 500);
  }
});

// ==================== DISTRIBUTION ROUTES ====================

// Create distribution record
app.post("/make-server-9a2c3dfe/distributions", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const body = await c.req.json();
    const { productId, beneficiaryCode, quantity } = body;

    if (!productId || !beneficiaryCode || !quantity) {
      return c.json({ error: 'Todos os campos são obrigatórios' }, 400);
    }

    // Verify product exists
    const product = await kv.get(`product:${productId}`);
    if (!product) {
      return c.json({ error: 'Produto não encontrado' }, 404);
    }

    // Verify beneficiary exists
    const beneficiary = await kv.get(`beneficiary:${beneficiaryCode}`);
    if (!beneficiary) {
      return c.json({ error: 'Beneficiário não encontrado' }, 404);
    }

    // Check if enough quantity is available
    if (product.quantity < quantity) {
      return c.json({ error: 'Quantidade insuficiente em estoque' }, 400);
    }

    // Create distribution record
    const distributionId = `dist-${Date.now()}`;
    const distribution = {
      id: distributionId,
      productId,
      beneficiaryCode,
      quantity: parseInt(quantity),
      createdAt: new Date().toISOString(),
      createdBy: auth.userId
    };

    await kv.set(`distribution:${distributionId}`, distribution);

    // Update product quantity
    const newQuantity = product.quantity - quantity;
    const updatedProduct = {
      ...product,
      quantity: newQuantity,
      status: newQuantity === 0 ? 'distributed' : 'available',
      updatedAt: new Date().toISOString()
    };

    await kv.set(`product:${productId}`, updatedProduct);

    return c.json({ success: true, distribution, updatedProduct });
  } catch (error) {
    console.error('Error creating distribution:', error);
    return c.json({ error: 'Erro ao registrar distribuição' }, 500);
  }
});

// Get all distributions
app.get("/make-server-9a2c3dfe/distributions", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const distributions = await kv.getByPrefix('distribution:');
    return c.json({ distributions });
  } catch (error) {
    console.error('Error fetching distributions:', error);
    return c.json({ error: 'Erro ao buscar distribuições' }, 500);
  }
});

// ==================== STATS ROUTES ====================

// Get dashboard statistics
app.get("/make-server-9a2c3dfe/stats", async (c) => {
  try {
    const auth = await verifyAuth(c.req.header('Authorization'));
    if (!auth.authorized) {
      return c.json({ error: 'Não autorizado' }, 401);
    }

    const [donors, beneficiaries, products, distributions] = await Promise.all([
      kv.getByPrefix('donor:'),
      kv.getByPrefix('beneficiary:'),
      kv.getByPrefix('product:'),
      kv.getByPrefix('distribution:')
    ]);

    const stats = {
      totalDonors: donors.length,
      totalBeneficiaries: beneficiaries.length,
      totalProducts: products.length,
      totalDistributions: distributions.length,
      availableItems: products.filter((p: any) => p.status === 'available').reduce((sum: number, p: any) => sum + p.quantity, 0),
      distributedItems: distributions.reduce((sum: number, d: any) => sum + d.quantity, 0)
    };

    return c.json({ stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Erro ao buscar estatísticas' }, 500);
  }
});

Deno.serve(app.fetch);
