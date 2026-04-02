export interface FormModel {
    id: string
    name: string
}

export enum FieldType {
    Text = 'text',
    Email = 'email',
    Textarea = 'textarea',
    Number = 'number',
    Phone = 'phone',
    Description = 'description',
    Dropdown = 'dropdown',
    Radio = 'radio',
    Checkbox = 'checkbox',
    File = 'file',
}
