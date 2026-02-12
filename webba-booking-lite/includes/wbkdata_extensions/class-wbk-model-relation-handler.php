<?php
defined('ABSPATH') or exit;

/**
 * Class WBK_Model_Relation_Destroyer
 * Eliminate relations when an item is deleted
 *
 * @package WebbaBooking
 */
class WBK_Model_Relation_Destroyer
{
    /**
     * Hook actions
     */
    public function __construct()
    {
        add_action('wbkdata_on_after_item_deleted', [$this, 'remove_relations'], 10, 3);
        add_action('wbkdata_on_after_item_updated', [$this, 'sync_connections'], 10, 3);
        add_action('wbkdata_on_after_item_added', [$this, 'sync_connections'], 10, 3);
        // two way sync for form fields translations
        // add_action('wbk_options_saved', [$this, 'sync_form_fields'], 10, 2);
        // add_action('wbkdata_on_after_item_updated', [$this, 'sync_form_options'], 10, 3);
        // add_action('wbkdata_on_after_item_added', [$this, 'sync_form_options'], 10, 3);
    }

    /**
     * Sync form fields translations when saved from options
     *
     * @param string $section
     * @param array $options
     * @return void
     */
    public function sync_form_fields(string $section, array $options): void
    {
        if ($section !== 'wbk_translation_settings_section') {
            return;
        }

        if (!is_array($options)) {
            return;
        }

        $forms = WBK_Model_Utils::get_forms();
        foreach ($forms as $form_id => $form_name) {
            $form             = new WBK_Form($form_id);
            $form_fields      = $form->get_fields();
            $fields_to_update = [];

            // run through all fields to find and update placeholder/checkboxtext if that is found in option
            foreach ($form_fields as $field) {
                if (isset($field['slug'])) {
                    $option_name = 'webba_form_field_' . $field['slug'];
                    if (isset($options[$option_name]) && $field['type'] !== 'checkbox') {
                        $field['placeholder'] = $options[$option_name];
                    } else if (isset($options[$option_name]) && $field['type'] === 'checkbox') {
                        $field['checkboxText'] = $options[$option_name];
                    }
                }

                $fields_to_update[] = $field;
            }

            $form->set_fields($fields_to_update);
            $form->save();
        }
    }

    /**
     * Sync form translations options when forms is saved
     *
     * @param string $model_name
     * @param string $model_name_not_filtered
     * @param [type] $item
     * @return void
     */
    public function sync_form_options(string $model_name, string $model_name_not_filtered, $item): void
    {
        $model_name = $this->extract_model_name($model_name);

        if ($model_name !== 'forms') {
            return;
        }

        if(!is_object($item)) {
            $item = WbkData()->models->get_element_at($model_name_not_filtered)->get_item($item);
        }

        if(!$item) {
            return;
        }
        
        $form = new WBK_Form($item->id);
        $form_fields = $form->get_fields();
        foreach ($form_fields as $field) {
            if (isset($field['slug'])) {
                $option_name = 'webba_form_field_' . $field['slug'];
                
                if(isset($field['slug']) && $field['type'] !== 'checkbox') {
                    update_option($option_name, $field['placeholder']);
                } else if(isset($field['slug']) && $field['type'] === 'checkbox') {
                    update_option($option_name, $field['checkboxText']);
                }
            }
        }
    }

    /**
     * Remove relations by model
     *
     * @param string $model_name
     * @param string $model_name_not_filtered
     * @param object $item
     * @return void
     */
    public function remove_relations(string $model_name, string $model_name_not_filtered, object $item): void
    {
        $model_name = $this->extract_model_name($model_name);

        switch ($model_name) {
            case 'services':
                $this->cleanup_connected_fields('service_categories', 'list', $item->id, true);
                break;
            case 'service_categories':
                break;
            case 'pricing_rules':
                $this->cleanup_connected_fields('services', 'pricing_rules', $item->id, true);
                break;
            case 'coupons':
                $this->cleanup_connected_fields('appointments', 'coupon', $item->id);
                break;
            case 'gg_calendars':
                $this->cleanup_connected_fields('services', 'gg_calendars', $item->id, true);
                break;
            case 'email_templates':
                $this->cleanup_connected_fields('services', 'notification_template', $item->id);
                $this->cleanup_connected_fields('services', 'reminder_template', $item->id);
                $this->cleanup_connected_fields('services', 'invoice_template', $item->id);
                $this->cleanup_connected_fields('services', 'booking_changed_template', $item->id);
                $this->cleanup_connected_fields('services', 'arrived_template', $item->id);
                break;
            default: break;
        }
    }

