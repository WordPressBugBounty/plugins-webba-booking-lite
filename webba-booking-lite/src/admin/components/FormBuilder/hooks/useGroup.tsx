import {
    useReducer,
    createContext,
    useContext,
    PropsWithChildren,
    useState,
} from 'react'
import { ValidatorFn } from '../../Form/utils/validation'

export interface FieldConfig {
    defaultValue: any
    validateOnInit?: boolean
    validators?: ValidatorFn<any>[]
}

export type CreateFieldGroupConfig = Record<string, FieldConfig | FieldConfig[]>

export interface FieldState {
    value: any
    errors: string[]
    config: FieldConfig
}

const validate = (value: any, validators: ValidatorFn<any>[] = []) =>
    validators.map((validate) => validate(value)).filter(Boolean) as string[]

const safeSerializeValue = (value: any): any => {
    if (value === null || value === undefined) {
        return value
    }

    if (typeof value === 'string') {
        return value
    }

    if (Array.isArray(value)) {
        return value.map(safeSerializeValue)
    }

    if (typeof value === 'object') {
        const result: any = {}
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                result[key] = safeSerializeValue(value[key])
            }
        }
        return result
    }

    return value
}

export const safeStringify = (value: any): string => {
    try {
        return JSON.stringify(value)
    } catch (error) {
        console.error('Error stringifying value:', error)
        return JSON.stringify({ error: 'Failed to serialize data' })
    }
}

const createFieldState = (config: FieldConfig): FieldState => ({
    value: config.defaultValue,
    errors: config.validateOnInit
        ? validate(config.defaultValue, config.validators)
        : [],
    config,
})

const createFieldGroupState = (fieldsConfig: CreateFieldGroupConfig) => {
    const res: any = {}

    for (const field of Object.keys(fieldsConfig)) {
        const fieldConfig = fieldsConfig[field]

        res[field] = Array.isArray(fieldConfig)
            ? fieldConfig.map(createFieldState)
            : createFieldState(fieldConfig)
    }

    return res as Record<string, FieldState | FieldState[]>
}

type Action =
    | {
          type: 'set'
          payload: FieldGroupState[]
      }
    | {
          type: 'update'
          payload: {
              groupIndex: number
              fieldName: string
              value: any
          }
      }
    | {
          type: 'add'
          payload: FieldGroupConfig
      }
    | {
          type: 'delete'
          payload: {
              id: number
          }
      }
    | {
          type: 'set-group'
          payload: {
              id: number
              config: FieldGroupConfig
          }
      }
    | {
          type: 'patch'
          payload: {
              id: number
              values: Record<string, any>
          }
      }
    | {
          type: 'push-to-array'
          payload: {
              groupIndex: number
              fieldName: string
              config: FieldConfig
          }
      }
    | {
          type: 'update-in-array'
          payload: {
              groupIndex: number
              fieldName: string
              fieldIndex: number
              value: any
          }
      }
    | {
          type: 'remove-from-array'
          payload: {
              groupIndex: number
              fieldName: string
              fieldIndex: number
          }
      }
    | {
          type: 'patch-array'
          payload: {
              groupIndex: number
              fieldName: string
              update: any[]
          }
      }
    | {
          type: 'set-array'
          payload: {
              groupIndex: number
              fieldName: string
              value: FieldConfig[]
          }
      }

export interface FieldGroupConfig {
    fields: CreateFieldGroupConfig
    meta?: any
}

export interface FieldGroupState {
    id: number
    state: Record<string, FieldState | FieldState[]>
    meta?: any
}

const createFieldGroup = (
    id: number,
    { fields, meta }: FieldGroupConfig
): FieldGroupState => ({
    id,
    meta,
    state: createFieldGroupState(fields),
})

