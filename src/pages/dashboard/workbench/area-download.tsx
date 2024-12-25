import { Select, Typography } from 'antd';
import { useEffect, useState } from 'react';

import Card from '@/components/card';
import Chart from '@/components/chart/chart';
import useChart from '@/components/chart/useChart';
import { Customer } from '@/pages/users/customer/entity';

export default function AreaDownload({ customers }: { customers: Customer[] }) {
   const [year, setYear] = useState('2023');
   
   const [series, setSeries] = useState<Record<string, ApexAxisChartSeries>>({
      '2022': [],
      '2023': [],
   });

   useEffect(() => {
      const series = customers.map((customer) => ({
         name: customer.customer_full_name,
         data: [customer.customer_full_name],
      }));
   }, [customers]);

   return (
      <Card className="flex-col">
         <header className="flex w-full justify-between self-start">
            <Typography.Title level={5}>Thống kê lượng khách hàng tham gia theo tháng</Typography.Title>
            <Select
               size="small"
               defaultValue={year}
               onChange={(value) => setYear(value)}
               options={[
                  { value: 2023, label: '2023' },
                  { value: 2022, label: '2022' },
               ]}
            />
         </header>
         <main className="w-full">
            <ChartArea series={series[year]} />
         </main>
      </Card>
   );
}

function ChartArea({ series }: { series: ApexAxisChartSeries }) {
   const chartOptions = useChart({
      xaxis: {
         type: 'category',
         categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jut', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      tooltip: {},
   });

   return <Chart type="area" series={series} options={chartOptions} height={300} />;
}
