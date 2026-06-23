const CUSTOM_KEY = 'zenni_concern_photos'

// Curated reference photos per concern type.
// If an image fails to load the component falls back to a styled placeholder.
// Users can override any photo from the product detail page.
export const CONCERN_PHOTO_DEFAULTS: Record<string, { url: string; label: string }> = {
  'sebaceous-filaments': {
    label: 'Sebaceous Filaments',
    url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'blackheads': {
    label: 'Blackheads',
    url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'whiteheads': {
    label: 'Whiteheads',
    url: 'https://images.unsplash.com/photo-1617040096497-fcb7ac21e98b?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'hormonal-acne': {
    label: 'Hormonal Acne',
    url: 'https://images.unsplash.com/photo-1616698698039-b4e6e71b22ad?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'inflammatory-acne': {
    label: 'Inflammatory Acne',
    url: 'https://images.unsplash.com/photo-1614161185700-03de1a3a9ec2?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'cystic-acne': {
    label: 'Cystic Acne',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'fungal-acne': {
    label: 'Fungal Acne',
    url: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'wrinkles-fine-lines': {
    label: 'Wrinkles & Fine Lines',
    url: 'https://images.unsplash.com/photo-1502767089025-6572583495b9?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'hyperpigmentation': {
    label: 'Hyperpigmentation',
    url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'dryness': {
    label: 'Dryness',
    url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'dehydration': {
    label: 'Dehydration',
    url: 'https://images.unsplash.com/photo-1509549649946-f1b6276d4f35?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'sensitivity-redness': {
    label: 'Sensitivity & Redness',
    url: 'https://images.unsplash.com/photo-1502764613149-7f1d229e230f?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'large-pores': {
    label: 'Large Pores',
    url: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'uneven-texture': {
    label: 'Uneven Texture',
    url: 'https://images.unsplash.com/photo-1606830733744-0ad4a93d73f8?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'dark-circles': {
    label: 'Dark Circles',
    url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'sun-damage': {
    label: 'Sun Damage',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'oiliness': {
    label: 'Oiliness',
    url: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=400&h=400&q=80',
  },
  'skin-barrier-damage': {
    label: 'Skin Barrier Damage',
    url: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?auto=format&fit=crop&w=400&h=400&q=80',
  },
}

export function getCustomPhotos(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(CUSTOM_KEY) ?? '{}') }
  catch { return {} }
}

export function setCustomPhoto(concern: string, url: string): void {
  const photos = getCustomPhotos()
  if (url) {
    photos[concern] = url
  } else {
    delete photos[concern]
  }
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(photos))
}

export function getConcernPhotoUrl(concern: string): string {
  const customs = getCustomPhotos()
  return customs[concern] || CONCERN_PHOTO_DEFAULTS[concern]?.url || ''
}

export function getConcernLabel(concern: string): string {
  return CONCERN_PHOTO_DEFAULTS[concern]?.label ?? concern.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
