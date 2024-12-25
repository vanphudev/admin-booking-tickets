import Chart from '@/components/chart/chart';
import useChart from '@/components/chart/useChart';

export default function ChartPie({ data }: { data: any }) {
   const groupedData = data.reduce((acc: any, item: any) => {
      const status = item.booking_status;
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status] += item.total_bookings;
      return acc;
    }, {});

    const series = Object.values(groupedData).map(value => ({ data: [value] })).map((item: any) => item.data[0]);

  const chartOptions = useChart({
    labels: ['Cancelled', 'Confirmed', 'Pending'],
    legend: {
      horizontalAlign: 'center',
    },
    stroke: {
      show: false,
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    tooltip: {
      fillSeriesColor: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: false,
          },
        },
      },
    },
  });

  return <Chart type="pie" series={series} options={chartOptions} height={320} />;
}
