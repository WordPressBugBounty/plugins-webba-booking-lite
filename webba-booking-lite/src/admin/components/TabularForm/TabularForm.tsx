import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import { __ } from '@wordpress/i18n'
import closeIcon from '../../../../public/images/icon-close.svg'
import { useForm } from '../Form/lib/FormProvider'
import { capitalize } from '../../utils/capitalize'
import { ITabularFormProps } from './types'
import './TabularForm.scss'
import { TabularFormRow } from './TabularFormRow'
import { getFormState } from '../Form/lib/utils'

export const TabularForm = ({
    sections,
    tabs,
    subsectionTitles,
    showSearch,
}: ITabularFormProps) => {
    const form = useForm()
    const sectionKeys = Object.keys(sections).filter(
        (key) => sections[key]?.length > 0
    )
    const [openSections, setOpenSections] = useState<Record<string, boolean>>(
        () =>
            sectionKeys.reduce(
                (acc, key, index) => ({ ...acc, [key]: index === 0 }),
                {}
            )
    )
    const [searchTerm, setSearchTerm] = useState('')

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const normalizedSearch = searchTerm.trim().toLowerCase()
    const hasSearch = !!showSearch && normalizedSearch.length > 0

    const searchResults = useMemo(() => {
        if (!hasSearch) {
            return []
        }

        const { values } = getFormState(form as any)

        const results: { sectionKey: string; fieldName: string }[] = []

        sectionKeys.forEach((sectionKey) => {
            const fields = sections[sectionKey] || []

            fields.forEach((field) => {
                const formField = form.fields[field.name]
                if (!formField || formField.isIgnored?.value === true) {
                    return
                }

                const labelText = (field.label ?? capitalize(field.name))
                    .toString()
                    .toLowerCase()
                const keyText = field.name.toLowerCase()
                const valueText = values[field.name]
                    ? String(values[field.name]).toLowerCase()
                    : ''

                if (
                    labelText.includes(normalizedSearch) ||
                    keyText.includes(normalizedSearch) ||
                    valueText.includes(normalizedSearch)
                ) {
                    results.push({ sectionKey, fieldName: field.name })
                }
            })
        })

        return results
    }, [form, normalizedSearch, hasSearch, sectionKeys, sections])

    const renderContent = () => {
        if (hasSearch) {
            return (
                <div className="wbk_tabularForm__searchResultsTable">
                    <div className="wbk_tabularForm__rows">
                    {searchResults.length > 0 && (
                        <div className="wbk_tabularForm__tableHeaderRow">
                            <span className="wbk_tabularForm__tableHeaderCell">
                                {__('English', 'webba-booking-lite')}
                            </span>
                            <span className="wbk_tabularForm__tableHeaderCell">
                                {__('Your language', 'webba-booking-lite')}
                            </span>
                        </div>
                    )}
                    {searchResults.length === 0 && (
                        <div className="wbk_tabularForm__noResults">
                            {__('No matching fields found', 'webba-booking-lite')}
                        </div>
                    )}

                    {searchResults.map(({ sectionKey, fieldName }) => {
                        const field = sections[sectionKey].find(
                            (f) => f.name === fieldName
                        )
                        if (!field) return null

                        const formField = form.fields[field.name]
                        if (!formField) return null

                        return (
                            <TabularFormRow
                                key={`${sectionKey}-${field.name}`}
                                field={field}
                                formField={formField}
                            />
                        )
                    })}
                    </div>
                </div>
            )
        }

        return sectionKeys.map((sectionKey) => {
                const fields = sections[sectionKey].filter(
                    (field) =>
                        form.fields[field.name] &&
                        form.fields[field.name].isIgnored?.value !== true
                )
                if (fields.length === 0) return null

                const title =
                    tabs?.[sectionKey]?.title || capitalize(sectionKey)
                const isOpen = openSections[sectionKey] ?? false

                return (
                    <div
                        key={sectionKey}
                        className="wbk_tabularForm__accordion"
                        data-section={sectionKey}
                    >
                        <button
                            type="button"
                            className="wbk_tabularForm__accordionHeader"
                            onClick={() => toggleSection(sectionKey)}
                            aria-expanded={isOpen}
                        >
                            <span className="wbk_tabularForm__accordionTitle">
                                {title}
                            </span>
                            <span
                                className={classNames('wbk_tabularForm__accordionIcon', {
                                    'wbk_tabularForm__accordionIcon--open': isOpen,
                                })}
                                aria-hidden
                            >
                                {isOpen ? '−' : '+'}
                            </span>
                        </button>
                        <div
                            className={classNames('wbk_tabularForm__accordionContent', {
                                'wbk_tabularForm__accordionContent--open': isOpen,
                            })}
                        >
                            <div className="wbk_tabularForm__rows">
                                <div className="wbk_tabularForm__tableHeaderRow">
                                    <span className="wbk_tabularForm__tableHeaderCell">
                                        {__('English', 'webba-booking-lite')}
                                    </span>
                                    <span className="wbk_tabularForm__tableHeaderCell">
                                        {__('Your language', 'webba-booking-lite')}
                                    </span>
                                </div>
                                {fields.map((field) => {
                                    const formField = form.fields[field.name]
                                    if (!formField) return null

                                    return (
                                        <TabularFormRow
                                            key={field.name}
                                            field={field}
                                            formField={formField}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
        })
    }

    return (
        <div className="wbk_tabularForm__form">
            {showSearch && (
                <div className="wbk_tabularForm__searchContainer">
                    <div
                        className={classNames('wbk_tabularForm__searchInputWrapper', {
                            'wbk_tabularForm__searchInputWrapper--hasClear':
                                searchTerm.length > 0,
                        })}
                    >
                        <input
                            type="text"
                            className="wbk_tabularForm__searchInput"
                            placeholder={__('Search', 'webba-booking-lite')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm.length > 0 && (
                            <button
                                type="button"
                                className="wbk_tabularForm__searchClearBtn"
                                onClick={() => setSearchTerm('')}
                                aria-label={__('Clear search', 'webba-booking-lite')}
                            >
                                <img src={closeIcon} alt="" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {renderContent()}
        </div>
    )
}