const fieldGroupArrayReducer = (
    state: FieldGroupState[],
    { type, payload }: Action
): FieldGroupState[] => {
    switch (type) {
        case 'set': {
            return payload
        }
        case 'add': {
            return [...state, createFieldGroup(state.length, payload)]
        }
        case 'delete': {
            return state.filter((group) => group.id !== payload.id)
        }
        case 'update': {
            const { fieldName, groupIndex, value } = payload
            const foundGroupIndex = state.findIndex(
                (group) => group.id === groupIndex
            )
            const group = state[foundGroupIndex]

            if (!group) {
                return state
            }

            const copy = [...state]
            const fieldState = group.state[fieldName]

            const { config } = fieldState as FieldState

            copy[foundGroupIndex] = {
                ...group,
                state: {
                    ...group.state,
                    [fieldName]: {
                        config,
                        value,
                        errors: validate(value, config.validators),
                    },
                },
            }

            return copy
        }
        case 'patch': {
            const groupIndex = state.findIndex(
                (group) => group.id === payload.id
            )

            if (groupIndex === -1) {
                return state
            }

            const copy = [...state]

            for (const field of Object.keys(payload.values)) {
                if (
                    field in copy[groupIndex].state &&
                    'value' in copy[groupIndex].state[field]
                ) {
                    copy[groupIndex].state[field].value = payload.values[field]
                }
            }

            return copy
        }
        case 'set-group': {
            const groupIndex = state.findIndex(
                (group) => group.id === payload.id
            )

            if (groupIndex === -1) {
                return state
            }

            const copy = [...state]

            copy[groupIndex] = createFieldGroup(payload.id, payload.config)

            return copy
        }
        case 'push-to-array': {
            const { fieldName, config, groupIndex } = payload
            const foundGroupIndex = state.findIndex(
                (group) => group.id === groupIndex
            )
            const group = state[foundGroupIndex]

            if (!group) {
                return state
            }

            const copy = [...state]

            const arrayState = copy[foundGroupIndex].state[
                fieldName
            ] as FieldState[]

            copy[foundGroupIndex].state[fieldName] = [
                ...arrayState,
                createFieldState(config),
            ]

            return copy
        }
        case 'update-in-array': {
            const { groupIndex, fieldIndex, fieldName, value } = payload

            const foundGroupIndex = state.findIndex(
                (group) => group.id === groupIndex
            )
            const group = state[foundGroupIndex]

            if (!group) {
                return state
            }

            const copy = [...state]

            const fieldArrayState = copy[foundGroupIndex].state[fieldName]

            if (!Array.isArray(fieldArrayState)) {
                return state
            }

            if (!fieldArrayState[fieldIndex]) {
                return state
            }

            fieldArrayState[fieldIndex].value = value
            fieldArrayState[fieldIndex].errors = validate(
                value,
                fieldArrayState[fieldIndex].config.validators
            )

            return copy
        }
        case 'remove-from-array': {
            const { fieldIndex, fieldName, groupIndex } = payload

            const foundGroupIndex = state.findIndex(
                (group) => group.id === groupIndex
            )
            const group = state[foundGroupIndex]

            if (!group) {
                return state
            }

            const copy = [...state]

            const fieldArrayState = copy[foundGroupIndex].state[fieldName]

            if (
                !Array.isArray(fieldArrayState) ||
                !fieldArrayState[fieldIndex]
            ) {
                return state
            }

            copy[foundGroupIndex].state[fieldName] = fieldArrayState.filter(
                (_, id) => id !== fieldIndex
            )

            return copy
        }
        case 'patch-array': {
            const { fieldName, groupIndex, update } = payload

            const foundGroupIndex = state.findIndex(
                (group) => group.id === groupIndex
            )
            const group = state[foundGroupIndex]

            if (!group) {
                return state
            }

            const fieldArrayState = state[foundGroupIndex].state[
                fieldName
            ] as FieldState[]

            if (!fieldArrayState) {
                return state
            }

            const copy = [...state]

            copy[foundGroupIndex].state[fieldName] = fieldArrayState.map(
                (field, id) => {
                    if (update[id]) {
                        fieldArrayState[id].value = update[id]
                        fieldArrayState[id].errors = validate(
                            update[id],
                            field.config.validators
                        )
                    }

                    return field
                }
            )

            return copy
        }
        case 'set-array': {
            const { fieldName, groupIndex, value } = payload

            const foundGroupIndex = state.findIndex(
                (group) => group.id === groupIndex
            )
            const group = state[foundGroupIndex]

            if (!group) {
                return state
            }

            const copy = [...state]

            copy[foundGroupIndex].state[fieldName] = value.map(createFieldState)

            return copy
        }
        default: {
            return state
        }
    }
}

