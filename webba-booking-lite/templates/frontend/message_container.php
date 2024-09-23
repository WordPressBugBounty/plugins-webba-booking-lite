<?php
if ( !defined( 'ABSPATH' ) ) exit;
$message = $data[0];

?>
<div class="wbk-outer-container wbk_booking_form_container">
    <div class="wbk-inner-container">
        <div class="wbk-frontend-row">
            <div class="wbk-col-12-12">
                <div class="wbk-input-label">
                    <?php
                        echo esc_html( $message );
                    ?>
                </div>
            </div>
        </div>
    </div>
</div>
