<?php
if (!defined('ABSPATH'))
    exit;

class WbkData_Custom_Field
{
    protected $type;

    public function init($type)
    {
        add_action('wbkdata_table_cell_' . $type, array($this, 'render_cell'));
        add_action('wbkdata_property_field_' . $type, array($this, 'render_field'));
        add_filter('wbkdata_property_field_validation_' . $type, array($this, 'validate'), 10, 4);
        add_filter('wbkdata_type_to_sql_type', array($this, 'field_type_to_sql_type'), 10, 3);

    }
    public function render_cell($data)
    {

    }
    public function render_field($data)
    {

    }
    public function validate($input, $value, $type, $field)
    {

    }
    public function field_type_to_sql_type($arr_sql_parts, $type, $field)
    {

    }

}



?>