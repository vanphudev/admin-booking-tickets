import Chart from '@/components/chart/chart';
import useChart from '@/components/chart/useChart';

export default function ChartMixed({ data }: { data: any }) {
  // Xử lý dữ liệu đầu vào
  const processData = () => {
    const statuses = ['pending', 'confirmed', 'cancelled'];
    
    // Lấy danh sách tháng và sắp xếp theo thứ tự
    const months = [...new Set(data.map((item: any) => item.month))]
      .sort((a: unknown, b: unknown) => {
        const [yearA, monthA] = String(a).split('-');
        const [yearB, monthB] = String(b).split('-');
        return yearA === yearB ? 
          parseInt(monthA) - parseInt(monthB) : 
          parseInt(yearA) - parseInt(yearB);
      });

    const series = statuses.map((status) => ({
      name: status === 'pending' ? 'Chờ xác nhận' : 
            status === 'confirmed' ? 'Đã xác nhận' : 
            'Đã hủy',
      type: status === 'pending' ? 'column' : status === 'confirmed' ? 'area' : 'line',
      data: months.map((month) => {
        const item = data.find((d: any) => d.month === month && d.booking_status === status);
        return item ? item.total_bookings : 0;
      })
    }));
    
    // Format tháng hiển thị
    const formattedMonths = months.map((month: unknown) => {
      const [year, monthNum] = String(month).split('-');
      return `${parseInt(monthNum)}/${year}`;
    });

    return { series, months: formattedMonths };
  };

  const { series, months } = processData();

  const chartOptions = useChart({
    stroke: {
      width: [0, 2, 3],
    },
    plotOptions: {
      bar: { columnWidth: '20%' },
    },
    fill: {
      type: ['solid', 'gradient', 'solid'],
    },
    labels: months,
    xaxis: {
      type: 'category',
      categories: months,
      labels: {
        rotate: 0,
        style: {
          fontSize: '12px'
        },
        formatter: function(value: string) {
          return value; // Đã được format ở trên
        }
      }
    },
    yaxis: {
      title: { text: 'Số lượng' },
      min: 0,
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: (value: number) => {
          if (typeof value !== 'undefined') {
            return `${value.toFixed(0)} đơn`;
          }
          return value;
        },
      },
    },
  });

  return <Chart type="line" series={series} options={chartOptions} height={320} />;
}
