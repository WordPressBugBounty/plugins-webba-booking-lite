import { __ } from '@wordpress/i18n'
export default function ServiceBlock({
    data,
    selected,
    onChange,
    type,
    environment,
}) {
    return (
        <li
            className={'wbk_service_item timeslot-animation-w'}
            data-servicei_id={data.value}
        >
            <label className="custom-radiobutton-w">
                <span className={'wbk_single_service_title'}>{data.label}</span>
                <img
                    className={'wbk_service_sub_img wbk_service_sub_img_clock'}
                    src={
                        environment.plugin_url + '/public/images/clock_grey.png'
                    }
                    height={20}
                />
                <span className="wbk_single_service_sub_title wbk_single_service_sub_title_minutes">
                    {data.duration}
                </span>
                {data.price && (
                    <>
                        <img
                            className={
                                'wbk_service_sub_img wbk_service_sub_img_clock'
                            }
                            src={
                                environment.plugin_url +
                                '/public/images/money_grey.png'
                            }
                            height={20}
                        />
                        <span className="wbk_single_service_sub_title wbk_single_service_sub_title_money">
                            {data.price}
                        </span>
                    </>
                )}
                <input
                    type="radio"
                    className="wbk_hidden"
                    value={data.value}
                ></input>
                <span
                    className={
                        type
                            ? 'checkmark-w checkmark-multiple-w'
                            : 'checkmark-w'
                    }
                ></span>
                {data.has_description && (
                    <div className="wbk_service_description_switcher_holder">
                        <div className="wbk_service_description_switcher"></div>
                        <span className="wbk_read_more">{__('Read more')}</span>
                    </div>
                )}
            </label>
        </li>
    )
}
