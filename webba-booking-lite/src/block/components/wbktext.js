export default function WbkText({ label, value, name, placeholder }) {
    const onChangeText = (newValue) => {}
    return (
        <div className="field-row-w">
            <label className="input-label-wbk service-label-wbk">{label}</label>
            <input
                type="text"
                value={value}
                className="wbk_text"
                name={name}
                placeholder={placeholder}
                onChange={onChangeText}
            />
        </div>
    )
}
