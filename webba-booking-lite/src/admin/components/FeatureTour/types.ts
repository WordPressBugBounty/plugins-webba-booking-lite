export type FeatureTourPlacement = 'right' | 'bottom'

export interface FeatureTourStep {
    id: string
    message: string
    button_text: string
    anchor: string
    placement: FeatureTourPlacement
    completed: boolean
}

export interface FeatureTourState {
    steps: FeatureTourStep[]
    active_step: FeatureTourStep | null
    is_complete: boolean
    completed_count: number
    total_count: number
}

export interface AnchorRect {
    top: number
    left: number
    width: number
    height: number
}
