/**
 * catalogSlice.ts — Redux state management for the product catalog.
 * 
 * Reason: Centralizes products, categories, and fabrics state fetching in
 * the Redux store, converting Mongoose shapes into UI-compatible structures.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchApi } from '../../lib/apiClient';

export interface Category {
  name: string;
  slug: string;
  desc?: string;
}

export interface FabricProperty {
  colorName: string;
  colorCode?: string;
  imageUrl: string;
  unit: 'yard' | 'trouser-length' | 'ft' | 'roll' | 'pack';
  yardsPerUnit: number;
  priceModifier: number;
  inStock: boolean;
  stockLevel?: number;
  isActive: boolean;
}

export interface Fabric {
  id: string;
  slug: string;
  name: string;
  description?: string;
  properties: FabricProperty[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  category: string;
  fabric_type: string | null;
  image_url: string | null;
  is_customizable: boolean;
  rating: number;
  review_count: number;
  tag: string | null;
  gender: string;
  occasion: string;
  shipping_badge: string;
  styleOptions?: Array<{ name: string; priceModifier: number; description?: string; imgUrl: string }>;
  defaultStyle?: string;
  fabrics?: Fabric[];
}

interface CatalogState {
  products: Product[];
  categories: Category[];
  activeProduct: Product | null;
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  products: [],
  categories: [],
  activeProduct: null,
  loading: false,
  error: null,
};

/**
 * Fetch products from the catalog microservice.
 * Mapped to the format expected by the frontend UI.
 */
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      // skipAuth: true — categories, fabrics, and products are public endpoints.
      // No JWT is needed; passing skipAuth prevents a spurious /api/auth/refresh call
      // for guest users who have no refresh cookie.
      const response = await fetchApi('/v1/products?limit=50', { skipAuth: true });
      // Response from fetchApi contains 'docs' since catalog-service is paginated
      const docs = response?.docs || [];

      return docs.map((p: any) => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description || '',
        price: p.basePrice,
        compare_at_price: p.basePrice ? Math.round(p.basePrice * 1.2) : null,
        category: p.categories?.[0]?.name || 'Other',
        fabric_type: p.fabrics?.[0]?.name || null,
        image_url: p.images?.[0] || null,
        is_customizable: true,
        rating: 5,
        review_count: 12,
        tag: p.productionDays <= 7 ? 'New' : null,
        gender: p.gender || 'unisex',
        occasion: p.occasion || 'casual',
        shipping_badge: p.productionDays <= 7 ? 'Ready to Ship' : 'Custom Order',
        styleOptions: p.styleOptions || [],
        defaultStyle: p.defaultStyle || '',
      })) as Product[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch categories list from catalog microservice categories.json file.
 */
export const fetchCategories = createAsyncThunk(
  'catalog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchApi('/v1/categories', { skipAuth: true });
      return (response?.categories || []) as Category[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch a single product by MongoDB ID or slug with populated fabrics.
 */
export const fetchProductByIdOrSlug = createAsyncThunk(
  'catalog/fetchProductByIdOrSlug',
  async (idOrSlug: string, { rejectWithValue }) => {
    try {
      const response = await fetchApi(`/v1/products/${idOrSlug}`, { skipAuth: true });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Single Product Fetch
      .addCase(fetchProductByIdOrSlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.activeProduct = null;
      })
      .addCase(fetchProductByIdOrSlug.fulfilled, (state, action) => {
        state.loading = false;
        const p = action.payload;
        if (p) {
          state.activeProduct = {
            id: p._id || p.id,
            name: p.name,
            slug: p.slug,
            description: p.description || '',
            price: p.basePrice || p.price,
            compare_at_price: p.basePrice ? Math.round(p.basePrice * 1.2) : (p.price ? Math.round(p.price * 1.2) : null),
            category: p.categories?.[0]?.name || p.category || 'Other',
            fabric_type: p.fabrics?.[0]?.name || p.fabric_type || null,
            image_url: p.images?.[0] || p.image_url || null,
            is_customizable: true,
            rating: p.rating || 5,
            review_count: p.review_count || 12,
            tag: p.productionDays <= 7 ? 'New' : (p.tag || null),
            gender: p.gender || 'unisex',
            occasion: p.occasion || 'casual',
            shipping_badge: p.productionDays <= 7 ? 'Ready to Ship' : 'Custom Order',
            styleOptions: p.styleOptions || [],
            defaultStyle: p.defaultStyle || '',
            fabrics: (p.fabrics || []).map((f: any) => ({
              id: f._id || f.id,
              slug: f.slug,
              name: f.name,
              description: f.description,
              properties: f.properties || [],
            })) as Fabric[],
          };
        }
      })
      .addCase(fetchProductByIdOrSlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default catalogSlice.reducer;
