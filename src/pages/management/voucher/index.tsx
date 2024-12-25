import { Button, Card, Popconfirm, App, Spin } from 'antd';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import { IconButton, Iconify } from '@/components/icon';
import voucherAPI from '@/redux/api/services/voucherAPI';
import ProTag from '@/theme/antd/components/tag';
import { Voucher } from './entity';
import { VoucherModal } from './voucherModal';
import { useDispatch, useSelector } from 'react-redux';
import { setVouchersSlice } from '@/redux/slices/voucherSlice';
import { RootState } from '@/redux/stores/store';

const formatCurrency = (value?: number): string => {
   if (!value) return '0 ₫';
   return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
   }).format(value);
};

const formatDateTime = (value?: string): string => {
   if (!value) return '';
   return dayjs(value).format('DD/MM/YYYY HH:mm');
};

const DEFAULT_VOUCHER_VALUE: Voucher = {
   voucher_id: 0,
   voucher_code: '',
   voucher_discount_percentage: 0,
   voucher_discount_max_amount: 0,
   voucher_usage_limit: 1,
   voucher_valid_from: '',
   voucher_valid_to: '',
   voucher_created_by: {
      employee_id: 0,
      employee_full_name: '',
      employee_email: '',
      employee_phone: '',
   },
};

function transformApiResponseToVoucher(apiResponse: any): Voucher {
   return {
      voucher_id: apiResponse.voucher_id,
      voucher_code: apiResponse.voucher_code,
      voucher_discount_percentage: apiResponse.voucher_discount_percentage,
      voucher_discount_max_amount: apiResponse.voucher_discount_max_amount,
      voucher_usage_limit: apiResponse.voucher_usage_limit,
      voucher_valid_from: apiResponse.voucher_valid_from,
      voucher_valid_to: apiResponse.voucher_valid_to,
      voucher_created_by: {
         employee_id: apiResponse.voucher_created_by?.employee_id,
         employee_full_name: apiResponse.voucher_created_by?.employee_full_name,
         employee_email: apiResponse.voucher_created_by?.employee_email,
         employee_phone: apiResponse.voucher_created_by?.employee_phone,
      },
   };
}

export default function VoucherPage() {
   const { notification } = App.useApp();
   const [loading, setLoading] = useState(false);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const dispatch = useDispatch();
   const vouchers = useSelector((state: RootState) => state.voucher.vouchers);

   const fetchVoucherList = async () => {
      setLoading(true);
      try {
         await voucherAPI.getAllVouchers().then((data) => {
            if (data) {
               dispatch(setVouchersSlice(data.map(transformApiResponseToVoucher)));
            }
         });
      } catch (error) {
         console.log(error);
      } finally {
         setLoading(false);
      }     
   };

   useEffect(() => {
      fetchVoucherList();
   }, []);

   const [voucherModalProps, setVoucherModalProps] = useState({
      formValue: {
         ...DEFAULT_VOUCHER_VALUE,
      },
      title: 'New',
      show: false,
      isCreate: true,
      onOk: () => {
         fetchVoucherList();
         setVoucherModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setVoucherModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Voucher> = [
      {
         title: 'Mã voucher',
         dataIndex: 'voucher_code',
         fixed: 'left',
         width: 150,
         render: (value) => value.replace(/(?<=^.{4}).*(?=.{4}$)/g, '*******'),
      },
      {
         title: 'Tỉ lệ giảm giá',
         dataIndex: 'voucher_discount_percentage',
         width: 100,
         render: (value) => `${value}%`,
      },
      {
         title: 'Hóa đơn tối thiểu',
         dataIndex: 'voucher_discount_max_amount',
         width: 150,
         render: (value) => formatCurrency(value),
      },
      {
         title: 'Số lượng',
         dataIndex: 'voucher_usage_limit',
         width: 100,
         align: 'center',
      },
      {
         title: 'Thời gian hiệu lực',
         key: 'validTime',
         width: 300,
         render: (_, record) => (
            <div>
               <ProTag color="processing">Từ: {formatDateTime(record.voucher_valid_from)}</ProTag>
               <ProTag color="warning" style={{ marginLeft: 8 }}>
                  Đến: {formatDateTime(record.voucher_valid_to)}
               </ProTag>
            </div>
         ),
      },
      {
         title: 'Người tạo',
         dataIndex: 'voucher_created_by',
         width: 200,
         align: 'center',
         render: (value) => `${value.employee_full_name || 'Hệ thống'} (${value.employee_email || ''})`,
      },
      {
         title: 'Thao tác',
         key: 'operation',
         fixed: 'right',
         width: 120,
         align: 'center',
         render: (_, record) => (
            <div className="flex w-full justify-center gap-2">
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Xóa voucher?"
                  description="Bạn có chắc chắn muốn xóa voucher này?"
                  okText="Xóa"
                  cancelText="Hủy"
                  placement="left"
                  onConfirm={() => handleDelete(record.voucher_code)}
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </div>
         ),
      },
   ];

   const onCreate = () => {
      setVoucherModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Tạo Voucher Mới',
         isCreate: true,
         formValue: DEFAULT_VOUCHER_VALUE,
      }));
   };

   const onEdit = (formValue: Voucher) => {
      setVoucherModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Chỉnh Sửa Voucher',
         isCreate: false,
         formValue,
      }));
   };

   const handleDelete = async (voucher_code: string) => {
      try {
         setLoadingDelete(true);
         await voucherAPI.deleteVoucher({voucher_code: voucher_code});
         notification.success({
            message: 'Xóa voucher thành công',
            description: 'Voucher đã được xóa thành công!',
            duration: 3,
         });
         fetchVoucherList();
      } catch (error) {
         notification.error({
            message: 'Lỗi khi xóa voucher',
            description: 'Voucher không được xóa!',
            duration: 3,
         });
      } finally {
         setLoadingDelete(false);
      }
   };

   const content = (
      <>
         <Table
            rowKey="voucher_id"
            size="small"
            scroll={{ x: 'max-content' }}
            pagination={{
               size: 'default',
               total: vouchers?.length || 0,
               showSizeChanger: true,
               showQuickJumper: true,
               showTotal: (total) => `Tổng ${total} voucher`,
            }}
            columns={columns}
            dataSource={vouchers}
            loading={loading}
         />
      </>
   );

   return (
      <>
         <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
            title="Voucher List"
            extra={
               <Button size="large" type="primary" onClick={onCreate}>
                  Tạo Voucher
               </Button>
            }
         >  
            <Spin spinning={loading || loadingDelete} tip="Loading ..." size="large" fullscreen>
               {loading && content}
            </Spin>
            {content}
         </Card>
         <VoucherModal {...voucherModalProps} />
      </>
   );
}
