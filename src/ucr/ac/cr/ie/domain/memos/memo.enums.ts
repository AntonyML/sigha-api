export enum MemoVisibility {
    PUBLIC = 'public',
    CLINICAL = 'clinical',
    CONFIDENTIAL = 'confidential',
}

export enum MemoStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    ARCHIVED = 'archived',
}

export enum MemoUrgency {
    ROUTINE = 'routine',
    PRIORITY = 'priority',
    URGENT = 'urgent',
}

export enum MemoCategory {
    GENERAL = 'general',
    REFERRAL = 'referral',
    CLINICAL_NOTE = 'clinical_note',
    ADMINISTRATIVE = 'administrative',
    FOLLOW_UP = 'follow_up',
}
