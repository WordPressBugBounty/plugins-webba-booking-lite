<?php
if (!defined('ABSPATH')) {
    exit();
}

class WBK_Form extends WBK_Model_Object
{
    public function __construct($id = null)
    {
        $this->table_name = get_option('wbk_db_prefix', '') . 'wbk_forms';
        parent::__construct($id);
    }

    /**
     * Get form name
     * @return string form name
     */
    public function get_name()
    {
        if (!isset($this->fields['name'])) {
            return '';
        }
        return $this->fields['name'];
    }

    /**
     * Get form fields
     * @return array|null form fields array or null if not set
     */
    public function get_fields()
    {
        if (!isset($this->fields['fields'])) {
            return null;
        }
        $fields = $this->fields['fields'];
        if (is_string($fields)) {
            $decoded = json_decode($fields, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $decoded;
            }
        }
        return $fields;
    }

    /**
     * Set form name
     * @param string $name form name
     * @return bool true if set successfully
     */
    public function set_name($name)
    {
        if (!is_string($name)) {
            return false;
        }
        $this->fields['name'] = sanitize_text_field($name);
        return true;
    }

    /**
     * Set form fields
     * @param array $fields form fields array
     * @return bool true if set successfully
     */
    public function set_fields($fields)
    {
        if (!is_array($fields)) {
            return false;
        }
        $this->fields['fields'] = json_encode($fields);
        return true;
    }

    /**
     * Get field by slug
     * @param string $slug field slug to find
     * @return array|null field data or null if not found
     */
    public function get_field_by_slug($slug)
    {
        $fields = $this->get_fields();
        if (!is_array($fields)) {
            return null;
        }
        foreach ($fields as $field) {
            if (isset($field['slug']) && $field['slug'] === $slug) {
                return $field;
            }
        }
        return null;
    }

    /**
     * Check if field exists by slug
     * @param string $slug field slug to check
     * @return bool true if field exists
     */
    public function has_field($slug)
    {
        return $this->get_field_by_slug($slug) !== null;
    }

    /**
     * Get all field slugs
     * @return array array of field slugs
     */
    public function get_field_slugs()
    {
        $fields = $this->get_fields();
        if (!is_array($fields)) {
            return [];
        }
        $slugs = [];
        foreach ($fields as $field) {
            if (isset($field['slug'])) {
                $slugs[] = $field['slug'];
            }
        }
        return $slugs;
    }

    /**
     * Add a new field
     * @param array $field field data to add
     * @return bool true if added successfully
     */
    public function add_field($field)
    {
        if (!is_array($field) || !isset($field['slug'])) {
            return false;
        }
        $fields = $this->get_fields();
        if (!is_array($fields)) {
            $fields = [];
        }
        // Don't add if slug already exists
        foreach ($fields as $existing_field) {
            if (isset($existing_field['slug']) && $existing_field['slug'] === $field['slug']) {
                return false;
            }
        }
        $fields[] = $field;
        return $this->set_fields($fields);
    }

    /**
     * Update an existing field
     * @param string $slug slug of field to update
     * @param array $new_data new field data
     * @return bool true if updated successfully
     */
    public function update_field($slug, $new_data)
    {
        if (!is_array($new_data)) {
            return false;
        }
        $fields = $this->get_fields();
        if (!is_array($fields)) {
            return false;
        }
        foreach ($fields as $key => $field) {
            if (isset($field['slug']) && $field['slug'] === $slug) {
                $fields[$key] = array_merge($field, $new_data);
                return $this->set_fields($fields);
            }
        }
        return false;
    }

    /**
     * Remove a field by slug
     * @param string $slug slug of field to remove
     * @return bool true if removed successfully
     */
    public function remove_field($slug)
    {
        $fields = $this->get_fields();
        if (!is_array($fields)) {
            return false;
        }
        foreach ($fields as $key => $field) {
            if (isset($field['slug']) && $field['slug'] === $slug) {
                unset($fields[$key]);
                $fields = array_values($fields); // Reindex array
                return $this->set_fields($fields);
            }
        }
        return false;
    }
} 