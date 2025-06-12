<?php
if (!defined('ABSPATH'))
    exit;
?>

<div class="appointment-box-wbk" data-step="2">
    <div class="appointment-status-wrapper-w">
        <ul class="appointment-status-list-w">
            <li data-slug="services" class="completed-w">
                <div class="circle__box-w">
                    <div class="circle__wrapper-w circle__wrapper--right-w">
                        <div class="circle__whole-w circle__right-w"></div>
                    </div>
                    <div class="circle__wrapper-w circle__wrapper--left-w">
                        <div class="circle__whole-w circle__left-w"></div>
                    </div>
                    <div class="circle-digit-w"> 1</div>
                </div>
                <div class="text-w">
                    <div class="text-title-w">Service</div>
                    <ul class="subtitle-list-w" style="">
                        <li>Free service</li>
                    </ul>
                </div>
            </li>
            <li data-slug="date_time" class="active-w">
                <div class="circle__box-w">
                    <div class="circle__wrapper-w circle__wrapper--right-w">
                        <div class="circle__whole-w circle__right-w"></div>
                    </div>
                    <div class="circle__wrapper-w circle__wrapper--left-w">
                        <div class="circle__whole-w circle__left-w"></div>
                    </div>
                    <div class="circle-digit-w"> 2</div>
                </div>
                <div class="text-w">
                    <div class="text-title-w">Date and time</div>
                </div>
            </li>
            <li data-slug="form">
                <div class="circle__box-w">
                    <div class="circle__wrapper-w circle__wrapper--right-w">
                        <div class="circle__whole-w circle__right-w"></div>
                    </div>
                    <div class="circle__wrapper-w circle__wrapper--left-w">
                        <div class="circle__whole-w circle__left-w"></div>
                    </div>
                    <div class="circle-digit-w"> 3</div>
                </div>
                <div class="text-w">
                    <div class="text-title-w">Details</div>
                </div>
            </li>
        </ul>
        <div class="circle-chart-wbk" data-percent="25"><span class="circle-chart-text-wbk">2 of 3</span><canvas
                height="110" width="110"></canvas></div>
        <div class="appointment-status-text-mobile-wbk">
            <p class="current-step-wbk">Date and time</p>
            <p class="next-step-wbk">Next<span class="btn-ring-wbk" style="opacity: 1;"></span>: Details</p>
        </div>
    </div>
    <div class="appointment-content-wbk">
        <form>
            <div class="appointment-content-scroll-wbk" data-scrollbar="true" tabindex="-1"
                style="outline: none; overflow: hidden;">
                <div class="scroll-content" style="transform: translate3d(0px, -19px, 0px);">
                    <div class="appointment-content-screen-w" data-slug="services" data-title="Service" data-request=""
                        style="display: none;">
                        <div class="field-row-w wbk_services_row_container ">
                            <label class="input-label-wbk">Select a service</label>
                            <div class="custom-select-w">
                                <select class="wbk-select wbk-input wbk_services linear-animation-w" name="service"
                                    data-validation="positive" data-validationmsg="Please, select a service."
                                    style="display: none;">
                                    <option value="0" data-payable="false" selected="selected">select...</option>
                                    <option data-desc="<p>002,SYD,WLG,7:15,28</p>" data-payable="true" value="80"
                                        data-multi-low-limit="" data-multi-limit="">Flight 002 - Sydney to Wellington
                                    </option>
                                    <option data-desc="" data-payable="false" value="177" data-multi-low-limit=""
                                        data-multi-limit="">Free service</option>
                                    <option data-desc="" data-payable="false" value="182" data-multi-low-limit=""
                                        data-multi-limit="">Group service</option>
                                    <option data-desc="" data-payable="true" value="185" data-multi-low-limit=""
                                        data-multi-limit="">Group service paid</option>
                                    <option data-desc="" data-payable="false" value="183" data-multi-low-limit=""
                                        data-multi-limit="">Lori 2</option>
                                    <option data-desc="" data-payable="true" value="184" data-multi-low-limit=""
                                        data-multi-limit="">Paid service</option>
                                    <option data-desc="" data-payable="false" value="181" data-multi-low-limit=""
                                        data-multi-limit="">Small step</option>
                                </select>
                                <div class="nice-select wbk-select wbk-input wbk_services linear-animation-w"
                                    tabindex="0"><span class="current">Free service</span>
                                    <ul class="list">
                                        <li data-value="0" class="option">select...</li>
                                        <li data-value="80" class="option">Flight 002 - Sydney to Wellington</li>
                                        <li data-value="177" class="option selected">Free service</li>
                                        <li data-value="182" class="option">Group service</li>
                                        <li data-value="185" class="option">Group service paid</li>
                                        <li data-value="183" class="option">Lori 2</li>
                                        <li data-value="184" class="option">Paid service</li>
                                        <li data-value="181" class="option">Small step</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="wbk_description_holder">
                            <label class="input-label-wbk">
                            </label>
                        </div>
                    </div>
                    <div class="appointment-content-screen-w appointment-content-screen-active-w" data-slug="date_time"
                        data-title="Date and time" data-request="wbk_prepare_service_data" style="">
                        <label
                            class="checkbox-row-w one-row-w mb-30-w mt-30-w wbk_hidden wbl_local_time_switcher wbk_local_time_switcher">
                            <span class="checkbox-custom-w">
                                <input type="checkbox" class="wbk_local_time_checkbox" value="true"
                                    name="local_time_switcher">
                                <span class="checkmark-w"></span>
                            </span>
                            <span class="checkbox-text-w">
                                <span class="checkbox-title-w">Your local time</span>
                            </span>
                        </label>
                        <select multiple="" class="wbk-input wbk_times wbk_hidden linear-animation-w"
                            data-validation="must_have_items" data-validationmsg="Please, select timeslot(s)"
                            style="display:block" name="time[]">
                            <option data-time_string_local="August 24, 2023 11:00 am"
                                data-time_string="August 24, 2023 11:00 am" data-service="177" value="1692867600">August
                                24, 2023 11:00 am</option>
                        </select>
                        <div class="dynamic-slots-w dynamic-content-w">
                            <ul class="appontment-time-list-w">
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692860400_177" checked>
                                        <span class="radio-time-block-w timeslot-animation-w wb_slot_checked">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="9:00 am"
                                                data-local-time="9:00 am" data-start="1692860400" data-end="1692864000"
                                                data-service="177">9:00 am</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w wb_slot_checked" type="radio"
                                            name="day-1692828000_1692864000_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="10:00 am"
                                                data-local-time="10:00 am" data-start="1692864000" data-end="1692867600"
                                                data-service="177">10:00 am</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w wb_slot_checked" type="radio"
                                            name="day-1692828000_1692867600_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="11:00 am"
                                                data-local-time="11:00 am" data-start="1692867600" data-end="1692871200"
                                                data-service="177">11:00 am</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692871200_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="12:00 pm"
                                                data-local-time="12:00 pm" data-start="1692871200" data-end="1692874800"
                                                data-service="177">12:00 pm</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692874800_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="1:00 pm"
                                                data-local-time="1:00 pm" data-start="1692874800" data-end="1692878400"
                                                data-service="177">1:00 pm</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692878400_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="2:00 pm"
                                                data-local-time="2:00 pm" data-start="1692878400" data-end="1692882000"
                                                data-service="177">2:00 pm</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692882000_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="3:00 pm"
                                                data-local-time="3:00 pm" data-start="1692882000" data-end="1692885600"
                                                data-service="177">3:00 pm</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692885600_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="4:00 pm"
                                                data-local-time="4:00 pm" data-start="1692885600" data-end="1692889200"
                                                data-service="177">4:00 pm</span>
                                        </span>
                                    </label>
                                </li>
                                <li>
                                    <label>
                                        <input class="timeslot_radio-w" type="radio"
                                            name="day-1692828000_1692889200_177">
                                        <span class="radio-time-block-w timeslot-animation-w">
                                            <span class="radio-checkmark"></span>
                                            <span class="time-w" data-server-date="August 24, 2023"
                                                data-local-date="August 24, 2023" data-server-time="5:00 pm"
                                                data-local-time="5:00 pm" data-start="1692889200" data-end="1692892800"
                                                data-service="177">5:00 pm</span>
                                        </span>
                                    </label>
                                </li>
                            </ul>

                        </div>
                    </div>
                    <div class=" appointment-content-screen-w" data-slug="form" data-title="Details"
                        data-request="wbk_render_booking_form">

                    </div>
                    <div class="appointment-content-payment-optional" data-slug="payment_optional" data-title="Payment"
                        data-request="wbk_book">

                    </div>
                    <div class=" appointment-content-screen-w" data-slug="final_screen" data-title=""
                        data-request="wbk_book">

                    </div>


                    <div class="__scrollbar-track __scrollbar-track-x show" style="display: none;">
                        <div class="__scrollbar-thumb __scrollbar-thumb-x"
                            style="width: 480px; transform: translate3d(0px, 0px, 0px);"></div>
                    </div>
                    <div class="__scrollbar-track __scrollbar-track-y show" style="display: none;">
                        <div class="__scrollbar-thumb __scrollbar-thumb-y"
                            style="height: 500px; transform: translate3d(0px, 0px, 0px);"></div>
                    </div>
                </div>
                <div class="__scrollbar-track __scrollbar-track-x show" style="display: none;">
                    <div class="__scrollbar-thumb __scrollbar-thumb-x"
                        style="width: 460px; transform: translate3d(0px, 0px, 0px);"></div>
                </div>
                <div class="__scrollbar-track __scrollbar-track-y show" style="display: block;">
                    <div class="__scrollbar-thumb __scrollbar-thumb-y"
                        style="height: 536.629px; transform: translate3d(0px, 18.3711px, 0px);"></div>
                </div>
            </div><!-- /.appointent-content-scroll-w -->

            <div class="button-block-wbk two-buttons-wbk">
                <button class="button-wbk button-prev-wbk wbk_demo_button">Back</button>
                <button class="button-wbk button-next-wbk wbk_demo_button">Next<span class="btn-ring-wbk"
                        style="opacity: 0;"></span></button>
            </div><!-- /.button-block-wbk -->
            <div class="form-error-w" style="display: none;">
                <img class="warning-img-w"
                    src="http://localhost/wbk4/wp-content/plugins/webba-booking/public/images/error-icon.png"
                    alt="error">
                <span class="form-error-message-w"></span>
            </div>
        </form>
    </div><!-- /.appointment-content-wbk -->

</div>