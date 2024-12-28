<?php
if (!defined('ABSPATH'))
    exit;
$status = $data[0];
?>
<div class="wbk-outer-container wbk_booking_form_container">
    <div class="wbk-inner-container">
        <div class="wbk-frontend-row">
            <div class="wbk-col-12-12">
                <div class="wbk-details-sub-title">
                    <?php
                    echo esc_html(get_option('wbk_payment_result_title', ''));
                    ?>
                </div>
            </div>
            <div class="wbk-col-12-12">
                <?php
                if ($status == 1) {
                    ?>
                    <div class="input-label-wbk wbk_payment_success">
                        <?php
                        echo esc_html(get_option('wbk_payment_success_message', ''));
                        ?>
                    </div>
                    <?php
                }
                ?>
                <?php
                if ($status == 5) {
                    ?>
                    <div class="input-label-wbk wbk_payment_cancel">
                        <?php
                        echo esc_html(get_option('wbk_payment_cancel_message', ''));
                        ?>
                    </div>
                    <?php
                }
                ?>
                <?php
                if ($status == 2) {
                    ?>
                    <div class="input-label-wbk wbk_payment_error">Error 102</div>
                    <?php
                }
                ?>
                <?php
                if ($status == 3) {
                    ?>
                    <div class="input-label-wbk wbk_payment_error">Error 103</div>
                    <?php
                }
                ?>
                <?php
                if ($status == 4) {
                    ?>
                    <div class="input-label-wbk wbk_payment_error">Error 104</div>
                    <?php
                }
                ?>
            </div>
        </div>
    </div>
</div>