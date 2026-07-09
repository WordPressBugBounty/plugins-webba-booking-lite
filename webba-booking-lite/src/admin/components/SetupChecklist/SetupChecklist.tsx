import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelect } from '@wordpress/data'
import { store_name } from '../../../store/backend'
import type { SetupChecklistState, SetupChecklistViewMode } from './types'
import { SetupChecklistMinimized } from './SetupChecklistMinimized'
import { SetupChecklistExpanded } from './SetupChecklistExpanded'
import './SetupChecklist.scss'

export const SetupChecklist = () => {
    const [viewMode, setViewMode] = useState<SetupChecklistViewMode>('minimized')
    const [isPopupVisible, setIsPopupVisible] = useState(true)
    const [isReviewMode, setIsReviewMode] = useState(false)
    const [reviewActiveStepId, setReviewActiveStepId] = useState<string | null>(
        null
    )
    const [reviewSessionKey, setReviewSessionKey] = useState(0)

    const { checklist, isLoading, pluginUrl } = useSelect(
        (select: any) => ({
            checklist: select(store_name).getSetupChecklist() as SetupChecklistState | null,
            isLoading: select(store_name).isSetupChecklistLoading(),
            pluginUrl: select(store_name).getPreset()?.plugin_url as string | undefined,
        }),
        []
    )

    const {
        fetchSetupChecklist,
        dismissSetupChecklist,
        skipSetupChecklistStep,
        clearSetupChecklistExpandRequest,
    } = useDispatch(store_name) as {
        fetchSetupChecklist: () => Promise<SetupChecklistState>
        dismissSetupChecklist: () => Promise<void>
        skipSetupChecklistStep: (stepId: string) => Promise<void>
        clearSetupChecklistExpandRequest: () => void
    }

    const expandRequest = useSelect(
        (select: any) => select(store_name).getSetupChecklistExpandRequest(),
        []
    )

    useEffect(() => {
        fetchSetupChecklist()
    }, [fetchSetupChecklist])

    const handleExpand = useCallback(() => {
        setViewMode('expanded')
        fetchSetupChecklist()
    }, [fetchSetupChecklist])

    const handleCollapse = useCallback(() => {
        setViewMode('minimized')
        setIsPopupVisible(true)
    }, [])

    const handleTogglePopup = useCallback(() => {
        setIsPopupVisible((visible) => !visible)
        fetchSetupChecklist()
    }, [fetchSetupChecklist])

    const handleDismiss = useCallback(async () => {
        setIsReviewMode(false)
        setReviewActiveStepId(null)
        await dismissSetupChecklist()
    }, [dismissSetupChecklist])

    const handleSkipStep = useCallback(
        async (stepId: string) => {
            await skipSetupChecklistStep(stepId)
        },
        [skipSetupChecklistStep]
    )

    useEffect(() => {
        const refreshChecklist = () => {
            fetchSetupChecklist()
        }

        window.addEventListener('focus', refreshChecklist)
        return () => window.removeEventListener('focus', refreshChecklist)
    }, [fetchSetupChecklist])

    useEffect(() => {
        if (!expandRequest) {
            return
        }

        if (checklist && !checklist.dismissed) {
            const firstStepId = checklist.steps[0]?.id ?? checklist.active_step

            setIsReviewMode(true)
            setReviewActiveStepId(firstStepId)
            setReviewSessionKey((sessionKey) => sessionKey + 1)
            setViewMode('expanded')
            setIsPopupVisible(true)
        }

        clearSetupChecklistExpandRequest()
    }, [
        expandRequest,
        checklist,
        clearSetupChecklistExpandRequest,
    ])

    const shouldShowChecklist =
        checklist &&
        !checklist.dismissed &&
        (!checklist.is_complete || isReviewMode)

    if (isLoading && !checklist) {
        return null
    }

    if (!shouldShowChecklist) {
        return null
    }

    return (
        <div
            className={`wbk_setupChecklist ${
                viewMode === 'expanded' ? 'wbk_setupChecklist--expanded' : ''
            }`}
        >
            {viewMode === 'minimized' ? (
                <SetupChecklistMinimized
                    state={checklist}
                    isPopupVisible={isPopupVisible}
                    onExpand={handleExpand}
                    onTogglePopup={handleTogglePopup}
                    onDismiss={handleDismiss}
                />
            ) : (
                <SetupChecklistExpanded
                    key={reviewSessionKey}
                    state={checklist}
                    pluginUrl={pluginUrl || ''}
                    isReviewMode={isReviewMode}
                    reviewActiveStepId={reviewActiveStepId}
                    onReviewStepChange={setReviewActiveStepId}
                    onClose={handleCollapse}
                    onDismiss={handleDismiss}
                    onSkipStep={handleSkipStep}
                />
            )}
        </div>
    )
}