export const useFieldGroupArray = (groups: FieldGroupConfig[]) => {
    const initialState: FieldGroupState[] = groups.map((group, id) => ({
        id,
        meta: group.meta,
        state: createFieldGroupState(group.fields),
    }))

    const [state, dispatch] = useReducer(fieldGroupArrayReducer, initialState)

    const set = (groups: FieldGroupState[]) => {
        dispatch({
            type: 'set',
            payload: groups,
        })
    }

    const push = (group: FieldGroupConfig) => {
        dispatch({
            type: 'add',
            payload: group,
        })
    }

    const remove = (id: number) => {
        dispatch({
            type: 'delete',
            payload: {
                id,
            },
        })
    }

    const update = (id: number, fieldName: string, value: any) => {
        dispatch({
            type: 'update',
            payload: {
                groupIndex: id,
                value,
                fieldName,
            },
        })
    }

    const patch = (id: number, values: Record<string, any>) => {
        dispatch({
            type: 'patch',
            payload: {
                id,
                values,
            },
        })
    }

    const setGroup = (id: number, config: FieldGroupConfig) => {
        dispatch({
            type: 'set-group',
            payload: {
                id,
                config,
            },
        })
    }

    const pushToArray = (
        id: number,
        fieldName: string,
        config: FieldConfig
    ) => {
        dispatch({
            type: 'push-to-array',
            payload: {
                groupIndex: id,
                fieldName,
                config,
            },
        })
    }

    const updateInArray = (
        id: number,
        fieldName: string,
        fieldIndex: number,
        value: any
    ) => {
        dispatch({
            type: 'update-in-array',
            payload: {
                groupIndex: id,
                fieldName,
                fieldIndex,
                value,
            },
        })
    }

    const removeFromArray = (
        id: number,
        fieldName: string,
        fieldIndex: number
    ) => {
        dispatch({
            type: 'remove-from-array',
            payload: {
                groupIndex: id,
                fieldName,
                fieldIndex,
            },
        })
    }

    const setArray = (id: number, fieldName: string, value: FieldConfig[]) => {
        dispatch({
            type: 'set-array',
            payload: {
                groupIndex: id,
                fieldName,
                value,
            },
        })
    }

    return {
        state,
        set,
        push,
        remove,
        update,
        patch,
        pushToArray,
        updateInArray,
        removeFromArray,
        setArray,
        setGroup,
    }
}

type GroupArray = ReturnType<typeof useFieldGroupArray>

export type FieldArray = {
    id: number
    config: FieldGroupConfig[]
    state: FieldState[]
}

const GroupContext = createContext<GroupArray | null>(null)

export const useGroup = (id: number) => {
    const ctx = useContext(GroupContext)

    if (!ctx) {
        throw new Error('useGroup must be used withing GroupContext')
    }

    const {
        set,
        update,
        patch,
        pushToArray,
        updateInArray,
        removeFromArray,
        setArray,
        setGroup,
    } = ctx

    const group = ctx.state.find((group) => group.id === id)!

    return {
        ...group,
        set,
        update: (fieldName: string, value: any) => {
            update(id, fieldName, value)
        },
        patch: (values: Record<string, any>) => {
            patch(id, values)
        },
        pushToArray: (fieldName: string, config: FieldConfig) => {
            pushToArray(id, fieldName, config)
        },
        updateInArray: (fieldName: string, fieldIndex: number, value: any) => {
            updateInArray(id, fieldName, fieldIndex, value)
        },
        removeFromArray: (fieldName: string, fieldIndex: number) => {
            removeFromArray(id, fieldName, fieldIndex)
        },
        setArray: (fieldName: string, value: FieldConfig[]) => {
            setArray(id, fieldName, value)
        },
        setGroup: (config: FieldGroupConfig) => {
            setGroup(id, config)
        },
    }
}

