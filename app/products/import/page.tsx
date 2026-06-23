'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type Mode = 'camera' | 'upload' | 'manual'
type ScanState = 'idle' | 'scanning' | 'done' | 'error'

interface OBFProduct {
  product_name?: string
  brands?: string
  image_front_url?: string
  categories?: string
  labels?: string
  ingredients_text?: string
}

const PREFILL_KEY = 'zenni_barcode_prefill'

export default function ImportPage() {
  const [mode, setMode] = useState<Mode>('camera')
  const [scanState, setScanState] = useState<ScanState>('idle')
  const [barcode, setBarcode] = useState('')
  const [manualInput, setManualInput] = useState('')
  const [obfProduct, setObfProduct] = useState<OBFProduct | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [lookingUp, setLookingUp] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [supported, setSupported] = useState<boolean | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanLoopRef = useRef<number | null>(null)

  useEffect(() => {
    setSupported('BarcodeDetector' in window)
    return () => stopCamera()
  }, [])

  useEffect(() => {
    if (mode !== 'camera') stopCamera()
  }, [mode])

  function stopCamera() {
    if (scanLoopRef.current) cancelAnimationFrame(scanLoopRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  async function startCamera() {
    setCameraError('')
    setScanState('scanning')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      })

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return
        try {
          const codes = await detector.detect(videoRef.current)
          if (codes.length > 0) {
            const found = codes[0].rawValue as string
            stopCamera()
            setScanState('done')
            setBarcode(found)
            await lookupBarcode(found)
            return
          }
        } catch { /* no barcode yet */ }
        scanLoopRef.current = requestAnimationFrame(scan)
      }
      scanLoopRef.current = requestAnimationFrame(scan)
    } catch (err) {
      setScanState('idle')
      setCameraError(err instanceof Error ? err.message : 'Camera access denied')
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setScanState('scanning')
    try {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise<void>((res, rej) => {
        img.onload = () => res()
        img.onerror = rej
      })

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const detector = new (window as any).BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39'],
      })
      const codes = await detector.detect(img)
      URL.revokeObjectURL(img.src)

      if (codes.length === 0) {
        setScanState('error')
        return
      }

      const found = codes[0].rawValue as string
      setScanState('done')
      setBarcode(found)
      await lookupBarcode(found)
    } catch {
      setScanState('error')
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault()
    const code = manualInput.trim()
    if (!code) return
    setBarcode(code)
    setScanState('done')
    await lookupBarcode(code)
  }

  async function lookupBarcode(code: string) {
    setLookingUp(true)
    setNotFound(false)
    setObfProduct(null)
    try {
      const res = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${code}.json`)
      const data = await res.json()
      if (data.status === 1 && data.product) {
        setObfProduct(data.product)
      } else {
        setNotFound(true)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLookingUp(false)
    }
  }

  function handleUseData() {
    const prefill = {
      name: obfProduct?.product_name ?? '',
      brand: obfProduct?.brands?.split(',')[0]?.trim() ?? '',
      photo: obfProduct?.image_front_url ?? '',
      description: [obfProduct?.categories, obfProduct?.labels].filter(Boolean).join(' · '),
    }
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify(prefill))
    window.location.href = '/products/add'
  }

  function handleAddBlank() {
    sessionStorage.removeItem(PREFILL_KEY)
    window.location.href = '/products/add'
  }

  function reset() {
    setScanState('idle')
    setBarcode('')
    setManualInput('')
    setObfProduct(null)
    setNotFound(false)
    setCameraError('')
    stopCamera()
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-skin-muted hover:text-skin-text mb-6 transition-colors">
        ← Back to library
      </Link>

      <h1 className="font-display text-3xl text-skin-text mb-1">Scan Barcode</h1>
      <p className="text-skin-muted text-sm mb-8">
        Scan or enter a product barcode to auto-fill details from the Open Beauty Facts database.
      </p>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-skin-bg border border-skin-border rounded-xl p-1 mb-6 w-fit">
        {(['camera', 'upload', 'manual'] as Mode[]).map(m => (
          <button
            key={m}
            onClick={() => { reset(); setMode(m) }}
            className={`text-sm px-4 py-2 rounded-lg transition-colors capitalize font-medium ${
              mode === m ? 'bg-white text-skin-text shadow-sm border border-skin-border' : 'text-skin-muted hover:text-skin-text'
            }`}
          >
            {m === 'camera' ? 'Camera' : m === 'upload' ? 'Upload Image' : 'Enter Manually'}
          </button>
        ))}
      </div>

      {/* Camera mode */}
      {mode === 'camera' && (
        <div className="bg-white rounded-2xl border border-skin-border p-6">
          {supported === false && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              Barcode detection is not supported in this browser. Try Chrome or Edge, or use the Upload or Manual tab instead.
            </p>
          )}
          {supported && scanState === 'idle' && (
            <div className="text-center">
              <p className="text-sm text-skin-muted mb-4">Point your camera at a product barcode.</p>
              <button
                onClick={startCamera}
                className="bg-blush text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Start Camera
              </button>
              {cameraError && <p className="text-sm text-red-500 mt-3">{cameraError}</p>}
            </div>
          )}
          {supported && scanState === 'scanning' && (
            <div className="space-y-3">
              <p className="text-xs text-skin-muted">Hold barcode steady in frame...</p>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                <div className="absolute inset-0 border-2 border-blush/40 rounded-xl pointer-events-none" />
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-blush/60" />
              </div>
              <button onClick={reset} className="text-sm text-skin-muted hover:text-red-400 transition-colors">Cancel</button>
            </div>
          )}
          {scanState === 'done' && <ScanResult barcode={barcode} product={obfProduct} notFound={notFound} lookingUp={lookingUp} onUse={handleUseData} onBlank={handleAddBlank} onReset={reset} />}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <div className="bg-white rounded-2xl border border-skin-border p-6">
          {supported === false && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
              Barcode detection is not supported in this browser. Try Chrome or Edge, or use the Manual tab instead.
            </p>
          )}
          {supported !== false && scanState === 'idle' && (
            <div className="text-center">
              <p className="text-sm text-skin-muted mb-4">Upload a photo of the product barcode.</p>
              <label className="cursor-pointer bg-blush text-white px-6 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity inline-block">
                Choose Image
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}
          {scanState === 'scanning' && (
            <div className="text-center py-6">
              <div className="text-skin-muted text-sm">Detecting barcode...</div>
            </div>
          )}
          {scanState === 'error' && (
            <div className="text-center py-4">
              <p className="text-sm text-red-500 mb-3">No barcode found in this image. Try a clearer photo.</p>
              <button onClick={reset} className="text-sm text-blush hover:opacity-80">Try again</button>
            </div>
          )}
          {scanState === 'done' && <ScanResult barcode={barcode} product={obfProduct} notFound={notFound} lookingUp={lookingUp} onUse={handleUseData} onBlank={handleAddBlank} onReset={reset} />}
        </div>
      )}

      {/* Manual mode */}
      {mode === 'manual' && (
        <div className="bg-white rounded-2xl border border-skin-border p-6">
          <p className="text-sm text-skin-muted mb-4">Enter the barcode number printed on the product.</p>
          {scanState !== 'done' ? (
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input
                type="text"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="e.g. 8809642710255"
                className="flex-1 px-4 py-2.5 border border-skin-border rounded-xl text-sm focus:outline-none focus:border-blush focus:ring-2 focus:ring-blush/20"
                inputMode="numeric"
              />
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="bg-blush text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Look Up
              </button>
            </form>
          ) : (
            <ScanResult barcode={barcode} product={obfProduct} notFound={notFound} lookingUp={lookingUp} onUse={handleUseData} onBlank={handleAddBlank} onReset={reset} />
          )}
        </div>
      )}

      <p className="text-xs text-skin-muted mt-6 text-center">
        Product data sourced from{' '}
        <span className="font-medium">Open Beauty Facts</span> — community-maintained database.
        Always verify details before saving.
      </p>
    </div>
  )
}

function ScanResult({
  barcode, product, notFound, lookingUp, onUse, onBlank, onReset,
}: {
  barcode: string
  product: OBFProduct | null
  notFound: boolean
  lookingUp: boolean
  onUse: () => void
  onBlank: () => void
  onReset: () => void
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Detected</span>
        <code className="text-xs text-skin-muted font-mono">{barcode}</code>
      </div>

      {lookingUp && (
        <p className="text-sm text-skin-muted">Looking up in Open Beauty Facts...</p>
      )}

      {!lookingUp && notFound && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700 mb-3">
            This barcode was not found in Open Beauty Facts. You can still add the product manually.
          </p>
          <div className="flex gap-3">
            <button onClick={onBlank} className="bg-blush text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90">
              Add manually
            </button>
            <button onClick={onReset} className="text-sm text-skin-muted hover:text-skin-text">Scan again</button>
          </div>
        </div>
      )}

      {!lookingUp && product && (
        <div className="bg-skin-bg border border-skin-border rounded-xl p-4 space-y-3">
          <div className="flex gap-4">
            {product.image_front_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image_front_url} alt="product" className="w-20 h-20 object-contain rounded-lg border border-skin-border bg-white shrink-0" />
            )}
            <div>
              {product.brands && <p className="text-xs text-skin-muted uppercase tracking-wide font-medium">{product.brands}</p>}
              <p className="font-display text-base text-skin-text">{product.product_name || 'Unknown name'}</p>
              {product.categories && <p className="text-xs text-skin-muted mt-1">{product.categories}</p>}
            </div>
          </div>
          {product.ingredients_text && (
            <div>
              <p className="text-xs font-medium text-skin-text mb-1">Ingredients (raw):</p>
              <p className="text-xs text-skin-muted leading-relaxed line-clamp-3">{product.ingredients_text}</p>
            </div>
          )}
          <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
            Name and brand will be pre-filled. Add ingredients, risk levels, and other details in the form.
          </p>
          <div className="flex gap-3">
            <button onClick={onUse} className="bg-blush text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity">
              Use this data
            </button>
            <button onClick={onBlank} className="text-sm text-skin-muted hover:text-skin-text transition-colors">Add blank form</button>
            <button onClick={onReset} className="text-sm text-skin-muted hover:text-skin-text transition-colors">Scan again</button>
          </div>
        </div>
      )}
    </div>
  )
}
