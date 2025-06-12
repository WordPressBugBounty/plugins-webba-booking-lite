<?php
if (!defined('ABSPATH'))
    exit;

class WBK_PE_Business_Hours extends WbkData_Custom_Field
{
    public function __construct()
    {
        $this->init('wbk_business_hours');
    }
    public function render_cell($data)
    {
        echo WBK_Renderer::load_template('wbkdata/cell_pe_business_hours', $data);

    }
    public function render_field($data)
    {
        echo WBK_Renderer::load_template('wbkdata/input_pe_business_hours', $data);

    }
    public function validate($input, $value, $slug, $field)
    {

        return [true, json_encode($value)];
    }
    public function field_type_to_sql_type($arr_sql_parts, $type, $field)
    {
        if ($type == 'wbk_business_hours') {
            return ['TEXT', 65535, '', '%s'];
        }
        return $arr_sql_parts;
    }
}


?>