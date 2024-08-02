type ChartDataRow = [string, number];

type ChartMultipleSeriesDataRow = {
    name: string;
    data: ChartDataRow[];
    color?: string;
};

type ChartRowData = ChartMultipleSeriesDataRow[] | ChartDataRow[];

type ChartComponent = React.FC<{
    /** Data for the chart */
    data: ChartRowData;
    /** Title of x axis */
    xtitle?: string;
    /** Title of y axis */
    ytitle?: string;
    /** Width of the chart */
    width?: string | number;
    /** Height of the chart */
    height?: string | number;
    /** Show a download button, if this is a string, specify the name of downloaded file */
    download?: boolean | string;
    /**
     * Adds a suffix to your data
     *
     * e.g. for the data [["Z", 4]] and suffix "%", the chart will display "4%"
     */
    suffix?: string;
    /**
     * Adds a prefix to your data
     *
     * e.g. for the data [["Z", 4]] and prefix "$", the chart will display "$4"
     */
    prefix?: string;
    /** Discrete axis for line and column charts */
    discrete?: boolean;
    /** Only for type 'pie' */
    donut?: boolean;
    /** Straight lines between points instead of a curve */
    curve?: boolean;
    /** Colors array in hexadecimal or CSS Color keywords */
    colors?: string[];
    /** Minimum value (for y axis in most charts) */
    min?: number;
    /** Maximum value (for y axis in most charts) */
    max?: number;
    /** Stacked column / bar charts (usefull with multiple series) */
    stacked?: boolean;
    /** Set a thousands separator
     *
     * e.g. for the data [["Z", 4000]] and thousands="," the chart will display "4,000"
     */
    thousands?: string;
    /** Set a decimal separator
     *
     * e.g. for the data [["Z", 4.5]] and decimal="," the chart will display "4,5"
     */
    decimal?: string;
    /** Set significant digits */
    precision?: number;
    /** Set rounding */
    round?: number;
    /** Show insignificant zeros, useful for currency */
    zeros?: boolean;
    /** Specify the message when data is empty */
    empty?: string;
}>;

declare module "react-chartkick" {
    export const PieChart: ChartComponent;
    export const BarChart: ChartComponent;
    export const ColumnChart: ChartComponent;
    export const LineChart: ChartComponent;
    export const AreaChart: ChartComponent;
}
