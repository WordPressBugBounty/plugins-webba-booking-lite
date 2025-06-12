<?php

if ( !defined( 'ABSPATH' ) ) {
    exit;
}
$pro_version = false;
$table = $data['table'];
$filters = $data['filters'] ?? [];
$approved = 0;
$pending = 0;
$approved_balance = 0;
$pending_balance = 0;
$approved_text = esc_html__( 'Approved Bookings', 'webba-booking-lite' );
$pending_text = esc_html__( 'Pending Bookings', 'webba-booking-lite' );
$slots_text = esc_html__( 'Of slots are booked', 'webba-booking-lite' );
$approved_ids = [];
$pending_ids = [];
$labels = [];
$total_data = [];
$pending_data = [];
$approved_data = [];
$prev_time_zone = date_default_timezone_get();
date_default_timezone_set( get_option( 'wbk_timezone' ) );
if ( empty( $filters ) ) {
    $start = strtotime( 'today midnight' ) - 86400 * 31;
    $end = strtotime( 'today midnight' ) - 86400;
} else {
    $start = strtotime( $filters[0]['value'] );
    $end = strtotime( $filters[1]['value'] );
}
date_default_timezone_set( $prev_time_zone );
$approved_search = 'approved,paid_approved,arrived,added_by_admin_paid';
$pending_search = 'pending,paid,woocommerce,added_by_admin_not_paid';
$approved_search_arr = explode( ',', $approved_search );
$pending_search_arr = explode( ',', $pending_search );
$num = 100;
$slots_percent = round( ($approved + $pending) * 100 ) / $num;
$approved = 0;
$pending = 0;
if ( $end > $start ) {
    while ( $start <= $end ) {
        $prev_time_zone = date_default_timezone_get();
        date_default_timezone_set( get_option( 'wbk_timezone' ) );
        $g_date = date( 'Y-m-d', $start );
        date_default_timezone_set( $prev_time_zone );
        $labels[] = $g_date;
        $bookings_on_date = WBK_Model_Utils::get_booking_ids_by_day( $start );
        $total_data[] = count( $bookings_on_date );
        $this_day_approved_ballance = 0;
        $this_day_pending_ballance = 0;
        foreach ( $bookings_on_date as $booking_id ) {
            $booking = new WBK_Booking($booking_id);
            if ( !$booking->is_loaded() ) {
                return;
            }
            $price = intval( $booking->get_price() ) * intval( $booking->get_quantity() );
            if ( in_array( $booking->get_status(), $approved_search_arr ) ) {
                $this_day_approved_ballance += $price;
                $approved_balance += $price;
                $approved++;
            } else {
                $this_day_pending_ballance += $price;
                $pending_balance += $price;
                $pending++;
            }
        }
        $approved_data[] = $this_day_approved_ballance;
        $pending_data[] = $this_day_pending_ballance;
        $start = strtotime( '+1 days', $start );
    }
}
$graph_options = [];
if ( !empty( $labels ) ) {
    $graph_options = [
        'labels'   => $labels,
        'datasets' => [[
            'label'       => esc_html__( 'No. of bookings', 'webba-booking-lite' ),
            'data'        => $total_data,
            'borderWidth' => 1,
            'yAxisID'     => 'y',
        ], [
            'label'       => esc_html__( 'Revenue (approved)', 'webba-booking-lite' ),
            'data'        => $approved_data,
            'borderWidth' => 1,
            'yAxisID'     => 'yRevenu',
        ], [
            'label'       => esc_html__( 'Revenue (pending)', 'webba-booking-lite' ),
            'data'        => $pending_data,
            'borderWidth' => 1,
            'yAxisID'     => 'yRevenu',
        ]],
    ];
}
?>
<ul class="dashboard-data-wb">
    <?php 
if ( $pro_version ) {
    ?>
        <li>
            <div class="data-icon-wrapper-wb">
                <span class="data-icon-wb">
                    <img src="<?php 
    echo WP_WEBBA_BOOKING__PLUGIN_URL;
    ?>/public/images/data-money-icon.png" alt="money">
                </span><!-- /.data-icon-wb -->
            </div><!-- /.data-icon-wrapper-wb -->
            <div class="data-content-wb">
                <div class="digit-wb"><?php 
    echo WBK_Format_Utils::format_price( $approved_balance + $pending_balance );
    ?></div>
                <div class="description-wb">
                    <div class="description-inner-wb">
                        <span class="approved-wb"><?php 
    printf( '%s %s', WBK_Format_Utils::format_price( $approved_balance ), esc_html__( 'approved', 'webba-booking-lite' ) );
    ?> </span>
                        <span class="separator-wb">|</span>
                        <span class="pending-wb"><?php 
    printf( '%s %s', WBK_Format_Utils::format_price( $pending_balance ), esc_html__( 'pending', 'webba-booking-lite' ) );
    ?></span>
                    </div><!-- /.description-wb -->
                </div><!-- /.description-wb -->
            </div><!-- /.data-content-wb -->
        </li>
    <?php 
}
?>
    <li>
        <div class="data-icon-wrapper-wb">
            <span class="data-icon-wb">
                <img src="<?php 
echo WP_WEBBA_BOOKING__PLUGIN_URL;
?>/public/images/data-approved-bookings-icon.png"
                    alt="money">
            </span><!-- /.data-icon-wb -->
        </div><!-- /.data-icon-wrapper-wb -->
        <div class="data-content-wb">
            <div class="digit-wb"><?php 
echo $approved;
?></div>
            <div class="description-wb">
                <div class="description-inner-wb">
                    <?php 
echo $approved_text;
?>
                    <div class="help-popover-wb" data-js="help-popover-wb">
                        <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                        <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php 
echo $approved_text;
?>
                        </div>
                    </div><!-- /.help-popover-wb -->
                </div><!-- /.description-inner-wb -->
            </div><!-- /.description-wb -->
        </div><!-- /.data-content-wb -->
    </li>
    <li>
        <div class="data-icon-wrapper-wb">
            <span class="data-icon-wb">
                <img src="<?php 
echo WP_WEBBA_BOOKING__PLUGIN_URL;
?>/public/images/data-pending-bookings-icon.png"
                    alt="money">
            </span><!-- /.data-icon-wb -->
        </div><!-- /.data-icon-wrapper-wb -->
        <div class="data-content-wb">
            <div class="digit-wb"><?php 
echo $pending;
?></div>
            <div class="description-wb">
                <div class="description-inner-wb">
                    <?php 
echo $pending_text;
?>
                    <div class="help-popover-wb" data-js="help-popover-wb">
                        <span class="help-icon-wb" data-js="help-icon-wb">?</span>
                        <div class="help-popover-box-wb" data-js="help-popover-box-wb"><?php 
echo $pending_text;
?>
                        </div>
                    </div><!-- /.help-popover-wb -->
                </div><!-- /.description-inner-wb -->
            </div><!-- /.description-wb -->
        </div><!-- /.data-content-wb -->
    </li>

</ul><!-- /.dashboard-data-wb -->
<?php 
if ( $pro_version ) {
    ?>
    <script type="text/javascript">
        (function () {
            window.wbk_dashboard_options = JSON.parse('<?php 
    echo json_encode( $graph_options );
    ?>');
            })();
        </script>

<?php 
}