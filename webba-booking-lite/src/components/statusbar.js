export default function StatusBar({ steps }) {
    return (
        <ul className="appointment-status-list-w">
            {steps.map((step, index) => (
                <li data-slug="services" className="active-w" key={index}>
                    <div className="circle__box-w">
                        <div className="circle__wrapper-w circle__wrapper--right-w">
                            <div className="circle__whole-w circle__right-w"></div>
                        </div>
                        <div className="circle__wrapper-w circle__wrapper--left-w">
                            <div className="circle__whole-w circle__left-w"></div>
                        </div>
                        <div className="circle-digit-w">{index + 1}</div>
                    </div>
                    <div className="text-w">
                        <div className="text-title-w">{step}</div>
                    </div>
                </li>
            ))}
        </ul>
    )
}
