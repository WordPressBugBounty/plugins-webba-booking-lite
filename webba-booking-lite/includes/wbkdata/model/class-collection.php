<?php
namespace WbkData;
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */


if (!defined('ABSPATH')) {
    exit;
}
/**
 * Collection class
 * use this class to collect models, fields and other array elements.
 */
class Collection
{
    /**
     * items.
     *
     * @var string
     */
    protected $class_name;

    /**
     * array of elements in collection.
     *
     * @var array()
     */
    protected $items;

    /**
     * Constructor.
     *
     * @param string $class_name of elements
     */
    public function __construct($class_name)
    {
        $this->class_name = $class_name;
        $this->items = [];
    }

    /**
     * add new element in collection.
     *
     * @param  \WBK_Model $object object to add in collection
     * @param string $slug   the key in array
     */
    public function add($object, $slug)
    {
        if (array_key_exists($slug, $this->items)) {
            return false;
        }
        $this->items[$slug] = $object;
        return $this->items[$slug];
    }

    /**
     * remove element from collection.
     *
     * @param string $slug key of the element to remove
     *
     * @return bool returns true is removed successfully
     */
    public function remove($slug)
    {
        if (isset($this->items[$slug])) {
            return false;
        }
        unset($slug);
        return true;
    }

    /**
     * set the element.
     * @param var $object object to set  in collection
     * @param string $slug the key in array
     */
    public function set($object, $slug)
    {
        if (!is_a($object, $this->class_name)) {
            return false;
        }
        $this->items[$slug] = $object;
    }


    public function get_count()
    {
        return count($this->items);
    }
    public function get_elements()
    {
        return $this->items;
    }
    public function get_element_at($slug)
    {
        if (isset($this->items[$slug])) {
            return $this->items[$slug];
        }
        return false;
    }
}
