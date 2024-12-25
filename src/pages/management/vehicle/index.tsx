import { SearchOutlined } from '@ant-design/icons';
import {
   App,
   Button,
   Card,
   Popconfirm,
   Avatar,
   Alert,
   Table,
   Input,
   Space,
   Typography,
   Empty,
   Spin,
   Modal,
} from 'antd';
import { createStyles } from 'antd-style';
import { useRef, useState, useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import { IconButton, Iconify } from '@/components/icon';
import vehicleAPI from '@/redux/api/services/vehicleAPI';
import ProTag from '@/theme/antd/components/tag';
import { VehicleModal, type VehicleModalProps } from './vehicleModal';
import type { InputRef, TableColumnType } from 'antd';   
import type { ColumnsType } from 'antd/es/table';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/stores/store';
import { setVehiclesSlice } from '@/redux/slices/vehicleSlice';
import { Vehicle, MapVehicleLayout, VehicleType } from './entity';
import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { saveAs } from 'file-saver';

const { Text } = Typography;

const useStyle = createStyles(({ css }) => ({
   customTable: css`
      .ant-table {
         .ant-table-container {
            .ant-table-body,
            .ant-table-content {
               scrollbar-width: thin;
               scrollbar-color: #939393 transparent;
               scrollbar-gutter: stable;
            }
         }
      }
   `,
}));

const DEFAULT_VEHICLE_TYPE_VALUE: VehicleType = {
   id: 0,
   name: '',
   description: '',
};

const DEFAULT_MAP_VEHICLE_LAYOUT_VALUE: MapVehicleLayout = {
   id: 0,
   name: '',
   vehicle_type: DEFAULT_VEHICLE_TYPE_VALUE,
};

const DEFAULT_VEHICLE_VALUE: Vehicle = {
   id: 0,
   code: '',
   license_plate: '',
   model: '',
   brand: '',
   capacity: 0,
   manufacture_year: 0,
   color: '',
   description: '',
   isLocked: 0,
   lastLockAt: '',
   mapVehicleLayout: DEFAULT_MAP_VEHICLE_LAYOUT_VALUE,
   images: '',
   office_id: undefined,
};

function transformApiResponseToVehicle(apiResponse: any): Vehicle {
   const VEHICLE_TYPE: VehicleType = {
      id: apiResponse.vehicleType?.id,
      name: apiResponse.vehicleType?.name,
      description: apiResponse.vehicleType?.description,
   };
   const VEHICLE_LAYOUT: MapVehicleLayout = {
      id: apiResponse.mapVehicleLayout?.id,
      name: apiResponse.mapVehicleLayout?.name,
      vehicle_type: VEHICLE_TYPE,
   };

   return {
      id: apiResponse.id,
      code: apiResponse.code,
      license_plate: apiResponse.license_plate,
      model: apiResponse.model,
      brand: apiResponse.brand,
      capacity: apiResponse.capacity,
      manufacture_year: apiResponse.manufacture_year,
      color: apiResponse.color,
      description: apiResponse.description,
      isLocked: apiResponse.isLocked === 1 ? 1 : 0,
      lastLockAt: apiResponse.lastLockAt || '',
      mapVehicleLayout: VEHICLE_LAYOUT,
      images: apiResponse.images || '',
      office_id: apiResponse.officeId,
   };
}

type DataIndex = keyof Vehicle;

// function CopyButton({ value }: { value: string }) {
//    const { copyFn } = useCopyToClipboard();
//    return (
//       <Tooltip title="Copy">
//          <IconButton className="text-gray" onClick={() => copyFn(value)}>
//             <Iconify icon="eva:copy-fill" size={20} />
//          </IconButton>
//       </Tooltip>
//    );
// }

function AdvancedModal({
   showAdvancedModal,
   setShowAdvancedModal,
   handleExportExcel,
   handleExportDoc,
   handleExportPDF,
}: {
   showAdvancedModal: boolean;
   handleExportExcel: () => void;
   handleExportDoc: () => void;
   handleExportPDF: () => void;
   setShowAdvancedModal: (value: boolean) => void;
}) {
   return (
      <>
         <Modal
            title="Advanced Options"
            open={showAdvancedModal}
            onCancel={() => setShowAdvancedModal(false)}
            footer={null}
            centered
            style={{ width: '600px' }}
         >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '20px' }}>
               <Button
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '8px',
                  }}
               >
                  <Iconify icon="tabler:layout-filled" size={32} />
                  <span>Vehicle Layout</span>
               </Button>
               <Button
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '8px',
                  }}
               >
                  <Iconify icon="mdi:car-info" size={32} />
                  <span>Vehicle Type</span>
               </Button>
               <Button
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '8px',
                  }}
                  onClick={handleExportExcel}
               >
                  <Iconify icon="vscode-icons:file-type-excel" size={32} />
                  <span>Export Excel</span>
               </Button>
               <Button
                  size="large"
                  style={{
                     height: '100px',
                     display: 'flex',
                     flexDirection: 'column',
                     justifyContent: 'center',
                     alignItems: 'center',
                     gap: '8px',
                  }}
                  onClick={handleExportDoc}
               >
                  <Iconify icon="vscode-icons:file-type-word" size={32} />
                  <span>Export DOC</span>
               </Button>
            </div>
         </Modal>
      </>
   );
}

