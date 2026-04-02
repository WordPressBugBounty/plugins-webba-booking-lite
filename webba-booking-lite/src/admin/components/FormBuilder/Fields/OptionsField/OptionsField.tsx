import { __ } from '@wordpress/i18n'

import { BuilderFieldProps } from '../types'
import { Input } from '../../../Input/Input'
import { Label } from '../../../Label/Label'
import { Button } from '../../../Button/Button'
import CloseIcon from '../../../../../../public/images/close-icon-medium.png'
import styles from './OptionsField.module.css'
import { Validators } from '../../../Form/utils/validation'
import { useArrayField } from '../../hooks/useGroup'

export const OptionsField = ({ group }: BuilderFieldProps) => {
    const options = useArrayField(group.id, 'options')

    return (
        <div className={styles.optionsWrapper}>
            <div>
                <Label>{__('Options', 'webba-booking-lite')}</Label>
            </div>
            <div className={styles.options}>
                {options.fields.length
                    ? options.fields.map((field, index) => {
                          const id = `option-field-${group.id}-${index}`

                          return (
                              <div>
                                  <div>
                                      <Label for={id}>
                                          {__('Option', 'webba-booking-lite')}{' '}
                                          {index + 1}
                                      </Label>
                                  </div>
                                  <div className={styles.optionWrapper}>
                                      <div className={styles.inputWrapper}>
                                          <Input
                                              id={id}
                                              value={field.value}
                                              onChange={(value) => {
                                                  options.setValueAt(
                                                      index,
                                                      value
                                                  )
                                              }}
                                              placeholder={__(
                                                  'Option label',
                                                  'webba-booking-lite'
                                              )}
                                              errors={field.errors}
                                          />
                                      </div>
                                      <button
                                          className={styles.menuBtn}
                                          type="button"
                                          onClick={() =>
                                              options.removeAt(index)
                                          }
                                      >
                                          <img
                                              src={CloseIcon}
                                              className={styles.deleteIcon}
                                          />
                                      </button>
                                  </div>
                              </div>
                          )
                      })
                    : __(
                          'No options added. Press "Add option" button to add an option',
                          'webba-booking-lite'
                      )}
            </div>
            <div>
                <Button
                    onClick={() => {
                        options.push({
                            defaultValue: '',
                            validators: [Validators.required],
                            validateOnInit: true,
                        })
                    }}
                >
                    Add option
                </Button>
            </div>
        </div>
    )
}
