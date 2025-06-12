<?php
namespace WbkData;

if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */

include 'model/class-collection.php';
include 'model/class-row-object.php';
include 'model/class-model.php';
include 'model/class-field.php';
include 'model/class-model-utils.php';


include 'includes/class-controller.php';
include 'includes/default_field_validation.php';
include 'utils/class-validator.php';
include 'utils/class-wbkdata-custom-field.php';
include 'utils/class-wbkdata-translator.php';

final class WbkData
{
    /**
     * collection of models
     * @var Collection
     */
    public $models;

    /**
     * renderer
     * @var Renderer
     */
    public $renderer;
    /**
     * The single instance of the class.
     * @var WbkData
     */
    protected static $inst = null;

    /**
     * controller to handle Ajax requests
     * @var Controller
     */
    protected $controller;

    /**
     * indicatge if assets was loaded
     * @var bool
     */
    protected $assets_initialized;

    /**
     * constructor
     */
    private function __construct()
    {
        $this->models = new Collection('Model');

        $this->controller = new Controller();

        \WbkData_Translator::load_textdomain();
    }

    /**
     * returns instance of WbkData object
     */
    public static function Instance()
    {
        if (is_null(self::$inst)) {
            self::$inst = new self();
        }

        return self::$inst;
    }
    /**
     * render model
     * @param  string $slug slug of the model to render
     * @return null
     */
    public function Model($slug)
    {
        $this->models->get_element_at($slug)->get_rows();
        $this->models->get_element_at($slug)->prepare_properties_form('add');
        $this->models->get_element_at($slug)->prepare_properties_form('update');
        $this->models->get_element_at($slug)->prepare_filter_form();
        $this->renderer->render_model($slug);
    }

    /**
     * set value for the give field of given model
     * IMPORANT: filters are not called before the value is wtitten to database
     * @param string $model model slug
     * @param string $field field slug
     * @param mixed $value [description]
     */
    public function set_value($model, $field, $id, $value)
    {
        global $wpdb;
        $format = WbkData()->models->get_element_at($model)->fields->get_element_at($field)->field_type_to_sql_type(true);
        $field_name = WbkData()->models->get_element_at($model)->fields->get_element_at($field)->get_name();
        $wpdb->query($wpdb->prepare("UPDATE $model SET $field_name = $format WHERE ID=%d", $value, $id));
    }

    /**
     * set value for the give field of given model
     * IMPORANT: filters are not called before the value is wtitten to database
     * @param string $model model slug
     * @param string $field field slug
     */
    public function get_value($model, $field, $id)
    {
        global $wpdb;
        $field_name = WbkData()->models->get_element_at($model)->fields->get_element_at($field)->get_name();
        $value = $wpdb->get_var($wpdb->prepare("SELECT $field_name from $model WHERE ID = %d", $id));
        return $value;

    }

}
