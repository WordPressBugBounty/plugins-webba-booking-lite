import { FormEvent, useMemo, useState } from 'react'
import { __ } from '@wordpress/i18n'
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data'
import apiFetch from '@wordpress/api-fetch'
import Select from 'react-select'
import classNames from 'classnames'
import { store } from '../../../../store/backend'
import { Label } from '../../../components/Form/Fields/Label/Label'
import { formatOptions } from '../../../components/Form/Fields/GenericSelectField/utils'
import { IOption } from '../../../components/Form/types'
import { Button } from '../../../components/Button/Button'
import { getAdminSelectStyles } from '../../../utils/adminSelectStyles'
import closeIcon from '../../../../../public/images/icon-close.svg'
import { GrantPackageFormProps, PackageProductItem } from './types'
import './GrantPackageForm.scss'

const selectStyles = getAdminSelectStyles()

export const GrantPackageForm = ({ onDone }: GrantPackageFormProps) => {
    const { setToastNotification, invalidateResolution } = useDispatch(store)
    const [productId, setProductId] = useState('')
    const [userId, setUserId] = useState('')
    const [busy, setBusy] = useState(false)
    const [showValidation, setShowValidation] = useState(false)
    const [productFocused, setProductFocused] = useState(false)
    const [userFocused, setUserFocused] = useState(false)
    const products = useSelect(
        (select) => select(store).getItems('package_products') || [],
        []
    ) as PackageProductItem[]
    const userFieldOptions = useSelect(
        (select) =>
            select(store).getFieldOptions('customer_packages', 'user_id', []),
        []
    )
    const usersLoading = useSelect(
        (select) =>
            select(store).getFieldLoading('customer_packages', 'user_id'),
        []
    )

    const productOptions = useMemo<IOption[]>(
        () =>
            products
                .filter((product) => product?.id && product?.name)
                .map((product) => ({
                    value: String(product.id),
                    label: product.name,
                })),
        [products]
    )
    const userOptions = useMemo<IOption[]>(
        () => formatOptions(userFieldOptions || {}),
        [userFieldOptions]
    )

    const selectedProduct =
        productOptions.find((option) => option.value === productId) || null
    const selectedUser =
        userOptions.find((option) => option.value === userId) || null
    const productMissing = showValidation && !productId
    const userMissing = showValidation && !userId

    const submit = async (event?: FormEvent) => {
        event?.preventDefault()

        if (!productId || !userId) {
            setShowValidation(true)
            return
        }

        setBusy(true)
        try {
            await apiFetch({
                path: '/wbk/v2/grant-package/',
                method: 'POST',
                data: {
                    product_id: Number(productId),
                    user_id: Number(userId),
                },
            })
            invalidateResolution('getItems', ['customer_packages'])
            await resolveSelect(store).getItems('customer_packages')
            setToastNotification({
                type: 'success',
                message: __('Package granted.', 'webba-booking-lite'),
            })
            onDone()
        } catch (error: any) {
            setToastNotification({
                type: 'error',
                message:
                    error?.message ||
                    error?.description ||
                    __('Could not grant package.', 'webba-booking-lite'),
            })
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="wbk_form__container">
            <div className="wbk_form__header">
                <div className="wbk_form__headerTitle">
                    {__('Grant package', 'webba-booking-lite')}
                </div>
                <div>
                    <button
                        type="button"
                        onClick={onDone}
                        className="wbk_form__closeBtn"
                    >
                        <img
                            src={closeIcon}
                            alt={__('Close', 'webba-booking-lite')}
                        />
                        <span className="wbk_form__closeBtnText">
                            {__('Close', 'webba-booking-lite')}
                        </span>
                    </button>
                </div>
            </div>
            <form
                className="wbk_form__form"
                id="grant-package-form"
                onSubmit={submit}
            >
                <div className="wbk_form__innerFieldsWrapper">
                    <div className="wbk_form__fieldWrapper">
                        <div
                            className={classNames('wbk_genericSelectField', {
                                'wbk_genericSelectField--invalid':
                                    productMissing,
                            })}
                        >
                            <Label
                                id="grant-package-product"
                                title={__(
                                    'Package product',
                                    'webba-booking-lite'
                                )}
                            />
                            <Select
                                inputId="grant-package-product"
                                value={selectedProduct}
                                options={productOptions}
                                styles={selectStyles}
                                placeholder={__(
                                    'Select…',
                                    'webba-booking-lite'
                                )}
                                classNames={{
                                    control: () =>
                                        classNames(
                                            'wbk_genericSelectField__selectInput',
                                            {
                                                'wbk_genericSelectField__selectInput--focused':
                                                    productFocused,
                                            }
                                        ),
                                }}
                                onChange={(option) => {
                                    const selected = option as IOption | null
                                    setProductId(selected?.value || '')
                                }}
                                onFocus={() => setProductFocused(true)}
                                onBlur={() => setProductFocused(false)}
                                isSearchable
                                isClearable
                            />
                            {productMissing && (
                                <div className="wbk_grantPackageForm__error">
                                    {__(
                                        'Select a package product.',
                                        'webba-booking-lite'
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="wbk_form__fieldWrapper">
                        <div
                            className={classNames('wbk_genericSelectField', {
                                'wbk_genericSelectField--invalid': userMissing,
                            })}
                        >
                            <Label
                                id="grant-package-user-id"
                                title={__('Customer', 'webba-booking-lite')}
                            />
                            <Select
                                inputId="grant-package-user-id"
                                value={selectedUser}
                                options={userOptions}
                                styles={selectStyles}
                                placeholder={__(
                                    'Select…',
                                    'webba-booking-lite'
                                )}
                                classNames={{
                                    control: () =>
                                        classNames(
                                            'wbk_genericSelectField__selectInput',
                                            {
                                                'wbk_genericSelectField__selectInput--focused':
                                                    userFocused,
                                            }
                                        ),
                                }}
                                onChange={(option) => {
                                    const selected = option as IOption | null
                                    setUserId(selected?.value || '')
                                }}
                                onFocus={() => setUserFocused(true)}
                                onBlur={() => setUserFocused(false)}
                                isSearchable
                                isClearable
                                isLoading={usersLoading}
                            />
                            {userMissing && (
                                <div className="wbk_grantPackageForm__error">
                                    {__(
                                        'Select a customer.',
                                        'webba-booking-lite'
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
            <div className="wbk_form__buttons">
                <Button
                    className="button-wb wbk_grantPackageForm__submit"
                    actionType="submit"
                    form="grant-package-form"
                    isLoading={busy}
                >
                    {__('Grant', 'webba-booking-lite')}
                </Button>
            </div>
        </div>
    )
}