export default function VehiclePage() {
   const searchInput = useRef<InputRef>(null);
   const [searchText, setSearchText] = useState('');
   const [searchedColumn, setSearchedColumn] = useState('');
   const { notification } = App.useApp();
   const { styles } = useStyle();
   const [loading, setLoading] = useState(true);
   const [loadingDelete, setLoadingDelete] = useState(false);
   const [error, setError] = useState<Error | null>(null);
   const dispatch = useDispatch();

   const vehiclesSlice = useSelector((state: RootState) => state.vehicle.vehicles);
   const userInfo = useSelector((state: RootState) => state.user.userInfo);

   const handleSearch = (selectedKeys: string[], confirm: FilterDropdownProps['confirm'], dataIndex: DataIndex) => {
      confirm();
      setSearchText(selectedKeys[0]);
      setSearchedColumn(dataIndex);
   };

   const handleReset = (clearFilters: () => void) => {
      clearFilters();
      setSearchText('');
   };

   const handleDelete = (id: number) => {
      setLoadingDelete(true);
      vehicleAPI
         .deleteVehicle(id.toString())
         .then((res) => {
            if (res && res.status === 200) {
               refreshData();
               notification.success({
                  message: `Delete Vehicle Success by Id ${id} !`,
                  duration: 3,
               });
            } else {
               notification.error({
                  message: `Delete Vehicle Failed by Id ${id} !`,
                  duration: 3,
                  description: res.message,
               });
            }
         })
         .catch((error) => {
            notification.error({
               message: `Delete Vehicle Failed by Id ${id} !`,
               duration: 3,
               description: error.message,
            });
         })
         .finally(() => {
            setLoadingDelete(false);
         });
   };

   const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Vehicle> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
         <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
            <Input
               ref={searchInput}
               placeholder={`Search ${dataIndex}`}
               value={selectedKeys[0]}
               onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
               onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
               style={{ marginBottom: 8, display: 'block' }}
            />
            <Space>
               <Button
                  type="primary"
                  onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                  icon={<SearchOutlined />}
                  size="small"
                  style={{ width: 90 }}
               >
                  Search
               </Button>
               <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                  Reset
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     confirm({ closeDropdown: false });
                     setSearchText((selectedKeys as string[])[0]);
                     setSearchedColumn(dataIndex);
                  }}
               >
                  Filter
               </Button>
               <Button
                  type="link"
                  size="small"
                  onClick={() => {
                     close();
                  }}
               >
                  close
               </Button>
            </Space>
         </div>
      ),
      filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
      onFilter: (value, record) => {
         const text = record[dataIndex]?.toString().toLowerCase();
         return text ? text.includes((value as string).toLowerCase()) : false;
      },
      onFilterDropdownOpenChange: (visible) => {
         if (visible) {
            setTimeout(() => searchInput.current?.select(), 100);
         }
      },
      render: (text) =>
         searchedColumn === dataIndex ? (
            <Highlighter
               highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
               searchWords={[searchText]}
               autoEscape
               textToHighlight={text ? text.toString() : ''}
            />
         ) : (
            text
         ),
   });

   useEffect(() => {
      const fetchVehicles = async () => {
         setLoading(true);
         try {
            const res = await vehicleAPI.getVehicles();
            if (res) {
               dispatch(setVehiclesSlice(res.map(transformApiResponseToVehicle)));
            }
         } catch (error) {
            setError(error);
         } finally {
            setLoading(false);
         }
      };

      fetchVehicles();
   }, [dispatch]);

   const refreshData = async () => {
      try {
         const res = await vehicleAPI.getVehicles();
         if (res) {
            dispatch(setVehiclesSlice(res.map(transformApiResponseToVehicle)));
         }
      } catch (error) {
         setError(error);
      }
   };

   const [vehicleModalProps, setVehicleModalProps] = useState<VehicleModalProps>({
      formValue: {
         ...DEFAULT_VEHICLE_VALUE,
      },
      title: 'New Create Vehicle',
      show: false,
      isCreate: true,
      onOk: () => {
         refreshData();
         setVehicleModalProps((prev) => ({ ...prev, show: false }));
      },
      onCancel: () => {
         setVehicleModalProps((prev) => ({ ...prev, show: false }));
      },
   });

   const columns: ColumnsType<Vehicle> = [
      Table.EXPAND_COLUMN,
      {
         title: 'Code',
         dataIndex: 'code',
         ...getColumnSearchProps('code'),
         fixed: 'left',
         render: (code) => <Text>{code?.toString().toUpperCase()}</Text>,
         sorter: (a, b) => a.code.localeCompare(b.code),
      },
      {
         title: 'License Plate',
         dataIndex: 'license_plate',
         ...getColumnSearchProps('license_plate'),
         fixed: 'left',
      },
      {
         title: 'Images',
         dataIndex: 'images',
         align: 'center',
         render: (images) =>
            images && images.length > 0 ? (
               <Avatar size={50} shape="square" src={images} alt="Vehicle Image" />
            ) : (
               <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
      },
      {
         title: 'Capacity',
         dataIndex: 'capacity',
         align: 'center',
         sorter: (a, b) => a.capacity - b.capacity,
      },
      {
         title: 'Model',
         dataIndex: 'model',
         align: 'center',
      },
      {
         title: 'Brand',
         dataIndex: 'brand',
         align: 'center',
      },
      {
         title: 'Color',
         dataIndex: 'color',
         align: 'center',
      },
      {
         title: 'Lock Status',
         align: 'center',
         dataIndex: 'isLocked',
         filters: [
            { text: 'Locked', value: 1 },
            { text: 'Unlocked', value: 0 },
         ],
         onFilter: (value, record) => record.isLocked === value,
         render: (isLocked) => (
            <ProTag color={isLocked === 1 ? 'error' : 'success'}>{isLocked === 1 ? 'Locked' : 'Unlocked'}</ProTag>
         ),
      },
      {
         title: 'Action',
         key: 'operation',
         fixed: 'right',
         width: 100,
         render: (_, record) => (
            <Space>
               <IconButton onClick={() => onEdit(record)}>
                  <Iconify icon="solar:pen-bold-duotone" size={18} />
               </IconButton>
               <Popconfirm
                  title="Delete this vehicle?"
                  onConfirm={() => handleDelete(record.id || 0)}
                  okText="Yes"
                  cancelText="No"
               >
                  <IconButton>
                     <Iconify icon="mingcute:delete-2-fill" size={18} className="text-error" />
                  </IconButton>
               </Popconfirm>
            </Space>
         ),
      },
   ];

   const onCreate = () => {
      setVehicleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Create New Vehicle',
         isCreate: true,
         formValue: DEFAULT_VEHICLE_VALUE,
      }));
   };

   const onEdit = (formValue: Vehicle) => {
      setVehicleModalProps((prev) => ({
         ...prev,
         show: true,
         title: 'Edit Vehicle',
         isCreate: false,
         formValue,
      }));
   };

   const expandColumns: ColumnsType<Vehicle> = [
      {
         title: 'Layout Information',
         key: 'layout',
         render: (_, record) => (
            <div>
               <Text strong>Layout Name:</Text> {record.mapVehicleLayout?.name}
               <br />
               <Text strong>Type vehicle:</Text> {record.mapVehicleLayout?.vehicle_type?.name || ''}
            </div>
         ),
      },
      {
         title: 'Lock Status',
         align: 'center',
         key: 'lastLockAt',
         render: (_, record) => {
            const { isLocked, lastLockAt } = record;
            return (
               <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexDirection: 'column' }}>
                  {isLocked === 1 && lastLockAt && (
                     <>
                        <Iconify icon="fxemoji:lock" size={40} />
                        <Text mark>{dayjs(lastLockAt).format('DD/MM/YYYY HH:mm:ss')}</Text>
                     </>
                  )}
                  {isLocked === 0 && (
                     <Empty style={{ margin: 0 }} imageStyle={{ height: 30 }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}
               </div>
            );
         },
      },
   ];

   const renderExpandedRow = (record: Vehicle) => (
      <div>
         <Alert message="Description" description={record.description} type="info" />
         <Table<Vehicle> columns={expandColumns} dataSource={[record]} pagination={false} />
      </div>
   );

   const content = (
      <Table
         className={styles.customTable}
         rowKey={(record) => record.id?.toString() || ''}
         style={{ width: '100%', flex: 1 }}
         size="small"
         scroll={{ y: 'calc(100vh - 300px)' }}
         pagination={{
            size: 'default',
            total: vehiclesSlice?.length || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} items`,
         }}
         columns={columns}
         expandable={{ expandedRowRender: renderExpandedRow }}
         dataSource={error ? [] : vehiclesSlice}
         loading={loading}
      />
   );

   // const handleViewLayout = () => {
   //    setShowLayoutModal(true);
   // };

   // const handleViewType = () => {
   //    setShowTypeModal(true);
   // };

   const handleExportExcel = async () => {
      try {
         // Hiển thị loading
         setLoading(true);

         // 1. Tải template Excel
         const response = await fetch(
            'https://res.cloudinary.com/dkhkjaual/raw/upload/v1733475632/vehicle_template._muzar2.xlsx',
         );
         const templateBuffer = await response.arrayBuffer();

         // 2. Tạo workbook từ template
         const workbook = new ExcelJS.Workbook();
         await workbook.xlsx.load(templateBuffer);

         // 3. Lấy worksheet cần điền d liệu
         const worksheet = workbook.getWorksheet(1); // hoặc theo tên: workbook.getWorksheet('Sheet1');

         // 4. Điền dữ liệu vào template
         let rowIndex = 15; // Gi��� sử dữ liệu bắt đầu từ hàng 2
         vehiclesSlice.forEach((vehicle) => {
            const row = worksheet?.getRow(rowIndex);

            if (worksheet) {
               worksheet.getRow(10).getCell('H').value = dayjs().format('DD/MM/YYYY HH:mm:ss');
               worksheet.getRow(11).getCell('H').value =
                  String(userInfo?.fullName ?? '') + ' - ' + String(userInfo?.username ?? '');
               worksheet.getRow(12).getCell('H').value = 'Website - Chrome';
            }
            if (row && worksheet) {
               row.getCell('A').value = vehicle.code;
               row.getCell('A').value = vehicle.code;
               row.getCell('B').value = vehicle.license_plate;
               row.getCell('C').value = vehicle.model;
               row.getCell('D').value = vehicle.brand;
               row.getCell('E').value = vehicle.capacity;
               row.getCell('F').value = vehicle.manufacture_year;
               row.getCell('G').value = vehicle.color;
               row.getCell('H').value = vehicle.mapVehicleLayout?.name || '';
               row.getCell('I').value = vehicle.mapVehicleLayout?.vehicle_type?.name || '';
               row.getCell('J').value = vehicle.isLocked === 1 ? 'Locked' : 'Unlocked';

               // Định dạng các ô nếu cần
               row?.eachCell((cell) => {
                  cell.border = {
                     top: { style: 'thin' },
                     left: { style: 'thin' },
                     bottom: { style: 'thin' },
                     right: { style: 'thin' },
                  };
               });
            }

            rowIndex++;
         });

         // 6. Xuất file
         const buffer = await workbook.xlsx.writeBuffer();
         const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
         const blob = new Blob([buffer], { type: fileType });
         FileSaver.saveAs(blob, `Vehicle_List_${dayjs().format('DDMMYYYY_HHmmss')}.xlsx`);

         // Thông báo thành công
         notification.success({
            message: 'Xuất Excel thành công!',
            description: 'File đã được tải xuống.',
         });
      } catch (error) {
         // Xử lý lỗi
         notification.error({
            message: 'Xuất Excel thất bại!',
            description: error.message,
         });
      } finally {
         // Tắt loading
         setLoading(false);
      }
   };

   const handleExportDoc = async () => {
      try {
         setLoading(true);

         // 1. Tải template DOC
         const response = await fetch(
            'https://res.cloudinary.com/dkhkjaual/raw/upload/v1733479202/vehicle_template._wgkvep.docx',
         );
         const templateBuffer = await response.arrayBuffer();

         // 2. Tạo document từ template
         const zip = new PizZip(templateBuffer);
         const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
         });

         // 3. Điền dữ liệu vào template
         doc.render({
            date: dayjs().format('DD/MM/YYYY HH:mm:ss'),
            user: `${userInfo?.fullName ?? ''} - ${userInfo?.username ?? ''}`,
            platform: 'Website - Chrome',
            vehicles: vehiclesSlice.map((vehicle) => ({
               code: vehicle.code,
               license_plate: vehicle.license_plate,
               model: vehicle.model,
               brand: vehicle.brand,
               capacity: vehicle.capacity,
               // ... thêm các trường khác tương ứng với template
            })),
         });

         // 4. Xuất file
         const blob = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         });
         saveAs(blob, `Vehicle_List_${dayjs().format('DDMMYYYY_HHmmss')}.docx`);

         notification.success({
            message: 'Xuất DOC thành công!',
            description: 'File đã được tải xuống.',
         });
      } catch (error) {
         notification.error({
            message: 'Xuất DOC thất bại!',
            description: error.message,
         });
      } finally {
         setLoading(false);
      }
   };

   const handleExportPDF = async () => {
      try {
         setLoading(true);

         // 1. Tải template DOC
         const response = await fetch(
            'https://res.cloudinary.com/dkhkjaual/raw/upload/v1733479202/vehicle_template._wgkvep.docx',
         );
         const templateBuffer = await response.arrayBuffer();

         // 2. Tạo document từ template
         const zip = new PizZip(templateBuffer);
         const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
         });

         // 3. Điền dữ liệu vào template
         doc.render({
            date: dayjs().format('DD/MM/YYYY HH:mm:ss'),
            user: `${userInfo?.fullName ?? ''} - ${userInfo?.username ?? ''}`,
            platform: 'Website - Chrome',
            vehicles: vehiclesSlice.map((vehicle) => ({
               code: vehicle.code,
               license_plate: vehicle.license_plate,
               model: vehicle.model,
               brand: vehicle.brand,
               capacity: vehicle.capacity,
               layout_name: vehicle.mapVehicleLayout?.name || '',
               vehicle_type: vehicle.mapVehicleLayout?.vehicle_type?.name || '',
               status: vehicle.isLocked === 1 ? 'Locked' : 'Unlocked',
            })),
         });

         // 4. Xuất file DOCX
         const docxBlob = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         });

         // 5. Chuyển đổi và tải xuống trực tiếp
         saveAs(docxBlob, `Vehicle_List_${dayjs().format('DDMMYYYY_HHmmss')}.docx`);

         notification.success({
            message: 'Xuất file thành công!',
            description: 'File đã được tải xuống.',
         });
      } catch (error) {
         notification.error({
            message: 'Xuất file thất bại!',
            description: error.message,
         });
      } finally {
         setLoading(false);
      }
   };

   // const [showLayoutModal, setShowLayoutModal] = useState(false);
   // const [showTypeModal, setShowTypeModal] = useState(false);
   const [showAdvancedModal, setShowAdvancedModal] = useState(false);

   return (
      <>
         <Card
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
            title={<p style={{ fontSize: '25px', fontWeight: 'bold' }}>Danh sách xe khách - Bus</p>}
            extra={
               <Space size="middle">
                  <Button
                     size="large"
                     icon={<Iconify icon="vscode-icons:file-type-excel" size={16} />}
                     onClick={handleExportExcel}
                  >
                     Excel
                  </Button>
                  <Button
                     size="large"
                     icon={<Iconify icon="vscode-icons:file-type-word" size={16} />}
                     onClick={handleExportDoc}
                  >
                     DOC
                  </Button>
                  <Button
                     size="large"
                     icon={<Iconify icon="solar:menu-dots-bold" size={16} />}
                     onClick={() => setShowAdvancedModal(true)}
                  >
                     Advanced
                  </Button>
                  <Button size="large" type="primary" onClick={onCreate}>
                     New Vehicle
                  </Button>
               </Space>
            }
         >
            <Spin spinning={loadingDelete} tip="Deleting..." size="large" fullscreen />
            {content}
            <VehicleModal {...vehicleModalProps} />
         </Card>
         <AdvancedModal
            showAdvancedModal={showAdvancedModal}
            setShowAdvancedModal={setShowAdvancedModal}
            handleExportExcel={handleExportExcel}
            handleExportDoc={handleExportDoc}
            handleExportPDF={handleExportPDF}
         />
      </>
   );
}
