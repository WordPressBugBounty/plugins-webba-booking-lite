export type SetupChecklistStepStatus = 'completed' | 'in_progress' | 'pending'

export interface SetupChecklistStep {
    id: string
    title: string
    description: string
    status: SetupChecklistStepStatus
    required_plans: string[]
    action_url: string
    guide_url: string
    auto_completed: boolean
    manually_completed: boolean
    skippable: boolean
    skipped: boolean
}

export interface SetupChecklistEmailTemplate {
    id: number
    name: string
    type: string
    type_label: string
    recipients: string[]
    recipient_labels: string[]
    enabled: boolean
}

export interface SetupChecklistResources {
    video_url: string
    documentation_url: string
    support_url: string
    pricing_url: string
}

export interface SetupChecklistState {
    dismissed: boolean
    is_complete: boolean
    completed_count: number
    total_count: number
    progress_percent: number
    active_step: string
    shortcode: string
    steps: SetupChecklistStep[]
    resources: SetupChecklistResources
    email_templates: SetupChecklistEmailTemplate[]
}

export type SetupChecklistViewMode = 'minimized' | 'expanded'
