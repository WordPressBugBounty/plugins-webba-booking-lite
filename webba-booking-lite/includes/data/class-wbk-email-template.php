<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class WBK_Email_Template extends WBK_Model_Object{
    public function __construct( $id ) {
        $this->table_name = WBK_Model_Utils::get_db_prefix() . 'wbk_email_templates';
		parent:: __construct( $id );

	}

    function get_template(){
        if( !isset( $this->fields['template'] ) ){
            return '';
        }
        return $this->fields['template'];
    }

}
