import { FormField } from './types'

interface Props<T> {
    entry: T
    fields: FormField[]
    onSubmit: (entry: T) => void
}

export const Form = function <T>({ entry, fields, onSubmit }: Props<T>) {
    return (
        <form>
            {fields.map((field) => {
                return (
                    <div>
                        <div>
                            <div>
                                <label htmlFor={field.name}>
                                    {field.label}
                                </label>
                            </div>
                            <div>
                                <input type={field.type} name={field.name} />
                            </div>
                        </div>
                    </div>
                )
            })}
            <pre>{JSON.stringify(entry, null, 2)}</pre>
        </form>
    )
}