export const useGroupField = <T extends FieldState | FieldState[] = FieldState>(
    groupId: number,
    fieldName: string
) => {
    const group = useGroup(groupId)

    return {
        value: group.state[fieldName] as T,
        setValue: (value: any) => {
            group.update(fieldName, value)
        },
    }
}

export type UseGroupResult = ReturnType<typeof useGroup>

export const getGroupValue = (
    group: Record<string, FieldState | FieldState[]>
) => {
    const values: any = {}

    for (const key of Object.keys(group)) {
        if (Array.isArray(group[key])) {
            values[key] = group[key].map((field) => safeSerializeValue(field.value))
        } else {
            values[key] = safeSerializeValue(group[key].value)
        }
    }

    return values
}

export const getGroupErrors = (
    group: Record<string, FieldState | FieldState[]>
) => {
    const errors: Record<string, string[] | string[][]> = {}

    for (const key of Object.keys(group)) {
        if (Array.isArray(group[key])) {
            errors[key] = group[key].map((field) => field.errors)
        } else {
            errors[key] = group[key].errors
        }
    }

    return errors as Record<string, string[] | string[][]>
}

export const getGroupStateValue = (
    group: Record<string, FieldState | FieldState[]>
) => {
    return {
        errors: getGroupErrors(group),
        values: getGroupValue(group),
    }
}

export const getGroupArrayState = (groups: FieldGroupState[]) => {
    return groups.map((group) => getGroupStateValue(group.state))
}

export const getGroupArrayValue = (groups: FieldGroupState[]) =>
    groups.map((group) => getGroupValue(group.state))

export const getGroupArrayValid = (groups: FieldGroupState[]) => {
    const groupErrorState = groups.map((group) => getGroupErrors(group.state))

    for (const groupErrors of groupErrorState) {
        for (const errors of Object.values(groupErrors)) {
            for (const error of errors) {
                if (Array.isArray(error) && !!error.length) {
                    return false
                }

                if (typeof error === 'string') {
                    return false
                }
            }
        }
    }

    return true
}

export const useArrayField = (groupId: number, fieldName: string) => {
    const group = useGroup(groupId)
    const fieldState = group.state[fieldName] as FieldState[]

    const push = (fieldConfig: FieldConfig) => {
        group.pushToArray(fieldName, fieldConfig)
    }

    const setValueAt = (index: number, value: any) => {
        group.updateInArray(fieldName, index, value)
    }

    const removeAt = (index: number) => {
        group.removeFromArray(fieldName, index)
    }

    const clear = () => {
        group.setArray(fieldName, [])
    }

    return {
        fields: fieldState,
        setValueAt,
        push,
        removeAt,
        clear,
    }
}

export const useField = <T,>(fieldConfg: FieldConfig) => {
    const { validators } = fieldConfg
    const [{ value, errors }, setState] = useState(createFieldState(fieldConfg))

    const setValue = (value: T) => {
        setState((oldState) => ({
            ...oldState,
            value,
            errors: validate(value, validators),
        }))
    }

    return {
        value,
        errors,
        setValue,
    }
}

export const GroupProvider = ({
    groups,
    children,
}: PropsWithChildren<{ groups: GroupArray }>) => {
    return (
        <GroupContext.Provider value={groups}>{children}</GroupContext.Provider>
    )
}
