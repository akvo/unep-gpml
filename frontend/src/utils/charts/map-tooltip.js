import Chart from './'

const mapToolTip = (formatter) => ({
    show: true,
    trigger: 'item',
    showDelay: 0,
    transitionDuration: 0.2,
    formatter: formatter,
    backgroundColor: "#ffffff",
    ...Chart.Style.Text,
})

export default mapToolTip;
