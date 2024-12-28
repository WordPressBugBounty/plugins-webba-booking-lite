declare module '*.module.css' {
    type CSSModule = Record<string, string>
    const styles: CSSModule
    export default styles
}
