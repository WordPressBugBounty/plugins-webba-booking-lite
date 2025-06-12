<?php
if (!defined('ABSPATH'))
    exit;

class WBK_PE_Time extends WbkData_Custom_Field
{
    public function __construct()
    {
        $this->init('wbk_time');
    }
    public function render_cell($data)
    {
        echo WBK_Renderer::load_template('wbkdata/cell_pe_time', $data);

    }
    public function render_field($data)
    {
        echo WBK_Renderer::load_template('wbkdata/input_pe_time', $data);

    }
    public function validate($input, $value, $slug, $field)
    {
        if (!WbkData\Validator::check_integer($value, 0, 2147483647)) {
            return [false, __('Time entered incorrectly', 'webba-booking-lite'), $field->get_title()];
        }
        return [true, $value];
    }
    public function field_type_to_sql_type($arr_sql_parts, $type, $field)
    {
        if ($type == 'wbk_time') {
            return ['int', 'unsigned NOT NULL', '', '%d'];
        }
        return $arr_sql_parts;
    }
}


?>