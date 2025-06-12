<?php
namespace WbkData;
if (!defined('ABSPATH'))
    exit;

/**
 * Row object class
 * Use this class to read and write single row objects
 * Inherit from your class
 */
class Row_Object
{

    /**
     * name of the table in the db that stores the object of current sqlite_fetch_column_types
     * @var string
     */
    protected $table_name;

    /**
     * fields loaded from the database
     * @var array
     */
    protected $fields;

    /**
     * id of the record in the db
     * @var integer
     */
    protected $id;

    public function __construct($input = null)
    {
        global $wpdb;
        if (!is_null($input) && is_numeric($input)) {
            $this->id = $input;
            $this->fields = $wpdb->get_row($wpdb->prepare(" SELECT * FROM " . $this->table_name . " WHERE id = %d", $input), ARRAY_A);
        }
        if (is_array($input)) {
            $fields = WbkData()->models->get_element_at($this->table_name)->fields->get_elements();
            foreach ($fields as $field) {
                if (isset($input[$field->get_name()])) {
                    $this->fields[$field->get_name()] = $input[$field->get_name()];
                }
            }
        }
    }

    /**
     * get field value
     * @param string $field_name the name of the field to get
     * @return mixed value of the field
     */
    public function get($field_name)
    {
        if (isset($this->fields[$field_name])) {
            return $this->fields[$field_name];
        }
        return false;
    }

    /**
     * set field value
     * @param string $field_name field name
     * @param mixed $value value to be set
     */
    public function set($field_name, $value)
    {
        $this->fields[$field_name] = $value;
        return;
    }


    /**
     * Get the value of object name
     *
     * @return string
     */
    public function get_name()
    {
        if (isset($this->fields['name'])) {
            return $this->fields['name'];
        }
        return '';
    }

    /**
     * Set the value of object name
     *
     * @param string $name
     *
     * @return self
     */
    public function set_name($name)
    {
        $this->fields['name'] = $name;
        return $this;
    }

    /**
     * Get the value of name of the table in the db that stores the object of current sqlite_fetch_column_types
     *
     * @return string
     */
    public function get_table_name()
    {
        return $this->table_name;
    }

    /**
     * Set the value of name of the table in the db that stores the object of current sqlite_fetch_column_types
     *
     * @param string $table_name
     *
     * @return self
     */
    public function set_table_name($table_name)
    {
        $this->table_name = $table_name;

        return $this;
    }

    /**
     * Get the value of fields loaded from the database
     *
     * @return array
     */
    public function get_fields()
    {
        return $this->fields;
    }

    /**
     * Set the value of fields loaded from the database
     *
     * @param array $fields
     *
     * @return self
     */
    public function set_fields(array $fields)
    {
        $this->fields = $fields;

        return $this;
    }

    /**
     * get object id
     * @return int id
     */
    public function get_id()
    {
        return $this->fields['id'];
    }

    /**
     * check if object loaded properly
     * @return bool
     */
    public function is_loaded()
    {
        if (!isset($this->fields['name'])) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * Insert new record or update current
     * @return mixed status information with details
     */
    public function save()
    {
        global $wpdb;

        $fields = WbkData()->models->get_element_at($this->table_name)->fields->get_elements();
        $values = array();
        $formats = array();
        foreach ($fields as $field) {
            if (isset($this->fields[$field->get_name()])) {
                $values[$field->get_name()] = $this->fields[$field->get_name()];
                $formats[] = $field->field_type_to_sql_type(true);
            }
        }
        if (is_numeric($this->id)) {
            return $wpdb->update($this->table_name, $values, array('id' => $this->id), $formats, array('%d'));
        } else {
            $wpdb->insert($this->table_name, $values, $formats);
            return $wpdb->insert_id;
        }
    }

}
