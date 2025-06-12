import '../assets/frontend.scss'

const App = () => {
    return (
        <div className="main-block-w">
            {data.services ? (
                <div
                    className={
                        data.settings.narrow_form
                            ? 'appointment-box-w wbk_narrow_form'
                            : 'appointment-box-w'
                    }
                >
                    <div
                        className="appointment-status-wrapper-w"
                        style={{ background: data.appearance[0] }}
                    >
                        <>
                            <StatusBar steps={steps} />
                            <div className="circle-chart-wb">
                                <span
                                    style={{
                                        background: data.appearance[0],
                                    }}
                                    className="circle-chart-text-wb"
                                >
                                    1{' '}
                                    {__('of', 'webba-booking-lite') +
                                        ' ' +
                                        steps.length}
                                </span>
                            </div>
                            <div className="appointment-status-text-mobile-w">
                                <p className="current-step-w">Services</p>
                                <p className="next-step-w">
                                    Next
                                    <span className="btn-ring-wb"></span>: Date
                                    and time
                                </p>
                            </div>
                        </>
                    </div>

                    <div className="appointment-content-w">
                        <div className="appointment-content-scroll-w">
                            {data.services &&
                                (is_single_service ? (
                                    <>
                                        <WbkText
                                            value=""
                                            name={'date'}
                                            placeholder={
                                                data.settings.date_placeholder
                                            }
                                            label={data.settings.date_label}
                                        />
                                    </>
                                ) : (
                                    <>
                                        {attributes.showCategoryList && (
                                            <WbkSelect
                                                options={data.categories}
                                                label={
                                                    data.settings.category_label
                                                }
                                            />
                                        )}
                                        <label className="wbk-input-label wbk_service_label">
                                            {data.settings.service_label}
                                        </label>
                                        <ul className="wbk_v5_service_list">
                                            {filtered_services.map(
                                                (value, index) => (
                                                    <ServiceBlock
                                                        data={value}
                                                        selected={
                                                            selectedServices
                                                        }
                                                        onChange={
                                                            handleServiceSelect
                                                        }
                                                        type={
                                                            attributes.multipleServices
                                                        }
                                                        environment={data}
                                                        key={index}
                                                    />
                                                )
                                            )}
                                        </ul>
                                    </>
                                ))}{' '}
                        </div>
                        <div className="button-block-w two-buttons-w">
                            <button
                                type="button"
                                className="button-w button-prev-w"
                                style={{
                                    background: data.appearance[1],
                                }}
                            >
                                {__('Back', 'webba-booking-lite')}
                            </button>
                            <div className="button_container_wbk">
                                <button
                                    className="button-w button-next-w"
                                    style={{
                                        background: data.appearance[1],
                                    }}
                                >
                                    {__('Next', 'webba-booking-lite')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="appointment-box-w loading_holder_w">
                    <Skeleton count={5} height={30} />
                </div>
            )}
        </div>
    )
}

export default App
