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
            default:break;
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
}
