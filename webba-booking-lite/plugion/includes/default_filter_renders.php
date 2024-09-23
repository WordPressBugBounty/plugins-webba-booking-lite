<?php
if (!defined('ABSPATH'))
    exit;
/*
 * This file is part of Webba Booking plugin
 */

// text filter
add_action('plugion_filter_text', 'plugion_filter_text_render');
function plugion_filter_text_render($data)
{
    Plugion()->renderer->render_filter($data);
}

// date filter
add_action('plugion_filter_date', 'plugion_filter_date_render');
function plugion_filter_date_render($data)
{
    Plugion()->renderer->render_filter($data);
}

// multi-select filter
add_action('plugion_filter_multi_select', 'plugion_filter_multi_select_render');
function plugion_filter_multi_select_render($data)
{
    Plugion()->renderer->render_filter($data);
}

// single-select filter
add_action('plugion_filter_select', 'plugion_filter_select_render');
function plugion_filter_select_render($data)
{
    Plugion()->renderer->render_filter($data);
}
?>