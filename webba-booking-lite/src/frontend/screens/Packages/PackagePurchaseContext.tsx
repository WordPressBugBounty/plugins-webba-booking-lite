import {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react'

export type PackageProduct = {
    id: number
    name: string
    description?: string
    visit_count: number
    price: number
    price_formatted: string
    applicable_for_all_services?: boolean
    services?: number[]
    min_interval_days?: number
    max_visits_per_week?: number
    max_visits_per_month?: number
    max_visits_per_day?: number
    expiry_type?: string
    expiry_relative_days?: number
}

export type PackagePaymentMethod = {
    id: string
    name: string
    icon?: string
}

export type PackageStripeDetails = {
    client_secret?: string
    intent_id?: string
    amount?: number
    payment_method?: string
    error?: string
}

type PackagePurchaseContextValue = {
    products: PackageProduct[]
    setProducts: (products: PackageProduct[]) => void
    selectedProductId: number | null
    selectProduct: (id: number | null) => void
    selectedProduct: PackageProduct | null
    paymentMethod: string
    setPaymentMethod: (method: string) => void
    paymentMethods: PackagePaymentMethod[]
    setPaymentMethods: (methods: PackagePaymentMethod[]) => void
    stripeDetails: PackageStripeDetails | null
    setStripeDetails: (details: PackageStripeDetails | null) => void
    purchaseResult: any | null
    setPurchaseResult: (result: any | null) => void
    purchasing: boolean
    setPurchasing: (value: boolean) => void
    purchaseError: string | null
    setPurchaseError: (error: string | null) => void
    setPurchaseHandler: (handler: (() => Promise<void>) | null) => void
    runPurchase: () => Promise<void>
}

const PackagePurchaseContext =
    createContext<PackagePurchaseContextValue | null>(null)

export const PackagePurchaseProvider = ({
    children,
}: PropsWithChildren) => {
    const [products, setProducts] = useState<PackageProduct[]>([])
    const [selectedProductId, setSelectedProductId] = useState<number | null>(
        null
    )
    const [paymentMethod, setPaymentMethod] = useState('')
    const [paymentMethods, setPaymentMethods] = useState<
        PackagePaymentMethod[]
    >([])
    const [stripeDetails, setStripeDetails] =
        useState<PackageStripeDetails | null>(null)
    const [purchaseResult, setPurchaseResult] = useState<any | null>(null)
    const [purchasing, setPurchasing] = useState(false)
    const [purchaseError, setPurchaseError] = useState<string | null>(null)
    const purchaseHandlerRef = useRef<(() => Promise<void>) | null>(null)
    const setPurchaseHandler = useCallback(
        (handler: (() => Promise<void>) | null) => {
            purchaseHandlerRef.current = handler
        },
        []
    )
    const runPurchase = useCallback(async () => {
        if (purchaseHandlerRef.current) {
            await purchaseHandlerRef.current()
        }
    }, [])

    const selectProduct = useCallback((id: number | null) => {
        setSelectedProductId(id)
        setStripeDetails(null)
    }, [])

    const selectedProduct = useMemo(
        () =>
            products.find((product) => product.id === selectedProductId) ||
            null,
        [products, selectedProductId]
    )

    const value = useMemo(
        () => ({
            products,
            setProducts,
            selectedProductId,
            selectProduct,
            selectedProduct,
            paymentMethod,
            setPaymentMethod,
            paymentMethods,
            setPaymentMethods,
            stripeDetails,
            setStripeDetails,
            purchaseResult,
            setPurchaseResult,
            purchasing,
            setPurchasing,
            purchaseError,
            setPurchaseError,
            setPurchaseHandler,
            runPurchase,
        }),
        [
            products,
            selectedProductId,
            selectProduct,
            selectedProduct,
            paymentMethod,
            paymentMethods,
            stripeDetails,
            purchaseResult,
            purchasing,
            purchaseError,
            setPurchaseHandler,
            runPurchase,
        ]
    )

    return (
        <PackagePurchaseContext.Provider value={value}>
            {children}
        </PackagePurchaseContext.Provider>
    )
}

export const usePackagePurchase = () => {
    const context = useContext(PackagePurchaseContext)
    if (!context) {
        throw new Error(
            'usePackagePurchase must be used within PackagePurchaseProvider'
        )
    }
    return context
}