    /**
     * Cleanup connected fields
     *
     * @param string $model
     * @param string $column_to_destroy
     * @param string|integer $id
     * @param boolean $multi_values
     * @return void
     */
    protected function cleanup_connected_fields(string $model, string $column_to_destroy, $id, bool $multi_values = false): void
    {
        global $wpdb;

        $table_name = $this->get_table_name($model);

        $items = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id, {$column_to_destroy} FROM {$table_name}",
                $id
            ),
            ARRAY_A
        );

        if (!$items) {
            return;
        }

        foreach ($items as $item) {
            if (empty($item[$column_to_destroy])) {
                continue;
            }

            // applicable for JSON encoded data
            if ($multi_values) {
                $ids = json_decode($item[$column_to_destroy], true);

                if (!empty($ids) && in_array($id, $ids)) {
                    $updated_ids = [];

                    foreach ($ids as $key => $value) {
                        if ($value != $id) {
                            $updated_ids[] = $value;
                        }
                    }
                    WbkData()->models->get_element_at($table_name)->update_item([$column_to_destroy => json_encode($updated_ids)], $item['id']);
                }

                continue;
            }

            // applicable for single level data
            if ($item[$column_to_destroy] != $id) {
                continue;
            }

            WbkData()->models->get_element_at($table_name)->update_item([$column_to_destroy => ''], $item['id']);
        }
    }

    /**
     * Get table name wrapped with prefix
     *
     * @param string $model
     * @return string
     */
    protected function get_table_name(string $model): string
    {
        global $wpdb;

        return get_option('wbk_db_prefix', 'wp_') . 'wbk_' . $model;
    }

    /**
     * Extract model name from table name
     *
     * @param string $model
     * @return string
     */
    protected function extract_model_name(string $model): string
    {
        $prefix = get_option('wbk_db_prefix', 'wp_') . 'wbk_';

        return str_replace($prefix, '', $model);
    }

    /**
     * Sync connections
     *
     * @param string $model_name
     * @param string $model_name_not_filtered
     * @param int | string $item
     * @return void
     */
    public function sync_connections(string $model_name, string $model_name_not_filtered, $item): void
    {
        $model_name = $this->extract_model_name($model_name);
        if (!is_object($item)) {
            $item = WbkData()->models->get_element_at($model_name_not_filtered)->get_item($item);
        }

        if (!$item) {
            return;
        }

        switch ($model_name) {
            case 'services':
                $this->sync_array_columns('service_categories', 'list', $item->categories, $item->id);

                break;
            case 'service_categories':

                $this->sync_array_columns('services', 'categories', $item->list, $item->id);
                break;
            default: break;
        }
    }

    /**
     * Sync array columns
     *
     * @param string $model
     * @param string $column
     * @param string | array | null $values_to_embed
     * @param int $child_id
     * @return void
     */
    public function sync_array_columns(string $model, string $column, $values_to_embed, int $child_id): void
    {
        global $wpdb;

        $table_name = $this->get_table_name($model);

        // Always decode as associative array, then cast to array of values.
        $values_to_embed = is_string($values_to_embed) ? json_decode($values_to_embed, true) : $values_to_embed;

        // Coerce any object-like structure to array values (["1","16"] form)
        if (is_array($values_to_embed)) {
            // If associative (object), cast keys to values
            if (count($values_to_embed) && array_keys($values_to_embed) !== range(0, count($values_to_embed) - 1)) {
                $values_to_embed = array_values($values_to_embed);
            }
        } else {
            $values_to_embed = [];
        }

        $parent_rows = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id, {$column} FROM {$table_name}"
            ),
            ARRAY_A
        );

        foreach ($parent_rows as $parent_row) {
            // Always decode as associative, then ensure array of values
            $current_parent_value = is_string($parent_row[$column]) ? json_decode($parent_row[$column], true) : $parent_row[$column];

            if (is_array($current_parent_value)) {
                // If associative (object), convert to indexed (array)
                if (count($current_parent_value) && array_keys($current_parent_value) !== range(0, count($current_parent_value) - 1)) {
                    $current_parent_value = array_values($current_parent_value);
                }
            } else {
                $current_parent_value = [];
            }

            if (!in_array($child_id, $current_parent_value) && in_array($parent_row['id'], $values_to_embed)) {
                // add
                $current_parent_value[] = "$child_id";
                // Remove potential duplicates
                $current_parent_value = array_values(array_unique($current_parent_value));
            } elseif (in_array($child_id, $current_parent_value) && !in_array($parent_row['id'], $values_to_embed)) {
                // remove
                $current_parent_value = array_values(array_diff($current_parent_value, [$child_id]));
            } else {
                // no change
                continue;
            }

            // Save as array, so always JSON array
            $wpdb->update(
                $table_name,
                [$column => json_encode(array_values($current_parent_value))],
                ['id' => $parent_row['id']],
                ['%s'],
                ['%d']
            );
        }
    }
}
